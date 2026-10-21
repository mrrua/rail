import type { Punctuality, TrainStatus } from "./types";

export function formatPunctuality(p: Punctuality): string {
  switch (p.kind) {
    case "on_time":
      return "On time";
    case "early":
      return p.minutes >= 60
        ? `${Math.floor(p.minutes / 60)}h ${p.minutes % 60}m early`
        : `${p.minutes}m early`;
    case "late":
      return p.minutes >= 60
        ? `${Math.floor(p.minutes / 60)}h ${p.minutes % 60}m late`
        : `${p.minutes}m late`;
    case "scheduled":
      return "Scheduled";
  }
}

export function shortPunctuality(p: Punctuality): string {
  switch (p.kind) {
    case "on_time":
      return "on tm";
    case "early":
      return p.minutes >= 60
        ? `${Math.floor(p.minutes / 60)}h ${p.minutes % 60}m er`
        : `${p.minutes}m er`;
    case "late":
      return p.minutes >= 60
        ? `${Math.floor(p.minutes / 60)}h ${p.minutes % 60}m lt`
        : `${p.minutes}m lt`;
    case "scheduled":
      return "sch";
  }
}

export function punctualityTone(
  p: Punctuality,
): "good" | "warn" | "bad" | "neutral" {
  switch (p.kind) {
    case "on_time":
    case "early":
      return "good";
    case "late":
      return p.minutes >= 30 ? "bad" : "warn";
    case "scheduled":
      return "neutral";
  }
}

export function statusLabel(status: TrainStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "complete":
      return "Complete";
    case "pending":
      return "Pending";
  }
}

export function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "America/New_York",
  });
}
