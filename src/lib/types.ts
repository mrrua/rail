export type TrainStatus = "active" | "complete" | "pending";

export type Punctuality =
  | { kind: "on_time" }
  | { kind: "early"; minutes: number }
  | { kind: "late"; minutes: number }
  | { kind: "scheduled" };

export type StopState = "departed" | "arrived" | "en_route" | "upcoming" | "skipped";

export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
  connections?: string[];
}

export interface RouteSummary {
  slug: string;
  name: string;
  active: number;
  complete: number;
  pending: number;
  trainNumbers: string[];
}

export interface StopEvent {
  stationCode: string;
  stationName?: string;
  state: StopState;
  scheduledArrival?: string;
  scheduledDeparture?: string;
  actualArrival?: string;
  actualDeparture?: string;
  estimatedArrival?: string;
  estimatedDeparture?: string;
  punctuality: Punctuality;
  timezone?: string;
}

export interface PositionUpdate {
  time: string;
  description: string;
  speedMph?: number;
}

export interface Train {
  id: string;
  number: string;
  routeSlug: string;
  routeName: string;
  status: TrainStatus;
  direction: "eastbound" | "westbound" | "northbound" | "southbound";
  originCode: string;
  destinationCode: string;
  originTime: string;
  originDate: string;
  speedMph?: number;
  locationLabel?: string;
  milesFromOrigin?: number;
  milesToDestination?: number;
  updatedAt: string;
  stops: StopEvent[];
  positions: PositionUpdate[];
  hasRecentUpdate?: boolean;
  heading?: string;
  provider?: string;
}

export interface StationBoardItem {
  trainNumber: string;
  routeName: string;
  time: string;
  punctuality: Punctuality;
  kind: "arriving" | "departed";
  trainId?: string;
}

export interface RouteMatrixCell {
  time?: string;
  punctuality?: Punctuality;
  marker?: "pass" | "empty";
  dateNote?: string;
}

export interface RouteMatrixColumn {
  trainNumber: string;
  direction: "↑" | "↓";
  speedMph?: number;
  status: TrainStatus;
  trainId?: string;
}

export interface RouteMatrixRow {
  stationCode: string;
  cells: RouteMatrixCell[];
}
