import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TrainStatusPill } from "@/components/StatusPill";
import { TrainTimeline } from "@/components/TrainTimeline";
import { getLiveBoard, getTrain } from "@/lib/amtrak/board";
import { formatPunctuality, formatUpdatedAt } from "@/lib/format";

export async function generateMetadata({
  params,
}: PageProps<"/trains/[number]">): Promise<Metadata> {
  const { number } = await params;
  return { title: `Train ${number}` };
}

async function TrainFromParams({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  return <TrainBody number={number} />;
}

async function TrainBody({ number }: { number: string }) {
  const train = await getTrain(number);

  if (!train) {
    const board = await getLiveBoard();
    const catalogHit = board.routes.find((r) =>
      r.trainNumbers.includes(number),
    );

    return (
      <div className="max-w-3xl">
        <p className="font-mono text-sm text-rail">Train {number}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">
          {catalogHit ? `${catalogHit.name} ${number}` : `Train ${number}`}
        </h1>
        <p className="mt-4 text-ink-soft">
          This train isn&apos;t in the latest update.
        </p>
        {catalogHit ? (
          <Link
            href={`/routes/${catalogHit.slug}`}
            className="mt-6 inline-flex text-sm font-semibold text-rail hover:underline"
          >
            See {catalogHit.name}
          </Link>
        ) : null}
      </div>
    );
  }

  const board = await getLiveBoard();
  const origin = board.stationByCode[train.originCode];
  const dest = board.stationByCode[train.destinationCode];
  const currentStop = train.stops.find(
    (s) => s.state === "en_route" || s.state === "arrived",
  );
  const nextStop =
    currentStop ?? train.stops.find((s) => s.state === "upcoming");
  const departedCount = train.stops.filter((s) => s.state === "departed").length;
  const siblings = board.trains.filter(
    (t) => t.number === train.number && t.id !== train.id,
  );

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft">
            <Link href={`/routes/${train.routeSlug}`} className="hover:text-rail">
              {train.routeName}
            </Link>
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
            Train {train.number}
          </h1>
          <p suppressHydrationWarning className="mt-2 text-sm text-ink-soft">
            {train.id} · Updated {formatUpdatedAt(train.updatedAt)}
          </p>
        </div>
        <TrainStatusPill status={train.status} />
      </div>

      {siblings.length > 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          Also out:{" "}
          {siblings.map((s, i) => (
            <span key={s.id}>
              {i > 0 ? ", " : null}
              <Link href={`/trains/${s.id}`} className="text-rail hover:underline">
                {s.id}
              </Link>
            </span>
          ))}
        </p>
      ) : null}

      <section className="mt-8 grid gap-4 rounded-xl border border-line bg-paper p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Origin
          </p>
          <Link
            href={`/stations/${train.originCode}`}
            className="mt-1 block font-semibold text-ink hover:text-rail"
          >
            {origin?.name ?? train.originCode}
          </Link>
          <p className="mt-1 font-mono text-sm text-ink-soft">
            {train.originTime}
            {train.originDate ? ` · ${train.originDate}` : null}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Destination
          </p>
          <Link
            href={`/stations/${train.destinationCode}`}
            className="mt-1 block font-semibold text-ink hover:text-rail"
          >
            {dest?.name ?? train.destinationCode}
          </Link>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Position
          </p>
          <p className="mt-1 text-sm text-ink">
            {train.locationLabel ?? "Not out yet"}
          </p>
          {typeof train.speedMph === "number" ? (
            <p className="mt-1 font-mono text-sm text-rail-deep">
              {train.speedMph} mph
              {train.heading ? ` · ${train.heading}` : null}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-line bg-paper px-4 py-3.5 sm:px-5">
        <p className="text-sm text-ink">
          <span className="font-semibold">
            {departedCount} of {train.stops.length}
          </span>{" "}
          <span className="text-ink-soft">stops passed</span>
        </p>
        {nextStop ? (
          <p className="flex flex-wrap items-center gap-2 text-sm text-ink">
            <span className="text-ink-soft">
              {currentStop ? "At" : "Next"}
            </span>
            <Link
              href={`/stations/${nextStop.stationCode}`}
              className="font-semibold hover:underline"
            >
              {board.stationByCode[nextStop.stationCode]?.name ??
                nextStop.stationName ??
                nextStop.stationCode}
            </Link>
            <span className="font-medium text-ink">
              {formatPunctuality(nextStop.punctuality)}
            </span>
            <a href="#current-stop" className="text-ink-soft hover:text-ink hover:underline">
              See stop
            </a>
          </p>
        ) : (
          <p className="text-sm text-ink-soft">
            {formatPunctuality(train.stops.at(-1)?.punctuality ?? { kind: "scheduled" })}
          </p>
        )}
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            Stops
          </h2>
          <div className="mt-4 rounded-xl border border-line bg-paper px-4 py-2 sm:px-5">
            <TrainTimeline stops={train.stops} />
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-ink">
            Positions
          </h2>
          {train.positions.length === 0 ? (
            <p className="mt-4 text-sm text-ink-soft">
              No position yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-0 overflow-hidden rounded-xl border border-line bg-paper">
              {train.positions.map((p, i) => (
                <li
                  key={`${p.time}-${i}`}
                  className="flex gap-3 border-b border-line/70 px-4 py-3 last:border-b-0"
                >
                  <span className="shrink-0 font-mono text-xs text-ink-soft">
                    {p.time}
                  </span>
                  <div>
                    <p className="text-sm text-ink">{p.description}</p>
                    {typeof p.speedMph === "number" ? (
                      <p className="mt-0.5 font-mono text-xs text-rail-deep">
                        {p.speedMph} mph
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-ink-soft">
            Data from{" "}
            <a
              href="https://amtraker.com"
              className="text-rail hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Amtraker
            </a>
            . If you&apos;re on the train, use Amtrak&apos;s Track Your Train map.
          </p>
        </section>
      </div>
    </>
  );
}

export default function TrainDetailPage({
  params,
}: PageProps<"/trains/[number]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Suspense
        fallback={<p className="text-sm text-ink-soft">Loading train...</p>}
      >
        <TrainFromParams params={params} />
      </Suspense>
    </div>
  );
}
