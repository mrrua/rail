import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import {
  getBoardMeta,
  trainsGroupedByRoute,
} from "@/lib/amtrak/board";

export const metadata: Metadata = {
  title: "Trains",
};

async function TrainsBody() {
  const [groups, meta] = await Promise.all([
    trainsGroupedByRoute(),
    getBoardMeta(),
  ]);

  return (
    <>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-base leading-relaxed text-ink-soft">
          Live Amtrak train numbers. Bold entries have a running instance in
          the current feed; dots mark recent movement.
        </p>
        <DataSourceBadge
          source={meta.source}
          updatedAt={meta.updatedAt}
          error={meta.error}
        />
      </div>

      <div className="mt-10 space-y-8">
        {groups.map(({ route, trains: routeTrains }) => {
          const liveNumbers = new Set(routeTrains.map((t) => t.number));
          const numbers =
            route.trainNumbers.length > 0
              ? route.trainNumbers
              : [...liveNumbers].sort(
                  (a, b) => Number(a) - Number(b) || a.localeCompare(b),
                );

          return (
            <section key={route.slug}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">
                  <Link
                    href={`/routes/${route.slug}`}
                    className="hover:text-rail"
                  >
                    {route.name}
                  </Link>
                </h2>
                <span className="text-xs text-ink-soft">
                  {route.active} active
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {numbers.map((n) => {
                  const live = routeTrains.find((t) => t.number === n);
                  const hasDetail = Boolean(live);
                  return (
                    <Link
                      key={n}
                      href={`/trains/${live?.id ?? n}`}
                      className={`rounded-md border px-2.5 py-1 font-mono text-sm transition ${
                        hasDetail
                          ? "border-rail/30 bg-rail/5 font-semibold text-ink hover:border-rail"
                          : "border-line bg-paper text-ink-soft hover:border-line hover:text-ink"
                      }`}
                    >
                      {n}
                      {live?.hasRecentUpdate ? (
                        <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-signal align-middle" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

export default function TrainsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
        Train index
      </h1>
      <Suspense
        fallback={<p className="mt-6 text-sm text-ink-soft">Loading trains…</p>}
      >
        <TrainsBody />
      </Suspense>
    </div>
  );
}
