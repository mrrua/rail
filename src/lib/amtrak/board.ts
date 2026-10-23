import { cache } from "react";
import { routes as catalogRoutes } from "../data/routes";
import type {
  RouteSummary,
  Station,
  StationBoardItem,
  Train,
} from "../types";
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
      bySlug.set(catalog.slug, {
        ...catalog,
        active: 0,
        complete: 0,
        pending: 0,
      });
      continue;
    }
    // Keep live counts; union train numbers
    const numbers = new Set([...existing.trainNumbers, ...catalog.trainNumbers]);
    existing.trainNumbers = [...numbers].sort(
      (a, b) => Number(a) - Number(b) || a.localeCompare(b),
    );
    existing.name = catalog.name || existing.name;
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export const getLiveBoard = cache(async (): Promise<LiveBoard> => {
  try {
    const [trainResponse, stationResponse] = await Promise.all([
      fetchAmtrakerTrains(),
      fetchAmtrakerStations(),
    ]);

    const rawTrains = Object.values(trainResponse)
      .flat()
      .filter((t) => t.provider === "Amtrak" || t.providerShort === "AMTK");

    const trains = await retainTrains(rawTrains.map(mapTrain));
    const liveRoutes = buildRouteSummaries(trains);
    const routes = mergeRouteCatalog(liveRoutes);

    const stations = Object.values(stationResponse)
      .filter((s) => Boolean(s?.code))
      .map(mapStation)
      .sort((a, b) => a.name.localeCompare(b.name));

    const stationByCode = Object.fromEntries(stations.map((s) => [s.code, s]));

    // Ensure stations referenced by trains exist even if meta missing
    for (const train of trains) {
      for (const stop of train.stops) {
        if (!stationByCode[stop.stationCode]) {
          const stub: Station = {
            code: stop.stationCode,
            name: stop.stationName ?? stop.stationCode,
            city: stop.stationName ?? stop.stationCode,
            state: "",
          };
          // Prefer richer names from the train stop list
          const fromStop = train.stops.find((s) => s.stationCode === stop.stationCode);
          if (fromStop?.stationName) {
            stub.name = fromStop.stationName;
            stub.city = fromStop.stationName;
          }
          stations.push(stub);
          stationByCode[stop.stationCode] = stub;
        }
      }
    }

    const updatedAt =
      trains
        .map((t) => t.updatedAt)
        .filter(Boolean)
        .sort()
        .at(-1) ?? new Date().toISOString();

    return {
      source: "live",
      updatedAt,
      trains,
      routes,
      stations,
      stationByCode,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Amtraker error";
    console.error("[amtraker]", message);
    return emptyBoard(message);
  }
});

export async function getRoutes(): Promise<RouteSummary[]> {
  const board = await getLiveBoard();
  return board.routes;
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
  const routes = await getRoutes();
  return routes.find((r) => r.slug === slug);
}

export async function getStations(): Promise<Station[]> {
  const board = await getLiveBoard();
  return board.stations;
}

export async function getStation(code: string): Promise<Station | undefined> {
  const board = await getLiveBoard();
  return board.stationByCode[code.toUpperCase()];
}

export async function getTrains(): Promise<Train[]> {
  const board = await getLiveBoard();
  return board.trains;
}

export async function getTrain(numberOrId: string): Promise<Train | undefined> {
  const board = await getLiveBoard();
  const key = decodeURIComponent(numberOrId);

  const byId = board.trains.find((t) => t.id === key);
  if (byId) return byId;

  const matches = board.trains.filter((t) => t.number === key);
  return pickBestTrain(matches);
}

export async function trainsForRoute(slug: string): Promise<Train[]> {
  const board = await getLiveBoard();
  return board.trains.filter((t) => t.routeSlug === slug);
}

export async function activeTrains(): Promise<Train[]> {
  const board = await getLiveBoard();
  return board.trains.filter((t) => t.status === "active");
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
      fromLabel:
        board.stationByCode[train.originCode]?.city ?? train.originCode,
      toLabel:
        board.stationByCode[train.destinationCode]?.city ??
        train.destinationCode,
    };
  });
}

export async function routeMatrix(slug: string) {
  const trains = await trainsForRoute(slug);
  return buildRouteMatrix(trains);
}

export async function getBoardMeta() {
  const board = await getLiveBoard();
  return {
    source: board.source,
    updatedAt: board.updatedAt,
    error: board.error,
  };
}

export function routeSlugForName(name: string): string {
  return slugifyRoute(name);
}
