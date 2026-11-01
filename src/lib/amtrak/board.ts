import { connection } from "next/server";
import { routes as catalogRoutes } from "../data/routes";
import type { RouteSummary, Station, StationBoardItem, Train } from "../types";
import { fetchAmtrakerStations, fetchAmtrakerTrains } from "./client";
import {
  buildRouteMatrix,
  buildRouteSummaries,
  buildStationBoard,
  mapStation,
  mapTrain,
  pickBestTrain,
  slugifyRoute,
} from "./map";
import { retainTrains } from "./retain";

export type LiveBoard = {
  source: "live" | "fallback";
  updatedAt: string;
  trains: Train[];
  routes: RouteSummary[];
  stations: Station[];
  stationByCode: Record<string, Station>;
  error?: string;
};

// Demand-load a normalized snapshot per server process. There is no timer: the
// first data request loads it and a later request refreshes it after the TTL.
const BOARD_TTL_MS = 60_000;
const RETRY_TTL_MS = 15_000;
type BoardCache = {
  board?: LiveBoard;
  expiresAt: number;
  refreshing?: Promise<LiveBoard>;
};
type RailGlobal = typeof globalThis & { __railBoardCache?: BoardCache };

function getBoardCache(): BoardCache {
  const root = globalThis as RailGlobal;
  return (root.__railBoardCache ??= { expiresAt: 0 });
}

function emptyBoard(error?: string): LiveBoard {
  return {
    source: "fallback",
    updatedAt: new Date().toISOString(),
    trains: [],
    routes: catalogRoutes.map((r) => ({ ...r, active: 0, complete: 0, pending: 0 })),
    stations: [],
    stationByCode: {},
    error,
  };
}

