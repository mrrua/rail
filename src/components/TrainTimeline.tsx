import Link from "next/link";
import { formatPunctuality } from "@/lib/format";
import type { StopEvent } from "@/lib/types";
import { PunctualityPill } from "./StatusPill";

export function TrainTimeline({ stops }: { stops: StopEvent[] }) {
  const movingIndex = stops.findIndex(
    (s) => s.state === "en_route" || s.state === "arrived",
  );
  const focusIndex =
    movingIndex >= 0
      ? movingIndex
      : stops.findIndex((s) => s.state === "upcoming");

  return (
    <ol className="relative space-y-0">
      <div
        aria-hidden
        className="absolute bottom-3 left-[11px] top-3 w-px bg-line"
      />
      {stops.map((stop, index) => {
        const label = stop.stationName ?? stop.stationCode;
        const current = stop.state === "en_route" || stop.state === "arrived";
        const done = stop.state === "departed";
        const time =
          stop.actualDeparture ||
          stop.actualArrival ||
          stop.estimatedDeparture ||
          stop.estimatedArrival ||
          stop.scheduledDeparture ||
          stop.scheduledArrival ||
          "—";

        return (
          <li
            key={`${stop.stationCode}-${index}`}
            id={index === focusIndex ? "current-stop" : undefined}
            className={`relative flex gap-4 py-3 pl-0 ${
              index === focusIndex ? "scroll-mt-24 rounded-xl bg-signal/10 px-2" : ""
            }`}
          >
            <span
              className={`relative z-10 mt-1.5 h-[10px] w-[10px] shrink-0 rounded-full border-2 ${
                current
                  ? "border-signal bg-signal shadow-[0_0_0_4px_rgba(250,186,54,0.28)]"
                  : done
                    ? "border-rail bg-rail"
                    : "border-line bg-paper"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <Link
                    href={`/stations/${stop.stationCode}`}
                    className="font-semibold text-ink hover:text-rail"
                  >
                    {label}
                  </Link>
                  <span className="ml-2 font-mono text-xs text-ink-soft">
                    {stop.stationCode}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm tabular-nums text-ink">
                    {time}
                    {stop.timezone ? (
                      <span className="ml-1 text-xs text-ink-soft">
                        {stop.timezone}
                      </span>
                    ) : null}
                  </span>
                  <PunctualityPill value={stop.punctuality} />
                </div>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                {labelForStop(stop)} · {formatPunctuality(stop.punctuality)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function labelForStop(stop: StopEvent): string {
  switch (stop.state) {
    case "departed":
      return stop.actualArrival
        ? `Arrived ${stop.actualArrival}, departed ${stop.actualDeparture ?? "—"}`
        : `Departed ${stop.actualDeparture ?? "—"}`;
    case "arrived":
      return `Arrived ${stop.actualArrival ?? "—"}`;
    case "en_route":
      return `Est. arrival ${stop.estimatedArrival ?? "—"}`;
    case "upcoming":
      return stop.estimatedArrival
        ? `Est. arrival ${stop.estimatedArrival}`
        : `Scheduled ${stop.scheduledDeparture ?? stop.scheduledArrival ?? "—"}`;
    case "skipped":
      return "Does not stop";
  }
}
