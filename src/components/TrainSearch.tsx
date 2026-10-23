"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { TrainStatus } from "@/lib/types";
import { statusLabel } from "@/lib/format";

export type TrainSearchItem = {
  id: string;
  number: string;
  routeName: string;
  routeSlug: string;
  status: TrainStatus;
  originLabel: string;
  destinationLabel: string;
  locationLabel?: string;
};

export type RouteSearchItem = {
  slug: string;
  name: string;
  active: number;
  trainNumbers: string[];
};

export type StationSearchItem = {
  code: string;
  name: string;
  city: string;
  state: string;
};

type Hit =
  | {
      kind: "train";
      key: string;
      href: string;
      train: TrainSearchItem;
      score: number;
    }
  | {
      kind: "route";
      key: string;
      href: string;
      route: RouteSearchItem;
      score: number;
    }
  | {
      kind: "station";
      key: string;
      href: string;
      station: StationSearchItem;
      score: number;
    };

export function TrainSearch({
  trains,
  routes,
  stations = [],
  autoFocus = false,
}: {
  trains: TrainSearchItem[];
  routes: RouteSearchItem[];
  stations?: StationSearchItem[];
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const deferred = useDeferredValue(query);

  const hits = useMemo(
    () => rankHits(deferred, trains, routes, stations).slice(0, 8),
    [deferred, trains, routes, stations],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [deferred]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function goTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const hit = hits[activeIndex] ?? hits[0];
    if (hit) goTo(hit.href);
  }

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={rootRef} className="relative z-[60] w-full max-w-xl">
      <form onSubmit={onSubmit} role="search">
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search trains, routes, or stations
        </label>
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-soft"
          >
            <SearchIcon className="h-5 w-5" />
          </span>
          <input
            ref={inputRef}
            id={`${listId}-input`}
            type="search"
            value={query}
            autoFocus={autoFocus}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="7, Empire Builder, or Chicago"
            aria-controls={listId}
            aria-expanded={showPanel}
            aria-autocomplete="list"
            role="combobox"
            className="w-full min-h-12 rounded-2xl border border-line/80 bg-paper/95 py-3.5 pr-4 pl-11 text-base text-ink shadow-sm shadow-ink/5 outline-none ring-rail/25 placeholder:text-ink-soft/65 focus:border-rail/40 focus:ring-2"
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (!showPanel || hits.length === 0) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => (i + 1) % hits.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => (i - 1 + hits.length) % hits.length);
              } else if (e.key === "Escape") {
                setOpen(false);
                inputRef.current?.blur();
              }
            }}
          />
        </div>
      </form>

      {showPanel ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-[70] mt-2 max-h-[min(24rem,55vh)] w-full overflow-auto rounded-2xl border border-line/80 bg-paper py-1.5 shadow-lg shadow-ink/10"
        >
          {hits.length === 0 ? (
            <li className="px-4 py-3 text-sm text-ink-soft">
              No match for {query.trim()}.
            </li>
          ) : (
            hits.map((hit, index) => {
              const active = index === activeIndex;
              return (
                <li key={hit.key} role="option" aria-selected={active}>
                  <Link
                    href={hit.href}
                    className={`flex items-start gap-3 px-3.5 py-3 transition-colors ${
                      active ? "bg-rail/10" : "hover:bg-mist/70"
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => setOpen(false)}
                  >
                    {hit.kind === "train" ? (
                      <>
                        <span className="mt-0.5 min-w-12 rounded-lg bg-mist/80 px-2 py-1 text-center font-mono text-sm font-semibold text-ink">
                          {hit.train.number}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-ink">
                              {hit.train.routeName}
                            </span>
                            <StatusChip status={hit.train.status} />
                          </span>
                          <span className="mt-0.5 block truncate text-sm text-ink-soft">
                            {hit.train.originLabel} → {hit.train.destinationLabel}
                            {hit.train.locationLabel
                              ? ` · ${hit.train.locationLabel}`
                              : null}
                          </span>
                        </span>
                      </>
                    ) : hit.kind === "station" ? (
                      <>
                        <span className="mt-0.5 min-w-12 rounded-lg bg-mist/80 px-2 py-1 text-center font-mono text-sm font-semibold text-ink">
                          {hit.station.code}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="font-medium text-ink">
                            {hit.station.name}
                          </span>
                          <span className="mt-0.5 block text-sm text-ink-soft">
                            {[hit.station.city, hit.station.state]
                              .filter(Boolean)
                              .join(", ")}
                            {" · Station"}
                          </span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="mt-0.5 rounded-lg bg-rail/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-rail-deep">
                          Route
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="font-medium text-ink">
                            {hit.route.name}
                          </span>
                          <span className="mt-0.5 block text-sm text-ink-soft">
                            {hit.route.active} active
                            {hit.route.trainNumbers.length
                              ? ` · #${hit.route.trainNumbers.slice(0, 6).join(", ")}`
                              : null}
                          </span>
                        </span>
                      </>
                    )}
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}

function StatusChip({ status }: { status: TrainStatus }) {
  const styles = {
    active: "bg-lamp/20 text-signal",
    pending: "bg-signal/10 text-signal",
    complete: "bg-mist text-ink-soft",
  } as const;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m16 16 4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function rankHits(
  rawQuery: string,
  trains: TrainSearchItem[],
  routes: RouteSearchItem[],
  stations: StationSearchItem[],
): Hit[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];

  const digitsOnly = q.replace(/\D/g, "");
  const hits: Hit[] = [];

  for (const train of trains) {
    const number = train.number.toLowerCase();
    const id = train.id.toLowerCase();
    const route = train.routeName.toLowerCase();
    const origin = train.originLabel.toLowerCase();
    const dest = train.destinationLabel.toLowerCase();
    const location = (train.locationLabel ?? "").toLowerCase();

    let score = 0;
    if (number === q || id === q) score = 100;
    else if (number.startsWith(q) || id.startsWith(q)) score = 90;
    else if (digitsOnly && number.startsWith(digitsOnly)) score = 85;
    else if (number.includes(q) || id.includes(q)) score = 70;
    else if (route.startsWith(q)) score = 65;
    else if (route.includes(q)) score = 55;
    else if (origin.includes(q) || dest.includes(q) || location.includes(q))
      score = 40;

    if (score > 0) {
      if (train.status === "active") score += 8;
      else if (train.status === "pending") score += 4;
      hits.push({
        kind: "train",
        key: `train-${train.id}`,
        href: `/trains/${train.id}`,
        train,
        score,
      });
    }
  }

  for (const route of routes) {
    const name = route.name.toLowerCase();
    let score = 0;
    if (name === q) score = 80;
    else if (name.startsWith(q)) score = 60;
    else if (name.includes(q)) score = 45;
    else if (
      digitsOnly &&
      route.trainNumbers.some(
        (n) => n === digitsOnly || n.startsWith(digitsOnly),
      )
    ) {
      score = 35;
    }

    if (score > 0) {
      if (route.active > 0) score += 5;
      hits.push({
        kind: "route",
        key: `route-${route.slug}`,
        href: `/routes/${route.slug}`,
        route,
        score,
      });
    }
  }

  for (const station of stations) {
    const code = station.code.toLowerCase();
    const name = station.name.toLowerCase();
    const city = station.city.toLowerCase();
    const state = station.state.toLowerCase();
    let score = 0;
    if (code === q) score = 110;
    else if (code.startsWith(q)) score = 92;
    else if (name.startsWith(q)) score = 78;
    else if (city.startsWith(q)) score = 72;
    else if (q.length >= 4 && name.includes(q)) score = 52;
    else if (q.length >= 4 && city.includes(q)) score = 48;
    else if (q.length >= 2 && state === q) score = 28;

    if (score > 0) {
      hits.push({
        kind: "station",
        key: `station-${station.code}`,
        href: `/stations/${station.code}`,
        station,
        score,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
}
