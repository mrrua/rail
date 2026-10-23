import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-start px-4 py-24 sm:px-6">
      <p className="font-mono text-sm text-signal">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">
        Not on this board
      </h1>
      <p className="mt-3 text-ink-soft">
        No route, station, or train by that name.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-rail px-4 py-2.5 text-sm font-semibold text-white hover:bg-rail-deep"
      >
        Home
      </Link>
    </div>
  );
}
