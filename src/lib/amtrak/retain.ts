import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Train } from "../types";

const FILE = path.join(process.cwd(), "data", "retained-board.json");
const MAX_AGE_MS = 30 * 60 * 60 * 1000;
const MIN_FRESH = 20;

async function readRetained(): Promise<Train[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Train[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeRetained(trains: Train[]): Promise<void> {
  try {
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(trains));
  } catch (err) {
    console.error("[retain] could not save the board", err);
  }
}

/**
 * Amtraker drops a train soon after it finishes. Keep the last copy we saw
 * for the rest of the service day, and treat a vanished active train as finished.
 * A short or failed fetch must not wipe that history.
 */
export async function retainTrains(fresh: Train[]): Promise<Train[]> {
  const previous = await readRetained();
  const freshIds = new Set(fresh.map((train) => train.id));
  const cutoff = Date.now() - MAX_AGE_MS;
  const trustworthy = fresh.length >= MIN_FRESH;
  const kept: Train[] = [];

  for (const train of previous) {
    if (freshIds.has(train.id)) continue;
    const updated = Date.parse(train.updatedAt);
    if (!Number.isFinite(updated) || updated < cutoff) continue;
    if (!trustworthy) {
      kept.push(train);
      continue;
    }
    if (train.status === "pending") continue;
    if (train.status === "active") {
      kept.push({
        ...train,
        status: "complete",
        hasRecentUpdate: false,
        speedMph: undefined,
      });
      continue;
    }
    kept.push(train);
  }

  const merged = [...fresh, ...kept];
  if (trustworthy) await writeRetained(merged);
  return merged;
}
