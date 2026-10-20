import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StationBoard } from "@/components/StationBoard";
import { getStation, stationBoard } from "@/lib/amtrak/board";
import { stations as catalogStations } from "@/lib/data/stations";

export function generateStaticParams() {
  return catalogStations.slice(0, 40).map((station) => ({
    code: station.code,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/stations/[code]">): Promise<Metadata> {
  const { code } = await params;
  return { title: `Station ${code.toUpperCase()}` };
}

async function StationFromParams({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <StationBody code={code} />;
}

async function StationBody({ code }: { code: string }) {
  const station = await getStation(code);
  if (!station) notFound();

  const board = await stationBoard(station.code);
  const arriving = board.filter((i) => i.kind === "arriving");
  const departed = board.filter((i) => i.kind === "departed");

  return (
    <>
      <p className="font-mono text-sm font-semibold text-rail">{station.code}</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">
        {station.name}
      </h1>
      <p className="mt-3 text-base text-ink-soft">
        Arrival and departure updates from the live Amtraker feed.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <StationBoard title="Arriving trains" items={arriving} />
        <StationBoard title="Departed trains" items={departed} />
      </div>

      {station.connections?.length ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">
            Connecting services
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {station.connections.map((c) => (
              <li
                key={c}
                className="rounded-full border border-line bg-paper px-3 py-1 text-sm text-ink-soft"
              >
                {c}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

export default function StationDetailPage({
  params,
}: PageProps<"/stations/[code]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Suspense
        fallback={<p className="text-sm text-ink-soft">Loading station…</p>}
      >
        <StationFromParams params={params} />
      </Suspense>
    </div>
  );
}
