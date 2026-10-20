import { cacheLife, cacheTag } from "next/cache";
import type {
  AmtrakerStationResponse,
  AmtrakerTrainResponse,
} from "./types";

const BASE = "https://api.amtraker.com/v3";
const USER_AGENT = "Rail/0.1 (https://github.com/local/rail; Amtrak status UI)";

async function amtrakerGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });

  if (!res.ok) {
    throw new Error(`Amtraker ${path} failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchAmtrakerTrains(): Promise<AmtrakerTrainResponse> {
  "use cache";
  cacheTag("amtraker-trains");
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  return amtrakerGet<AmtrakerTrainResponse>("/trains");
}

export async function fetchAmtrakerStations(): Promise<AmtrakerStationResponse> {
  "use cache";
  cacheTag("amtraker-stations");
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  return amtrakerGet<AmtrakerStationResponse>("/stations");
}
