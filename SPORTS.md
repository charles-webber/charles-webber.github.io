# Sports / Activity Widget

The `/sports/` page is a static, privacy-safe summary of activity data. Its UI is
loaded only on that page and uses the current Butterfly theme variables, so it
works in light mode, dark mode, mobile layouts, and PJAX navigation.

## Data flow

```text
Strava or export file
        ↓
data/private/sports-cache.json     (ignored, never published)
        ↓
source/_data/sports.json           (safe aggregate only)
        ↓
Hexo after_generate hook
        ↓
public/sports.json → /sports/ widget
```

The public file is an allow-listed aggregate. It has calendar-day totals, sport
type, distance, duration, monthly totals, recent activity summaries, and derived
records. It intentionally never includes GPS coordinates, route polylines,
start/end locations, precise start times, device IDs, Strava IDs, or credentials.

## Demo data

The repository currently includes a **small, clearly labelled DEMO** data set in
`source/_data/sports.json` so the page can be reviewed before connecting a real
source. It is not a record of your activity.

To replace it with real data, import an export with `--replace`; the public JSON
is regenerated automatically:

```bash
python tools/import_sports.py /path/to/exports --replace
```

To regenerate the small demo locally, use:

```bash
python tools/import_sports.py --demo
```

The demo's private cache is `data/private/sports-cache.json`; delete that cache
before importing real data if you no longer want it on your machine.

## Importing exports

The importer accepts files or directories and recursively recognises GPX, KML,
TCX, FIT, CSV and JSON files:

```bash
python tools/import_sports.py ~/Downloads/fitness-exports --replace
```

GPX coordinates are used only in memory to calculate distance and are discarded
before the private cache is written. TCX and FIT session summaries are handled in
the same way. FIT support needs one optional local dependency:

```bash
python -m pip install fitdecode
```

CSV columns may use `type`/`sport`, `date`/`start_date`, `distance_km` or
`distance_m`, and `duration_seconds` or `duration_minutes`. JSON accepts either
an activity array or an object containing `activities`.

### Huawei Health

Huawei Health route exports can be used directly. For each outdoor run, ride,
or walk, open the workout record in Huawei Health and use the route export
action. Prefer GPX or TCX; KML is supported too. Put all exported files in one
local folder and import it in one command:

```bash
python tools/import_sports.py data/private/huawei-export --replace
```

The importer also recognises common Huawei Chinese CSV column names, including
`运动类型`, `开始时间`, `距离`, `运动时长`, `爬升`, and `消耗卡路里`. Coordinates in
GPX/KML/TCX remain only in process memory long enough to calculate distance;
they are not retained in either cache or the published site. If a Huawei export
variant has a different CSV/JSON schema, provide its header row and one
redacted sample record to add an adapter without exposing personal data.

## Strava automatic sync

1. Create a Strava API application at <https://www.strava.com/settings/api>.
2. Copy `.env.sports.example` to `.env.sports` and fill in the client ID and
   client secret. The real file is ignored by Git and Docker.
3. In a browser, grant the application `activity:read` (or `activity:read_all`
   only if you deliberately want activities marked “Only You”) through:

```text
https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost/exchange_token&response_type=code&approval_prompt=force&scope=activity:read
```

4. Copy the `code` query parameter from the redirect URL, then run the one-time
   exchange and initial full sync:

```bash
python tools/sync_strava.py --authorization-code YOUR_CODE --full
```

The command stores the rotating refresh token only in `.env.sports` (or in the
separate file passed through `--env-file`), and writes only aggregate data into
`source/_data/sports.json`. Subsequent updates are simply:

```bash
npm run sports:update
```

Strava access tokens are short lived and refresh tokens can rotate, so a VPS is
the recommended automatic runner: its private environment file can be safely
updated by the sync script. Do not put any Strava secret in `source/`, browser
JavaScript, theme configuration, or an unencrypted public repository.

### VPS daily update

Store the credentials outside the repository, for example at
`/etc/mozhu-blog/strava.env` with permissions `600`. Then add this cron entry
after the first authorization-code exchange:

```cron
20 3 * * * root cd /opt/mozhu-blog && /usr/bin/python3 tools/sync_strava.py --env-file /etc/mozhu-blog/strava.env >> /var/log/mozhu-sports-sync.log 2>&1 && /usr/bin/docker compose up -d --build >> /var/log/mozhu-sports-sync.log 2>&1
```

This refreshes the private cache, regenerates the safe aggregate, and rebuilds
only the static blog image. `hexo generate` itself never calls a third-party API.

## Local preview and future sources

```bash
npm run sports:update
npm run server
```

The normalisation boundary is `normalise_activity()` in `tools/sports_data.py`.
Apple Health, Garmin, COROS, Keep, Huawei Health, and Xiaomi importers should
convert their exports to that same small schema rather than changing the page.
The travel widget can reuse the CSS card conventions but must keep its data store
and privacy boundary separate from sports activity data.

To embed the same widget in another page later, copy the `sports-root` container
and `sports-loader.js` tag from `source/sports/index.md`; use it only once per
page because it is an element ID.