function mergeRouteCatalog(live: RouteSummary[]): RouteSummary[] {
  const bySlug = new Map(live.map((r) => [r.slug, { ...r }]));
  for (const catalog of catalogRoutes) {
    const existing = bySlug.get(catalog.slug);
    if (!existing) {
      bySlug.set(catalog.slug, { ...catalog, active: 0, complete: 0, pending: 0 });
      continue;
    }
    const numbers = new Set([...existing.trainNumbers, ...catalog.trainNumbers]);
    existing.trainNumbers = [...numbers].sort(
      (a, b) => Number(a) - Number(b) || a.localeCompare(b),
    );
    existing.name = catalog.name || existing.name;
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function buildLiveBoard(): Promise<LiveBoard> {
  try {
    const [trainResponse, stationResponse] = await Promise.all([
      fetchAmtrakerTrains(),
      fetchAmtrakerStations(),
    ]);
    const rawTrains = Object.values(trainResponse)
      .flat()
      .filter((t) => t.provider === "Amtrak" || t.providerShort === "AMTK");
    const trains = await retainTrains(rawTrains.map(mapTrain));
    const routes = mergeRouteCatalog(buildRouteSummaries(trains));
    const stations = Object.values(stationResponse)
      .filter((s) => Boolean(s?.code))
      .map(mapStation)
      .sort((a, b) => a.name.localeCompare(b.name));
    const stationByCode = Object.fromEntries(stations.map((s) => [s.code, s]));

    // Include stop stations omitted from Amtraker's station metadata.
    for (const train of trains) {
      for (const stop of train.stops) {
        if (!stationByCode[stop.stationCode]) {
          const name = stop.stationName ?? stop.stationCode;
          const stub: Station = {
            code: stop.stationCode,
            name,
            city: name,
            state: "",
          };
          stations.push(stub);
          stationByCode[stop.stationCode] = stub;
        }
      }
    }

    const updatedAt =
      trains.map((t) => t.updatedAt).filter(Boolean).sort().at(-1) ??
      new Date().toISOString();
    return { source: "live", updatedAt, trains, routes, stations, stationByCode };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Amtraker error";
    console.error("[amtraker]", message);
    return emptyBoard(message);
  }
}

/** Return the process snapshot; only an expired/missing snapshot causes a load. */
export async function getLiveBoard(): Promise<LiveBoard> {
  // The board cache uses the current clock to enforce its TTL. Treat it as
  // request-time data instead of evaluating that clock during static prerender.
  // Callers render this beneath Suspense, so static shells can still be built.
  await connection();

  const cache = getBoardCache();
  if (cache.board && Date.now() < cache.expiresAt) return cache.board;
  // Concurrent references share a refresh. While refreshing an expired snapshot,
  // other requests can use it; the request that started the refresh awaits it.
  if (cache.refreshing) return cache.board ?? cache.refreshing;

  const previous = cache.board;
  cache.refreshing = buildLiveBoard()
    .then((fresh) => {
      // Keep the last good data if the upstream is temporarily unavailable.
      cache.board = fresh.source === "live" || !previous
        ? fresh
        : { ...previous, error: fresh.error };
      cache.expiresAt = Date.now() +
        (fresh.source === "live" ? BOARD_TTL_MS : RETRY_TTL_MS);
      return cache.board;
    })
    .catch((err: unknown) => {
      const message = err instanceof Error ? err.message : "Unknown board error";
      console.error("[board] refresh failed", message);
      cache.board ??= emptyBoard(message);
      cache.expiresAt = Date.now() + RETRY_TTL_MS;
      return cache.board;
    })
    .finally(() => {
      cache.refreshing = undefined;
    });

  return cache.refreshing;
}

export async function getRoutes(): Promise<RouteSummary[]> {
  return (await getLiveBoard()).routes;
}

export async function getSystemTotals() {
  const routes = await getRoutes();
  return routes.reduce(
    (acc, r) => {
      acc.active += r.active;
      acc.complete += r.complete;
      acc.pending += r.pending;
      return acc;
    },
    { active: 0, complete: 0, pending: 0, routes: routes.length },
  );
}

export async function getRoute(slug: string): Promise<RouteSummary | undefined> {
  return (await getRoutes()).find((r) => r.slug === slug);
}

export async function getStations(): Promise<Station[]> {
  return (await getLiveBoard()).stations;
}

export async function getStation(code: string): Promise<Station | undefined> {
  return (await getLiveBoard()).stationByCode[code.toUpperCase()];
}

export async function getTrains(): Promise<Train[]> {
  return (await getLiveBoard()).trains;
}

export async function getTrain(numberOrId: string): Promise<Train | undefined> {
  const board = await getLiveBoard();
  const key = decodeURIComponent(numberOrId);
  const byId = board.trains.find((t) => t.id === key);
  if (byId) return byId;
  return pickBestTrain(board.trains.filter((t) => t.number === key));
}

export async function trainsForRoute(slug: string): Promise<Train[]> {
  return (await getLiveBoard()).trains.filter((t) => t.routeSlug === slug);
}

export async function activeTrains(): Promise<Train[]> {
  return (await getLiveBoard()).trains.filter((t) => t.status === "active");
}

export async function trainsGroupedByRoute(): Promise<
  { route: RouteSummary; trains: Train[] }[]
> {
  const board = await getLiveBoard();
  return board.routes
    .map((route) => ({
      route,
      trains: board.trains.filter((t) => t.routeSlug === route.slug),
    }))
    .filter((g) => g.route.trainNumbers.length > 0 || g.trains.length > 0);
}

export async function stationBoard(code: string): Promise<StationBoardItem[]> {
  const board = await getLiveBoard();
  return buildStationBoard(code, board.trains).map((item) => {
    const train = item.trainId
      ? board.trains.find((t) => t.id === item.trainId)
      : undefined;
    if (!train) return item;
    return {
      ...item,
      fromLabel: board.stationByCode[train.originCode]?.city ?? train.originCode,
      toLabel:
        board.stationByCode[train.destinationCode]?.city ?? train.destinationCode,
    };
  });
}

export async function routeMatrix(slug: string) {
  return buildRouteMatrix(await trainsForRoute(slug));
}

export async function getBoardMeta() {
  const board = await getLiveBoard();
  return { source: board.source, updatedAt: board.updatedAt, error: board.error };
}

export function routeSlugForName(name: string): string {
  return slugifyRoute(name);
}
