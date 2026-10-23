import type {
  Punctuality,
  RouteMatrixCell,
  RouteMatrixColumn,
  RouteMatrixRow,
  RouteSummary,
  Station,
  StationBoardItem,
  StopEvent,
  StopState,
  Train,
  TrainStatus,
} from "../types";
import { routes as catalogRoutes } from "../data/routes";
import type { AmtrakerStationMeta, AmtrakerStop, AmtrakerTrain } from "./types";

const routeByNumber = new Map<string, { slug: string; name: string }>();
for (const route of catalogRoutes) {
  for (const number of route.trainNumbers) {
    routeByNumber.set(number, { slug: route.slug, name: route.name });
  }
}

const TZ_ABBR: Record<string, string> = {
  "America/New_York": "ET",
  "America/Chicago": "CT",
  "America/Denver": "MT",
  "America/Phoenix": "MST",
  "America/Los_Angeles": "PT",
  "America/Anchorage": "AKT",
  "Pacific/Honolulu": "HT",
  "America/Toronto": "ET",
  "America/Winnipeg": "CT",
  "America/Edmonton": "MT",
  "America/Vancouver": "PT",
};

/** Known RailRat-style slugs for stable URLs */
export const ROUTE_SLUGS: Record<string, string> = {
  "Acela Express": "acela-express",
  Adirondack: "adirondack",
  "Amtrak Cascades": "amtrak-cascades",
  "Auto Train": "auto-train",
  Borealis: "borealis",
  "California Zephyr": "california-zephyr",
  "Capitol Corridor": "capitol-corridor",
  Cardinal: "cardinal",
  "Carolinian / Piedmont": "carolinian-piedmont",
  Carolinian: "carolinian-piedmont",
  Piedmont: "carolinian-piedmont",
  "City of New Orleans": "city-of-new-orleans",
  "Coast Starlight": "coast-starlight",
  Crescent: "crescent",
  Downeaster: "downeaster",
  "Empire Builder": "empire-builder",
  "Empire Service": "empire-service",
  "Ethan Allen Express": "ethan-allen-express",
  Floridian: "floridian",
  "Gold Runner": "gold-runner",
  "San Joaquins": "gold-runner",
  "Heartland Flyer": "heartland-flyer",
  Hiawatha: "hiawatha",
  Illini: "saluki-illinois",
  Saluki: "saluki-illinois",
  "Lincoln Service": "lincoln-illinois",
  "Illinois Zephyr": "illinois-zephyr",
  "Carl Sandburg": "illinois-zephyr",
  Keystone: "keystone",
  "Lake Shore Limited": "lake-shore-limited",
  "Maple Leaf": "maple-leaf",
  "Mardi Gras Service": "mardi-gras",
  "Berkshire Flyer": "berkshire-flyer",
  "Blue Water": "blue-water",
  "Pere Marquette": "pere-marquette",
  Wolverine: "wolverine",
  "Missouri River Runner": "missouri-river-runner",
  "Northeast Regional": "northeast-regional",
  "Pacific Surfliner": "pacific-surfliner",
  Pennsylvanian: "pennsylvanian",
  "Silver Meteor": "silver-meteor",
  Palmetto: "silver-palmetto",
  "Silver Service / Palmetto": "silver-palmetto",
  "Southwest Chief": "southwest-chief",
  "Sunset Limited": "sunset-limited",
  "Texas Eagle": "texas-eagle",
  Vermonter: "vermonter",
};

export function slugifyRoute(name: string): string {
  if (ROUTE_SLUGS[name]) return ROUTE_SLUGS[name];
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatClock(value: string | null | undefined): string | undefined {
  const d = parseDate(value);
  if (!d) return undefined;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: guessTzFromIso(value),
  });
}

function formatDateShort(value: string | null | undefined): string {
  const d = parseDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    timeZone: guessTzFromIso(value),
  });
}

function guessTzFromIso(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  // Prefer explicit offset formatting via the ISO string's local fields
  return undefined;
}

function minutesBetween(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 60000);
}

export function punctualityFromTimes(
  actualOrEst: string | null | undefined,
  scheduled: string | null | undefined,
  state: StopState,
): Punctuality {
  const actual = parseDate(actualOrEst);
  const sch = parseDate(scheduled);
  if (!actual || !sch) {
    return state === "upcoming" || state === "en_route"
      ? { kind: "scheduled" }
      : { kind: "on_time" };
  }
  const delta = minutesBetween(actual, sch);
  if (Math.abs(delta) <= 2) return { kind: "on_time" };
  if (delta < 0) return { kind: "early", minutes: Math.abs(delta) };
  return { kind: "late", minutes: delta };
}

