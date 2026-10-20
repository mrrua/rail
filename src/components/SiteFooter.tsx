import Link from "next/link";
import { getBoardMeta } from "@/lib/amtrak/board";
import { formatUpdatedAt } from "@/lib/format";

export async function SiteFooter() {
  const meta = await getBoardMeta();

  return (
    <footer className="mt-auto border-t border-line/60 bg-paper/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-ink-soft sm:px-6 sm:py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-display text-lg font-semibold text-ink">Rail</p>
            <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed">
              Unofficial Amtrak status board inspired by{" "}
              <a
                href="https://railrat.net/"
                className="text-rail-deep underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                RailRat.net
              </a>
              . Live train data from{" "}
              <a
                href="https://amtraker.com"
                className="text-rail-deep underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Amtraker
              </a>{" "}
              (
              <a
                href="https://api.amtraker.com/docs"
                className="underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                API docs
              </a>
              ), licensed under ODC-By. Not affiliated with Amtrak. Use at your
              own risk.
            </p>
          </div>
          <p className="font-mono text-xs text-ink-soft/90">
            {meta.source === "live" ? "Updated" : "Last attempt"}{" "}
            {formatUpdatedAt(meta.updatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <Link href="/routes" className="hover:text-rail-deep">
            Routes
          </Link>
          <Link href="/stations" className="hover:text-rail-deep">
            Stations
          </Link>
          <Link href="/trains" className="hover:text-rail-deep">
            Trains
          </Link>
          <a
            href="https://amtraker.com"
            className="hover:text-rail-deep"
            target="_blank"
            rel="noreferrer"
          >
            Amtraker
          </a>
          <a
            href="https://www.amtrak.com/track-your-train.html"
            className="hover:text-rail-deep"
            target="_blank"
            rel="noreferrer"
          >
            Amtrak Track Your Train
          </a>
        </div>
      </div>
    </footer>
  );
}
