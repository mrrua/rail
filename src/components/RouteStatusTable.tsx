import Link from "next/link";
import type { RouteSummary } from "@/lib/types";

export function RouteStatusTable({
  routes,
  showTotals = true,
}: {
  routes: RouteSummary[];
  showTotals?: boolean;
}) {
  const totals = routes.reduce(
    (acc, r) => {
      acc.active += r.active;
      acc.complete += r.complete;
      acc.pending += r.pending;
      return acc;
    },
    { active: 0, complete: 0, pending: 0 },
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-line/80 bg-paper/90">
      <div className="matrix-scroll scroll-fade overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-mist/50 text-[11px] uppercase tracking-[0.12em] text-ink-soft">
            <tr>
              <th className="px-3 py-3.5 font-semibold sm:px-4">Route</th>
              <th className="px-3 py-3.5 font-semibold sm:px-4">Active</th>
              <th className="px-3 py-3.5 font-semibold sm:px-4">Complete</th>
              <th className="px-3 py-3.5 font-semibold sm:px-4">Pending</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route, i) => {
              const busy = route.active + route.pending > 0;
              return (
                <tr
                  key={route.slug}
                  className={`border-t border-line/50 transition-colors hover:bg-rail/[0.04] ${
                    busy ? "" : "opacity-60"
                  } ${i % 2 === 0 ? "bg-paper/40" : "bg-fog/30"}`}
                >
                  <td className="px-3 py-3.5 sm:px-4">
                    <Link
                      href={`/routes/${route.slug}`}
                      className="font-medium text-ink underline-offset-2 hover:text-rail-deep hover:underline"
                    >
                      {route.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3.5 font-mono tabular-nums sm:px-4">
                    <Count value={route.active} tone="active" />
                  </td>
                  <td className="px-3 py-3.5 font-mono tabular-nums text-ink-soft sm:px-4">
                    {route.complete}
                  </td>
                  <td className="px-3 py-3.5 font-mono tabular-nums sm:px-4">
                    <Count value={route.pending} tone="pending" />
                  </td>
                </tr>
              );
            })}
            {showTotals ? (
              <tr className="border-t border-line bg-mist/40 font-semibold">
                <td className="px-3 py-3.5 sm:px-4">Totals</td>
                <td className="px-3 py-3.5 font-mono tabular-nums text-rail-deep sm:px-4">
                  {totals.active}
                </td>
                <td className="px-3 py-3.5 font-mono tabular-nums sm:px-4">
                  {totals.complete}
                </td>
                <td className="px-3 py-3.5 font-mono tabular-nums text-signal sm:px-4">
                  {totals.pending}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Count({
  value,
  tone,
}: {
  value: number;
  tone: "active" | "pending";
}) {
  if (value === 0) return <span className="text-ink-soft/60">0</span>;
  return (
    <span className={tone === "active" ? "text-rail-deep" : "text-signal"}>
      {value}
    </span>
  );
}
