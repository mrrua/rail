import type { Metadata } from "next";
import { Suspense } from "react";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { RouteStatusTable } from "@/components/RouteStatusTable";
import { getBoardMeta, getRoutes, getSystemTotals } from "@/lib/amtrak/board";

export const metadata: Metadata = {
  title: "Routes",
};

async function RoutesBody() {
  const [totals, routes, meta] = await Promise.all([
    getSystemTotals(),
    getRoutes(),
    getBoardMeta(),
  ]);

  return (
    <>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-base leading-relaxed text-ink-soft">
          Status for Amtrak routes — {totals.active} active, {totals.complete}{" "}
          complete, {totals.pending} pending. Open a route for the stop matrix
          and active trains.
        </p>
        <DataSourceBadge
          source={meta.source}
          updatedAt={meta.updatedAt}
          error={meta.error}
        />
      </div>
      <div className="mt-8">
        <RouteStatusTable routes={routes} />
      </div>
    </>
  );
}

export default function RoutesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
        Route index
      </h1>
      <Suspense
        fallback={
          <p className="mt-6 text-sm text-ink-soft">Loading routes…</p>
        }
      >
        <RoutesBody />
      </Suspense>
    </div>
  );
}
