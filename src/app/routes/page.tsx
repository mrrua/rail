import type { Metadata } from "next";
import { Suspense } from "react";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { RouteStatusTable } from "@/components/RouteStatusTable";
import { getBoardMeta, getRoutes, getSystemTotals } from "@/lib/amtrak/board";
import { countLine } from "@/lib/format";

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
          {countLine([
            { n: totals.active, label: "running" },
            { n: totals.complete, label: "finished" },
            { n: totals.pending, label: "not out yet" },
          ])}
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
        Routes
      </h1>
      <Suspense
        fallback={
          <p className="mt-6 text-sm text-ink-soft">Loading routes...</p>
        }
      >
        <RoutesBody />
      </Suspense>
    </div>
  );
}
