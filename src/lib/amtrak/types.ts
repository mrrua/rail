export interface AmtrakerStop {
  name: string;
  code: string;
  tz: string;
  bus: boolean;
  schArr: string | null;
  schDep: string | null;
  arr: string | null;
  dep: string | null;
  arrCmnt?: string;
  depCmnt?: string;
  status: "Departed" | "Station" | "Enroute" | "Unknown" | string;
  stopIconColor?: string;
  platform?: string;
}

export interface AmtrakerTrain {
  routeName: string;
  trainNum: string;
  trainNumRaw: string;
  trainID: string;
  lat: number;
  lon: number;
  iconColor?: string;
  stations: AmtrakerStop[];
  heading: string;
  eventCode: string;
  eventTZ: string;
  eventName: string;
  origCode: string;
  originTZ: string;
  origName: string;
  destCode: string;
  destTZ: string;
  destName: string;
  trainState: "Active" | "Predeparture" | "Completed" | string;
  velocity: number;
  statusMsg: string;
  createdAt: string;
  updatedAt: string;
  lastValTS: string;
  provider: string;
  providerShort: string;
  onlyOfTrainNum?: boolean;
  alerts?: { message: string }[];
}

export interface AmtrakerStationMeta {
  name: string;
  code: string;
  tz: string;
  lat: number;
  lon: number;
  hasAddress?: boolean;
  address1?: string;
  address2?: string;
  city: string;
  state: string;
  zip?: string | number;
  trains: string[];
}

export type AmtrakerTrainResponse = Record<string, AmtrakerTrain[]>;
export type AmtrakerStationResponse = Record<string, AmtrakerStationMeta>;