function mapTrainStatus(state: string): TrainStatus {
  switch (state) {
    case "Active":
      return "active";
    case "Completed":
      return "complete";
    case "Predeparture":
      return "pending";
    default:
      return "pending";
  }
}

function mapDirection(
  heading: string,
  originCode: string,
  destCode: string,
): Train["direction"] {
  const h = heading.toUpperCase();
  if (h.includes("E") && !h.includes("W")) return "eastbound";
  if (h.includes("W") && !h.includes("E")) return "westbound";
  if (h.includes("N") && !h.includes("S")) return "northbound";
  if (h.includes("S") && !h.includes("N")) return "southbound";
  // crude fallback by code order
  return originCode < destCode ? "eastbound" : "westbound";
}

function mapStopState(
  stop: AmtrakerStop,
  eventCode: string,
): StopState {
  switch (stop.status) {
    case "Departed":
      return "departed";
    case "Station":
      return "arrived";
    case "Enroute":
      return stop.code === eventCode ? "en_route" : "upcoming";
    default:
      return "upcoming";
  }
}

function mapStop(stop: AmtrakerStop, eventCode: string): StopEvent {
  const state = mapStopState(stop, eventCode);
  const refTime =
    state === "departed" || state === "arrived"
      ? stop.dep || stop.arr
      : stop.arr || stop.dep;
  const scheduled = stop.schDep || stop.schArr;

  const event: StopEvent = {
    stationCode: stop.code,
    stationName: stop.name,
    state,
    punctuality: punctualityFromTimes(refTime, scheduled, state),
    timezone: TZ_ABBR[stop.tz] ?? undefined,
  };

  if (stop.schArr) event.scheduledArrival = formatClock(stop.schArr);
  if (stop.schDep) event.scheduledDeparture = formatClock(stop.schDep);

  if (state === "departed" || state === "arrived") {
    if (stop.arr) event.actualArrival = formatClock(stop.arr);
    if (stop.dep) event.actualDeparture = formatClock(stop.dep);
  } else {
    if (stop.arr) event.estimatedArrival = formatClock(stop.arr);
    if (stop.dep) event.estimatedDeparture = formatClock(stop.dep);
  }

  return event;
}

export function mapTrain(raw: AmtrakerTrain): Train {
  const originStop = raw.stations[0];
  const originTime =
    formatClock(originStop?.dep || originStop?.schDep || originStop?.schArr) ??
    "–";
  const originDate = formatDateShort(
    originStop?.dep || originStop?.schDep || originStop?.schArr,
  );

  const speed =
    typeof raw.velocity === "number" && raw.velocity > 0
      ? Math.round(raw.velocity)
      : undefined;

  const locationLabel =
    raw.trainState === "Predeparture"
      ? `Awaiting departure from ${raw.origName}`
      : raw.trainState === "Completed"
        ? `Arrived ${raw.destName}`
        : raw.eventName
          ? `Near ${raw.eventName} [${raw.eventCode}]`
          : undefined;

  const positions =
    raw.trainState === "Active" && locationLabel
      ? [
          {
            time:
              formatClock(raw.lastValTS) ??
              formatClock(raw.updatedAt) ??
              "–",
            description: locationLabel,
            speedMph: speed,
          },
        ]
      : [];

  const number = String(raw.trainNumRaw || raw.trainNum);
  const catalog = routeByNumber.get(number);

  return {
    id: raw.trainID,
    number,
    routeSlug: catalog?.slug ?? slugifyRoute(raw.routeName),
    routeName: catalog?.name ?? raw.routeName,
    status: mapTrainStatus(raw.trainState),
    direction: mapDirection(raw.heading, raw.origCode, raw.destCode),
    originCode: raw.origCode,
    destinationCode: raw.destCode,
    originTime,
    originDate,
    speedMph: speed,
    locationLabel,
    updatedAt: raw.updatedAt || raw.lastValTS,
    stops: raw.stations.map((s) => mapStop(s, raw.eventCode)),
    positions,
    hasRecentUpdate: raw.trainState === "Active",
    heading: raw.heading,
    provider: raw.provider,
  };
}

