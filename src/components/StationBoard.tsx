import Link from "next/link";
import type { StationBoardItem } from "@/lib/types";
import { PunctualityPill } from "./StatusPill";

export function StationBoard({
  title,
  items,
}: {
  title: string;
  items: StationBoardItem[];
}) {
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-line/80 bg-paper/90 p-5">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        <p className="mt-3 text-sm text-ink-soft">
          No trains here in this update.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line/80 bg-paper/90">
      <div className="border-b border-line/60 bg-mist/40 px-4 py-3 sm:px-5">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      </div>
      <ul className="divide-y divide-line/50">
        {items.map((item) => (
          <li
            key={`${item.kind}-${item.trainNumber}-${item.time}-${item.trainId ?? ""}`}
            className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-rail/[0.04] sm:px-5"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/trains/${item.trainId ?? item.trainNumber}`}
                  className="min-h-11 inline-flex items-center font-mono text-base font-semibold text-ink hover:text-rail-deep"
                >
                  {item.trainNumber}
                </Link>
                <span className="truncate text-sm text-ink-soft">
                  {item.routeName}
                  {item.fromLabel && item.toLabel
                    ? ` · ${item.fromLabel} → ${item.toLabel}`
                    : null}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-mono text-sm tabular-nums">{item.time}</span>
              <PunctualityPill value={item.punctuality} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
