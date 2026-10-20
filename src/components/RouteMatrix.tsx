import Link from "next/link";
import type { RouteMatrixColumn, RouteMatrixRow } from "@/lib/types";
import { PunctualityPill } from "./StatusPill";

export function RouteMatrix({
  columns,
  rows,
  stationNames = {},
}: {
  columns: RouteMatrixColumn[];
  rows: RouteMatrixRow[];
  stationNames?: Record<string, string>;
}) {
  return (
    <div className="matrix-scroll scroll-fade overflow-x-auto rounded-2xl border border-line/80 bg-paper/90">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="bg-mist/45">
            <th className="sticky left-0 z-10 bg-mist/90 px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Station
            </th>
            {columns.map((col, i) => (
              <th
                key={`${col.trainNumber}-${i}`}
                className="px-3 py-3 text-center font-semibold"
              >
                <Link
                  href={`/trains/${col.trainId ?? col.trainNumber}`}
                  className="font-mono text-base text-ink hover:text-rail"
                >
                  {col.direction} {col.trainNumber}
                </Link>
                {typeof col.speedMph === "number" ? (
                  <div className="mt-1 font-mono text-[11px] font-normal text-ink-soft">
                    {col.speedMph} mph
                  </div>
                ) : null}
              </th>
            ))}
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Name
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const name = stationNames[row.stationCode] ?? row.stationCode;
            return (
              <tr
                key={row.stationCode}
                className={`border-t border-line/70 ${
                  ri % 2 === 0 ? "bg-paper" : "bg-fog/50"
                }`}
              >
                <td className="sticky left-0 z-10 bg-inherit px-3 py-2.5">
                  <Link
                    href={`/stations/${row.stationCode}`}
                    className="font-mono font-semibold text-ink hover:text-rail"
                  >
                    {row.stationCode}
                  </Link>
                </td>
                {row.cells.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-2 py-2.5 text-center align-middle"
                  >
                    {cell.marker === "pass" ? (
                      <span className="text-ink-soft/50">↑</span>
                    ) : cell.marker === "empty" || !cell.time ? (
                      <span className="text-ink-soft/30">·</span>
                    ) : (
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="font-mono tabular-nums text-ink">
                          {cell.time}
                        </span>
                        {cell.punctuality ? (
                          <PunctualityPill value={cell.punctuality} />
                        ) : null}
                        {cell.dateNote ? (
                          <span className="text-[10px] text-ink-soft">
                            {cell.dateNote}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-ink-soft">{name}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