export function mapStation(raw: AmtrakerStationMeta): Station {
  return {
    code: raw.code,
    name: raw.state ? `${raw.name}, ${raw.state}` : raw.name,
    city: (raw.city || raw.name).trim(),
    state: (raw.state || "").trim(),
  };
}

export function buildRouteSummaries(trains: Train[]): RouteSummary[] {
  const bySlug = new Map<string, RouteSummary>();

  for (const train of trains) {
    let route = bySlug.get(train.routeSlug);
    if (!route) {
      route = {
        slug: train.routeSlug,
        name: train.routeName,
        active: 0,
        complete: 0,
        pending: 0,
        trainNumbers: [],
      };
      bySlug.set(train.routeSlug, route);
    }
    if (train.status === "active") route.active += 1;
    else if (train.status === "complete") route.complete += 1;
    else route.pending += 1;
    if (!route.trainNumbers.includes(train.number)) {
      route.trainNumbers.push(train.number);
    }
  }

  for (const route of bySlug.values()) {
    route.trainNumbers.sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function buildStationBoard(
  code: string,
  trains: Train[],
): StationBoardItem[] {
  const upper = code.toUpperCase();
  const items: StationBoardItem[] = [];

  for (const train of trains) {
    const stopIndex = train.stops.findIndex((s) => s.stationCode === upper);
    if (stopIndex < 0) continue;
    const stop = train.stops[stopIndex];

    if (stop.state === "departed") {
      items.push({
        trainNumber: train.number,
        routeName: train.routeName,
        time: stop.actualDeparture || stop.actualArrival || "–",
        punctuality: stop.punctuality,
        kind: "departed",
        trainId: train.id,
      });
      continue;
    }

    if (train.status === "complete") continue;

    const isNext =
      stop.state === "en_route" ||
      stop.state === "arrived" ||
      (stop.state === "upcoming" &&
        train.stops.findIndex(
          (s) => s.state === "en_route" || s.state === "arrived" || s.state === "upcoming",
        ) === stopIndex);

    if (!isNext) continue;

    items.push({
      trainNumber: train.number,
      routeName: train.routeName,
      time:
        stop.estimatedArrival ||
        stop.estimatedDeparture ||
        stop.scheduledArrival ||
        stop.scheduledDeparture ||
        "–",
      punctuality: stop.punctuality,
      kind: "arriving",
      trainId: train.id,
    });
  }

  const rank = (t: string) => {
    const [hh, mm] = t.split(":").map(Number);
    return (hh || 0) * 60 + (mm || 0);
  };

  return items.sort((a, b) => rank(a.time) - rank(b.time));
}

export function buildRouteMatrix(trains: Train[]): {
  columns: RouteMatrixColumn[];
  rows: RouteMatrixRow[];
} | null {
  const active = trains.filter((t) => t.status === "active" || t.status === "pending");
  if (active.length === 0) return null;

  // Prefer the train with the richest stop list as the spine
  const spine = [...active].sort(
    (a, b) => b.stops.length - a.stops.length,
  )[0];
  const stationOrder = spine.stops.map((s) => s.stationCode);

  const columns: RouteMatrixColumn[] = active.map((train) => {
    const dirArrow =
      train.direction === "westbound" || train.direction === "northbound"
        ? "↑"
        : "↓";
    return {
      trainNumber: train.number,
      direction: dirArrow,
      speedMph: train.speedMph,
      status: train.status,
      trainId: train.id,
    };
  });

  const rows: RouteMatrixRow[] = stationOrder.map((stationCode) => {
    const cells: RouteMatrixCell[] = active.map((train) => {
      const stop = train.stops.find((s) => s.stationCode === stationCode);
      if (!stop) return { marker: "pass" as const };
      const time =
        stop.actualDeparture ||
        stop.actualArrival ||
        stop.estimatedDeparture ||
        stop.estimatedArrival ||
        stop.scheduledDeparture ||
        stop.scheduledArrival;
      if (!time) return { marker: "empty" as const };
      return {
        time,
        punctuality: stop.punctuality,
      };
    });
    return { stationCode, cells };
  });

  return { columns, rows };
}

export function pickBestTrain(
  candidates: Train[],
): Train | undefined {
  if (candidates.length === 0) return undefined;
  const rank = (t: Train) =>
    t.status === "active" ? 0 : t.status === "pending" ? 1 : 2;
  return [...candidates].sort((a, b) => rank(a) - rank(b))[0];
}
