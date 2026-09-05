# SMART-PDS (AePDS) Bihar — Angular Clone

A local, Angular 20 reproduction of **https://epos.bihar.gov.in/** — the Aadhaar
enabled Public Distribution System (AePDS) portal of the Food, Civil Supplies &
Consumer Affairs Department, Government of Bihar.

The original is a **React SPA** backed by a **Spring** JSON API under
`/Epos_Spring/*`. This project reproduces the UI, structure and API-driven
behaviour in Angular, and talks to the **same live endpoints** through a dev
proxy (so the data is real, not hard-coded).

---

## 1. Requirements

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 (built/tested on 20–22) |
| npm | ≥ 10 |
| Angular CLI | 20.x (`npx ng` works without a global install) |

A modern browser (Chrome recommended). Internet access to `epos.bihar.gov.in`
is required for **live data** (the dev proxy forwards requests there).

## 2. Install

```bash
cd D:\Ration\epos          # the project root (this folder)
npm install
```

## 3. Run against the LIVE Bihar backend (default)

```bash
npm start
# or: npx ng serve
```

Then open **http://localhost:4200**.

`ng serve` uses **`proxy.conf.json`**, which forwards these paths to
`https://epos.bihar.gov.in` so the browser is not blocked by CORS:

| Path | Purpose |
|------|---------|
| `/Epos_Spring/*` | all Spring JSON APIs (header, home stats, menus, reports, dropdowns) |
| `/images/*` | "new" gifs and misc images |
| `/awards/*` | award badge images |
| `/static/media/*` | banner images + the seven-segment `digital` font |

> **Why a proxy?** The live site enforces same-origin/CORS. In development the
> Angular proxy makes `localhost:4200` requests appear to come from the server's
> own origin. In production, put the Angular build behind a reverse proxy (nginx,
> etc.) that maps the same paths to `epos.bihar.gov.in` (or the real backend host).

## 4. Run fully OFFLINE (mock backend)

No internet? A tiny mock backend reproduces the captured API shapes with sample
data, so the whole UI is browsable offline.

```bash
# terminal 1
npm run mock          # starts the mock backend on http://localhost:3101

# terminal 2
npm run start:mock    # ng serve using mock/proxy.conf.mock.json
```

## 5. Build for production

```bash
npm run build         # outputs to dist/epos-clone
```

---

## 6. Project structure

```
src/app/
├─ app.ts                     # root shell: <header> <nav> <router-outlet> <footer>
├─ app.routes.ts              # '' -> Home; ':link' -> generic ReportPage
├─ app.config.ts              # router + HttpClient providers
├─ core/
│  ├─ models/api.models.ts    # typed interfaces for every API response
│  ├─ reports.registry.ts     # link -> {title, filter, fetch} report config
│  └─ services/
│     ├─ api.service.ts       # one method per Spring endpoint
│     ├─ menu.service.ts      # cached menus + title lookup
│     ├─ ui-state.service.ts  # language (Eng/Hin) + font-size (+A/A/-A)
│     └─ util.ts              # dropdown/table/base64 normalisers
├─ shared/components/
│  ├─ header.component.ts     # logos (base64 from API) + headings + a11y controls
│  ├─ nav.component.ts        # brown mega-menu (get_Public_Menus), responsive
│  ├─ footer.component.ts
│  ├─ spinner.component.ts    # loading state
│  └─ data-table.component.ts # generic, responsive report table
└─ features/
   ├─ home/                   # carousel, live stats dashboard, reports sidebar,
   │                          # right accordion, awards
   └─ report/
      ├─ report-filter.component.ts  # date / month-year / district→AFSO→FPS
      └─ report-page.component.ts     # config-driven fetch + render
```

## 7. How data flows

- **Header / Footer** — `demo/getHeader/1`, `demo/getFooter/1`. Logos arrive
  base64-encoded inside the header JSON and are detected + rendered automatically.
- **Top mega-menu** — `demo/get_Public_Menus` (9 menus, ~70 report links).
- **Home dashboard** — `demo/getHome` provides the live PDS transaction counters,
  the left "Reports" list, and the visitor count. `api/getRightSideMenu` provides
  the coloured accordion (its header colours come straight from the API).
- **Reports** — every menu link routes to the generic `ReportPage`, which reads
  its config from `core/reports.registry.ts`:
  - **Detailed Transactions** (`AbstractTransReport`) → `POST /api/DetailedTrans/details` (date).
  - **FPS Details** (`dfso_fps_details`) → `GET /api/fps/activeMonthYear` then `GET /api/fps/fpsSummary`.
  - **Stock / Sales / etc.** → live Month/Year/District/AFSO/FPS filter
    (`Common/putMonths`, `Common/putYears`, `Common/getDistricts`, cascading office/FPS).
- Dropdown and table responses are normalised defensively, so varied server
  shapes still render.

## 8. Known limitations (by design)

These come from the original site's access controls, not from the clone:

1. **Login-gated area.** The brown-bar **Login** leads to the authenticated
   dealer/official portal, which needs official credentials and is out of scope
   for a public clone. The button is present but inert.
2. **Result endpoints for some reports are not pre-mapped.** Endpoints for the
   handful of reports confirmed against the live site (above) return real data.
   For other links, the **filter form is fully live** (real district/month/year
   endpoints) and the page clearly states that its result endpoint should be
   mapped in `core/reports.registry.ts` — add a `fetch: { method, path, confirmed:true }`
   entry to switch any report to live data once its endpoint is confirmed.
3. **CORS / network.** Live data requires the dev proxy (or a production reverse
   proxy). Without it, or without reachability to `epos.bihar.gov.in`, use the
   offline mock (section 4).
4. **Fonts.** Open Sans / Roboto load from Google Fonts; the seven-segment
   dashboard font (`digital.ttf`) loads from the origin via the proxy.

## 9. Adjusting to the real backend host

If the API is served from a different host than the web origin, edit the
`target` in `proxy.conf.json` (dev) or your reverse-proxy config (prod). All API
calls in `api.service.ts` are **relative** (`/Epos_Spring/...`), so no code
changes are needed — only the proxy target.
