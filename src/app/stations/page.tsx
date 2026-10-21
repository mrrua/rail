import type { Metadata } from "next";
import { Suspense } from "react";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { StationSearch } from "@/components/StationSearch";
import { getBoardMeta, getStations } from "@/lib/amtrak/board";

export const metadata: Metadata = {
  title: "Stations",
};

async function StationsBody() {
  const [stations, meta] = await Promise.all([getStations(), getBoardMeta()]);

  return (
    <>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-base leading-relaxed text-ink-soft">
          {stations.length} stations from Amtraker. Open a station for arriving
          and departed boards.
        </p>
        <DataSourceBadge
          source={meta.source}
          updatedAt={meta.updatedAt}
          error={meta.error}
        />
      </div>
      <div className="mt-8">
        <StationSearch stations={stations} />
      </div>
    </>
  );
}

export default function StationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
        Station index
      </h1>
      <Suspense
        fallback={
          <p className="mt-6 text-sm text-ink-soft">Loading stations…</p>
        }
      >
        <StationsBody />
      </Suspense>
    </div>
  );
}
