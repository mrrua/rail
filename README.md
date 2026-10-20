# Rail

A modern unofficial Amtrak train status board inspired by [RailRat.net](https://railrat.net/). Browse system status by **route**, **station**, and **train**, with progress timelines, station boards, and a RailRat-style schedule matrix.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For correct social/link preview URLs when deploying, set:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Add to Home Screen uses `/manifest.webmanifest` and `/apple-touch-icon.png`.

## Data

Live train and station data comes from the [Amtraker](https://amtraker.com) API (`api.amtraker.com`), cached for about a minute. Amtraker data is licensed under [ODC-By](https://opendatacommons.org/licenses/by/1-0/); attribution is shown in the UI and footer.

Static route catalog stubs in `src/lib/data/` fill in routes with no current trains so the index stays complete.

## Notes

- Unofficial and unaffiliated with Amtrak.
- Prefer Amtrak’s [Track Your Train](https://www.amtrak.com/track-your-train.html) map as the authoritative source when traveling.
- Identify this app with a clear `User-Agent` when calling Amtraker (already set in `src/lib/amtrak/client.ts`).
