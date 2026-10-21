import { punctualityTone, shortPunctuality, statusLabel } from "@/lib/format";
import type { Punctuality, TrainStatus } from "@/lib/types";

const toneClass = {
  good: "bg-good/10 text-good",
  warn: "bg-warn/10 text-warn",
  bad: "bg-bad/10 text-bad",
  neutral: "bg-mist/80 text-ink-soft",
} as const;

export function PunctualityPill({ value }: { value: Punctuality }) {
  const tone = punctualityTone(value);
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${toneClass[tone]}`}
    >
      {shortPunctuality(value)}
    </span>
  );
}

export function TrainStatusPill({ status }: { status: TrainStatus }) {
  const map = {
    active: "bg-lamp/20 text-signal",
    complete: "bg-mist/80 text-ink-soft",
    pending: "bg-signal/10 text-signal",
  } as const;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${map[status]}`}
    >
      {status === "active" ? (
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-lamp" />
      ) : null}
      {statusLabel(status)}
    </span>
  );
}
