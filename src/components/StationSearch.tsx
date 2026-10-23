"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import type { Station } from "@/lib/types";

export function StationSearch({ stations }: { stations: Station[] }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q),
    );
  }, [deferred, stations]);

  const grouped = useMemo(() => {
    const map = new Map<string, Station[]>();
    for (const station of filtered) {
      const letter = station.name.charAt(0).toUpperCase();
      const list = map.get(letter) ?? [];
      list.push(station);
      map.set(letter, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const letters = grouped.map(([letter]) => letter);

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, city, or code"
          className="w-full min-h-12 rounded-2xl border border-line/80 bg-paper/90 px-4 py-3 text-base text-ink outline-none ring-rail/25 placeholder:text-ink-soft/70 focus:ring-2 sm:text-sm"
        />
        {deferred.trim() ? (
          <p className="mt-2 text-xs text-ink-soft">
            {filtered.length} of {stations.length}
          </p>
        ) : null}
      </div>

      {letters.length > 1 ? (
        <div className="flex flex-wrap gap-1.5">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="rounded bg-mist px-2 py-1 font-mono text-xs font-semibold text-ink-soft hover:bg-rail/10 hover:text-rail-deep"
            >
              {letter}
            </a>
          ))}
        </div>
      ) : null}

      <div className="space-y-8">
        {grouped.map(([letter, list]) => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className="font-display text-xl font-semibold text-ink">
              {letter}
            </h2>
            <ul className="mt-3 columns-1 gap-x-8 sm:columns-2 lg:columns-3">
              {list.map((station) => (
                <li key={station.code} className="mb-2 break-inside-avoid">
                  <Link
                    href={`/stations/${station.code}`}
                    className="group inline-flex items-baseline gap-2 text-sm hover:text-rail"
                  >
                    <span className="text-ink group-hover:underline">
                      {station.name}
                    </span>
                    <span className="font-mono text-xs text-ink-soft">
                      {station.code}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {grouped.length === 0 ? (
          <p className="text-sm text-ink-soft">No station by that name.</p>
        ) : null}
      </div>
    </div>
  );
}
