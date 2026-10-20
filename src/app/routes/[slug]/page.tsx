import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RouteMatrix } from "@/components/RouteMatrix";
import { TrainStatusPill } from "@/components/StatusPill";
import {
  getLiveBoard,
  getRoute,
  routeMatrix,
  trainsForRoute,
} from "@/lib/amtrak/board";
import { routes as catalogRoutes } from "@/lib/data/routes";

export function generateStaticParams() {
  return catalogRoutes.map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/routes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const catalog = catalogRoutes.find((r) => r.slug === slug);
  return { title: catalog?.name ?? "Route" };
}

async function RouteFromParams({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <RouteBody slug={slug} />;
}

async function RouteBody({ slug }: { slug: string }) {
  const route = await getRoute(slug);
  if (!route) notFound();

  const [matrix, liveTrains, board] = await Promise.all([
    routeMatrix(slug),
    trainsForRoute(slug),
    getLiveBoard(),
  ]);

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
        Route
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">
        {route.name}
      </h1>
      <p className="mt-3 max-w-2xl text-base text-ink-soft">
        {route.active} active · {route.complete} complete · {route.pending}{" "}
        pending. Click train numbers or stations for more detail.
      </p>

      {liveTrains.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold text-ink">
            Trains on this route
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {liveTrains.map((train) => {
              const origin = board.stationByCode[train.originCode];
              const dest = board.stationByCode[train.destinationCode];
              return (
                <li key={train.id}>
                  <Link
                    href={`/trains/${train.id}`}
                    className="block rounded-xl border border-line bg-paper p-4 transition hover:border-rail/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-lg font-semibold">
                        {train.number}
                        <span className="ml-2 text-xs font-normal text-ink-soft">
                          {train.id}
                        </span>
                      </span>
                      <TrainStatusPill status={train.status} />
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">
                      {origin?.city ?? train.originCode} →{" "}
                      {dest?.city ?? train.destinationCode}
                    </p>
                    {train.locationLabel ? (
                      <p className="mt-2 text-sm text-ink">{train.locationLabel}</p>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <p className="mt-8 text-sm text-ink-soft">
          No trains for this route in the current Amtraker feed.
        </p>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">
          Schedule matrix
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Stations down the side, trains across the top — built from live stop
          lists.
        </p>
        <div className="mt-4">
          {matrix ? (
            <RouteMatrix
              columns={matrix.columns}
              rows={matrix.rows}
              stationNames={Object.fromEntries(
                Object.entries(board.stationByCode).map(([code, s]) => [
                  code,
                  s.name,
                ]),
              )}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-paper/70 p-6 text-sm text-ink-soft">
              No active trains to build a matrix right now.
            </div>
          )}
        </div>
      </section>

      {route.trainNumbers.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">
            Train numbers
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {route.trainNumbers.map((n) => (
              <Link
                key={n}
                href={`/trains/${n}`}
                className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-sm hover:border-rail/40 hover:text-rail"
              >
                {n}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

export default function RouteDetailPage({
  params,
}: PageProps<"/routes/[slug]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Suspense
        fallback={<p className="text-sm text-ink-soft">Loading route…</p>}
      >
        <RouteFromParams params={params} />
      </Suspense>
    </div>
  );
}
