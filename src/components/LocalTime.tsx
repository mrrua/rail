"use client";

import { useSyncExternalStore } from "react";

// Resolve the timezone in the browser so server rendering is deterministic and
// the hydrated view can use the viewer's actual system timezone.
const subscribe = () => () => {};
const serverZone = () => "UTC";
function browserZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}
const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(zone: string, full: boolean) {
  const key = `${zone}:${full}`;
  let value = formatters.get(key);
  if (!value) {
    value = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      month: "short",
      day: "numeric",
      ...(full ? { year: "numeric" as const } : {}),
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
    formatters.set(key, value);
  }
  return value;
}

export function LocalTime({ value, full = false }: { value?: string; full?: boolean }) {
  const zone = useSyncExternalStore(subscribe, browserZone, serverZone);
  const valid = value && Number.isFinite(Date.parse(value)) && /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);

  // Legacy retained records can contain only a clock face, with no date or
  // offset. Keep that value visible, but do not pretend it can be converted.
  if (!valid) {
    return value ? (
      <time title="Original time shown; timezone conversion is unavailable">{value} <span className="text-[10px]">(timezone unknown)</span></time>
    ) : <span title="No timestamp available">Time unavailable</span>;
  }

  const date = new Date(value);
  return (
    <time dateTime={date.toISOString()} title={`${formatter(zone, true).format(date)} (${zone})`}>
      {formatter(zone, full).format(date)}
    </time>
  );
}

export function TimezoneNote() {
  const zone = useSyncExternalStore(subscribe, browserZone, serverZone);
  return (
    <p className="text-xs leading-relaxed text-ink-soft">
      {zone === "UTC" ? "Times shown in UTC." : `Times shown in your timezone: ${zone.replace(/_/g, " ")}.`}
      {" "}Dates and timezone labels are included for overnight trips.
    </p>
  );
}
