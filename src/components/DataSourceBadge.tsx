import { formatUpdatedAt } from "@/lib/format";

export function DataSourceBadge({
  source,
  updatedAt,
  error,
}: {
  source: "live" | "fallback";
  updatedAt: string;
  error?: string;
}) {
  const live = source === "live";

  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-line/80 bg-paper/90 px-3 py-2 text-xs font-medium text-ink-soft">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${live ? "live-dot bg-lamp" : "bg-warn"}`}
      />
      <span className="min-w-0">
        {live ? "Live from " : "Amtraker is down. "}
        {live ? (
          <a
            href="https://amtraker.com"
            className="font-semibold text-rail-deep underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Amtraker
          </a>
        ) : (
          "Empty board."
        )}
      </span>
      <span className="hidden text-ink-soft/50 sm:inline">·</span>
      <span
        suppressHydrationWarning
        className="w-full font-mono text-[11px] text-ink-soft/90 sm:w-auto"
      >
        {formatUpdatedAt(updatedAt)}
      </span>
      {error ? (
        <span className="text-bad" title={error}>
          Update failed
        </span>
      ) : null}
    </div>
  );
}
