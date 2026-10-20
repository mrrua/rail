import Link from "next/link";
import { Suspense } from "react";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { HeroRails } from "@/components/HeroRails";
import { RouteStatusTable } from "@/components/RouteStatusTable";
import {
  TrainSearch,
  type RouteSearchItem,
  type TrainSearchItem,
} from "@/components/TrainSearch";
import {
  activeTrains,
  getBoardMeta,
  getLiveBoard,
  getRoutes,
  getSystemTotals,
} from "@/lib/amtrak/board";

async function HeroSearch() {
  const board = await getLiveBoard();

  const trains: TrainSearchItem[] = board.trains.map((train) => {
    const origin = board.stationByCode[train.originCode];
    const dest = board.stationByCode[train.destinationCode];
    return {
      id: train.id,
      number: train.number,
      routeName: train.routeName,
      routeSlug: train.routeSlug,
      status: train.status,
      originLabel: origin?.name ?? train.originCode,
      destinationLabel: dest?.name ?? train.destinationCode,
      locationLabel: train.locationLabel,
    };
  });

  const routes: RouteSearchItem[] = board.routes.map((route) => ({
    slug: route.slug,
    name: route.name,
    active: route.active,
    trainNumbers: route.trainNumbers,
  }));

  return <TrainSearch trains={trains} routes={routes} />;
}

async function SystemStatus() {
  const [totals, routes, meta, spotlight] = await Promise.all([
    getSystemTotals(),
    getRoutes(),
    getBoardMeta(),
    activeTrains(),
  ]);

  const featured = spotlight.filter((t) => t.hasRecentUpdate).slice(0, 4);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-7 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
            System status
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft sm:text-base">
            Tracking {totals.routes} routes with {totals.active} active trains,{" "}
            {totals.pending} awaiting departure, and {totals.complete} completed
            in the current feed.
          </p>
        </div>
        <DataSourceBadge
          source={meta.source}
          updatedAt={meta.updatedAt}
          error={meta.error}
        />
      </div>

      <RouteStatusTable routes={routes} />

      <div className="mt-12 sm:mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
          Active right now
        </h2>
        <p className="mt-2 text-[15px] text-ink-soft">
          Live positions from Amtraker. Prefer Amtrak&apos;s Track Your Train map
          when traveling.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {featured.map((train) => (
            <li key={train.id}>
              <Link
                href={`/trains/${train.id}`}
                className="block rounded-2xl border border-line/80 bg-paper/90 p-4 transition hover:border-rail/35 hover:bg-paper active:scale-[0.99] sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-lg font-semibold text-ink">
                      {train.number}
                    </p>
                    <p className="text-sm text-ink-soft">{train.routeName}</p>
                  </div>
                  {typeof train.speedMph === "number" ? (
                    <span className="rounded-full bg-rail/10 px-2.5 py-1 font-mono text-xs text-rail-deep">
                      {train.speedMph} mph
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-[15px] leading-snug text-ink">
                  {train.locationLabel ?? "En route"}
                </p>
              </Link>
            </li>
          ))}
          {featured.length === 0 ? (
            <li className="text-sm text-ink-soft sm:col-span-2">
              No active Amtrak trains in the current feed.
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}

function SearchFallback() {
  return (
    <div className="h-12 w-full max-w-xl animate-pulse rounded-2xl bg-paper/70 ring-1 ring-line/60" />
  );
}

export default function HomePage() {
  return (
    <div>
      <section className="relative isolate border-b border-line/50">
        <HeroRails />
        <div className="relative z-10 mx-auto flex min-h-[58vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-16 sm:min-h-[68vh] sm:px-6 sm:pb-16 sm:pt-24">
          <p className="animate-rise font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl md:text-7xl">
            Rail
          </p>
          <h1 className="animate-rise-delay-1 mt-3 max-w-xl font-display text-xl font-semibold leading-snug text-ink/90 sm:mt-4 sm:text-2xl md:text-[1.7rem]">
            See where Amtrak is moving — by route, station, and train.
          </h1>
          <p className="animate-rise-delay-2 mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft sm:mt-4 sm:text-base">
            Live unofficial status via{" "}
            <a
              href="https://amtraker.com"
              className="font-semibold text-rail-deep underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Amtraker
            </a>
            , organized the way RailRat made familiar.
          </p>

          <div className="relative z-30 mt-6 sm:mt-7">
            <Suspense fallback={<SearchFallback />}>
              <HeroSearch />
            </Suspense>
          </div>

          <div className="relative z-0 mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
            <Link
              href="/routes"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-rail px-5 py-3 text-sm font-semibold text-white transition hover:bg-rail-deep"
            >
              Browse routes
            </Link>
            <Link
              href="/stations"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-paper/85 px-5 py-3 text-sm font-semibold text-ink transition hover:border-rail/40 hover:text-rail-deep"
            >
              Find a station
            </Link>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-ink-soft sm:px-6">
            Loading live train board…
          </div>
        }
      >
        <SystemStatus />
      </Suspense>
    </div>
  );
}
