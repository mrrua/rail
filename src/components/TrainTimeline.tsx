import Link from "next/link";
import type { StopEvent, TrainStatus } from "@/lib/types";
import { PunctualityPill } from "./StatusPill";
import { LocalTime, TimezoneNote } from "./LocalTime";

export function TrainTimeline({ stops, status }: { stops: StopEvent[]; status?: TrainStatus }) {
  const atIndex = stops.findIndex((s) => s.state === "arrived");
  const movingIndex = stops.findIndex((s) => s.state === "en_route");
  const focusIndex = status === "complete" ? -1 : atIndex >= 0 ? atIndex
    : movingIndex >= 0 ? movingIndex : stops.findIndex((s) => s.state === "upcoming");
  const passed = stops.filter((s) => s.state === "departed").length;

  return (
    <div>
      <div className="border-b border-line py-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <span className="text-rail-deep">✓ {passed} passed</span>
          {focusIndex >= 0 ? <a href="#current-stop" className="rounded-full bg-signal/20 px-3 py-1 text-ink hover:underline">{atIndex >= 0 ? "● At station" : "→ Next stop"}</a> : null}
          <span className="text-ink-soft">{status === "complete" ? "Journey complete" : `${stops.filter((s, i) => i !== focusIndex && s.state === "upcoming").length} upcoming`}</span>
        </div>
        <div role="progressbar" aria-label="Stops passed" aria-valuemin={0} aria-valuemax={Math.max(stops.length, 1)} aria-valuenow={passed} className="mb-3 h-1.5 overflow-hidden rounded-full bg-mist">
          <div className="h-full rounded-full bg-rail" style={{ width: `${stops.length ? passed / stops.length * 100 : 0}%` }} />
        </div>
        <TimezoneNote />
      </div>
      <ol className="py-2">
        {stops.map((stop, index) => {
          const focus = index === focusIndex;
          const done = stop.state === "departed";
          const skipped = stop.state === "skipped";
          const label = stop.stationName ?? stop.stationCode;
          const stateLabel = skipped ? "Does not stop" : done ? "Passed" : focus
            ? stop.state === "arrived" ? "At station now" : "Next stop"
            : status === "complete" ? "No final stop report" : "Upcoming";
          return (
            <li key={`${stop.stationCode}-${index}`} id={focus ? "current-stop" : undefined}
              aria-current={focus ? "step" : undefined}
              className={`relative flex gap-3 px-2 py-4 sm:gap-4 ${focus ? "my-2 scroll-mt-24 rounded-xl border border-signal/60 bg-signal/10" : "border border-transparent"}`}>
              <div aria-hidden="true" className="relative flex w-6 shrink-0 justify-center">
                {index < stops.length - 1 ? <span className={`absolute bottom-[-26px] top-6 w-0.5 ${done ? "bg-rail/40" : "border-l-2 border-dashed border-line"}`} /> : null}
                <span className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold ${focus ? "border-signal bg-signal text-ink" : done ? "border-rail bg-rail text-white" : "border-line bg-paper text-ink-soft"}`}>
                  {done ? "✓" : focus ? stop.state === "arrived" ? "●" : "→" : skipped ? "–" : ""}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.12em] ${focus ? "text-ink" : done ? "text-rail-deep" : "text-ink-soft"}`}>{stateLabel}</span>
                  {focus && stop.state === "en_route" ? <span className="text-xs text-ink-soft">Train on the way</span> : null}
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <Link prefetch={false} href={`/stations/${stop.stationCode}`} className={`font-semibold hover:text-rail hover:underline ${done ? "text-ink-soft" : "text-ink"}`}>{label}</Link>
                    <span className="ml-2 font-mono text-xs text-ink-soft">{stop.stationCode}</span>
                  </div>
                  {!skipped ? <PunctualityPill value={stop.punctuality} /> : null}
                </div>
                {!skipped ? <StopTimes stop={stop} /> : null}
              </div>
            </li>
          );
        })}
      </ol>
      {stops.length === 0 ? <p className="py-4 text-sm text-ink-soft">No stops available in this update.</p> : null}
    </div>
  );
}

function StopTimes({ stop }: { stop: StopEvent }) {
  const arrival = stop.actualArrival || stop.estimatedArrival || stop.scheduledArrival;
  const departure = stop.actualDeparture || stop.estimatedDeparture || stop.scheduledDeparture;
  return (
    <div className="mt-2 space-y-1 text-xs leading-relaxed text-ink-soft">
      {arrival ? <p><span className="mr-2 font-medium">{stop.actualArrival ? "Arrived" : stop.estimatedArrival ? "Est. arrival" : "Scheduled arrival"}</span><LocalTime value={arrival} /></p> : null}
      {departure ? <p><span className="mr-2 font-medium">{stop.actualDeparture ? "Departed" : stop.estimatedDeparture ? "Est. departure" : "Scheduled departure"}</span><LocalTime value={departure} /></p> : null}
      {!arrival && !departure ? <p>Time not available</p> : null}
      {stop.scheduledArrival && (stop.actualArrival || stop.estimatedArrival) && stop.scheduledArrival !== arrival ? <p className="text-ink-soft">Scheduled arrival: <LocalTime value={stop.scheduledArrival} /></p> : null}
    </div>
  );
}
