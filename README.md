# Rail

Live Amtrak status, organized the way you actually look it up: by route, by station, or by the number on your ticket.

Search the homepage for *Empire Builder* or `7`, open a station board, or follow one train down its timeline. The route pages keep a RailRat-style stop matrix so you can see the whole line at once.

Unofficial. Not affiliated with Amtrak. Use at your own risk.

## What it shows

- **Routes** — system status, plus a stop matrix and the trains currently on that line
- **Stations** — departed trains and the next one due
- **Trains** — progress, punctuality, and where that consist is right now
- **Search** — train number, train id, route name, or a station on the route

Several trains can share a number on the same day. Rail keeps them as separate trips (`7-19`, not just `7`) and prefers the one that is actually moving.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Share-link previews use `NEXT_PUBLIC_SITE_URL`, which is baked in at build time. Copy the example and set it before `npm run build`:

```bash
cp .env.example .env
```

```bash
NEXT_PUBLIC_SITE_URL=https://rail.patat.one
```

Add to Home Screen uses `/manifest.webmanifest` and `/apple-touch-icon.png`.

## Deploy

Ubuntu 24.04, same shape as the other apps in this folder. The server serves HTTP on port 80. TLS stays on the upstream forwarder.

```bash
# Copy only this file to the server, then:
chmod +x initial_deploy.sh
sudo ./initial_deploy.sh
```

Later:

```bash
sudo /opt/rail/update.sh
```

The scripts clone `git@github.com:mrrua/rail.git` into `/opt/rail`, run as the `rail` user, and proxy `rail.patat.one` to `127.0.0.1:3000`. Edit the config block at the top of both scripts if the remote or domain is different. `update.sh` resets to the remote branch and leaves the ignored `.env` in place.

## Data

Live trains and stations come from the [Amtraker](https://amtraker.com) API ([docs](https://api.amtraker.com/docs)). Train positions refresh about once a minute; station metadata is cached longer. Via and Brightline are filtered out.

Amtraker data is licensed under [ODC-By](https://opendatacommons.org/licenses/by/1-0/). Attribution is in the footer. The client sends a descriptive `User-Agent` from `src/lib/amtrak/client.ts`.

A static route catalog in `src/lib/data/` keeps the index complete when a route has no train out right now.

When you are actually traveling, Amtrak’s [Track Your Train](https://www.amtrak.com/track-your-train.html) map is the source to trust.

## Stack

Next.js (App Router), React, TypeScript, Tailwind CSS.
