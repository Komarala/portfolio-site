# Portfolio Site

A performant, responsive personal portfolio with mobile‑first Tailwind styling, PWA support, dark mode, AOS animations, and Chart.js skills visualization. CI/CD includes Netlify (primary) and GitHub Pages (backup).

## Project Structure

- `assets/` images and fonts
   - `icons/` PWA icons (192, 512)
   - `fonts/` Inter WOFF2 (see below)
- `css/` styles and variables (no build required; Tailwind via CDN)
- `data/` decoupled content (`skills.json`, `projects.json`)
- `js/` client logic (`main.js`: theme, AOS, Chart.js, rendering)
- `index.html` main page (Hero, About, Skills, Projects, Contact)
- `manifest.json` PWA manifest
- `sw.js` service worker (basic static caching)
- `.github/workflows/deploy.yml` GitHub Pages CI
- `netlify.toml` Netlify config

## Prerequisites

- Node.js (see `.nvmrc` → `lts/*`). Optional for local dev server only.
- A modern browser (for Lighthouse audit and PWA install testing).

## Setup

1) Clone and enter the project
```bash
git clone <your-repo-url>
cd portfolio-site
```

### Git quick start
```bash
# Create a new repo from this folder
git init
git add -A
git commit -m "chore: initial project setup"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

2) (Optional) Use the recommended Node version
```bash
nvm use
```

3) Install dev dependencies (for local server only)
```bash
npm install
```

4) Run locally (serves index.html, JSON, and assets)
```bash
npm start
```

Open http://127.0.0.1:8080 (or shown URL).

## Fonts (WOFF2)

Place Inter font files (WOFF2) here:

- `assets/fonts/Inter-Variable.woff2` (weights 100–900)
- `assets/fonts/Inter-Regular.woff2`

They are referenced via `@font-face` with `font-display: swap` and preloaded in `index.html`.

## Deployment

### Netlify (Primary)
1) New site from Git → choose this repository.
2) Build command: leave empty (static site). Publish directory: `.`
3) After deploy, test the Contact form once; Netlify will auto-detect the form (`data-netlify="true"`).

File: `netlify.toml` sets Node version and security headers.

### GitHub Pages (Backup)
1) In GitHub → Settings → Pages → Source: GitHub Actions.
2) The included workflow `.github/workflows/deploy.yml` uploads the whole repo and deploys on push to `main`.

## PWA

- `manifest.json` wired in `<head>` with theme colors and icons.
- `sw.js` registered on load for static asset caching.
- Testing: In Chrome DevTools → Application → check Manifest and Service Workers; add to home screen on mobile.

## Analytics (Privacy‑focused)

- Plausible snippet is included in `index.html`. Replace `data-domain="example.com"` with your domain.
- To switch to Umami, swap the script per Umami docs.

## Uptime Monitoring

- Create a free UptimeRobot account and add an HTTPS monitor for your production URL.
- Set notifications (email/Slack). This fulfills monthly health checks.

## Lighthouse Audit

Run Lighthouse in Chrome DevTools (Audits/Performance tab) on your live site. Aim for Performance > 90.

CLI alternative:
```bash
npx lighthouse https://your-domain.example --view --only-categories=performance,accessibility,seo
```
Note: Requires Chrome; on CI use Lighthouse CI or PageSpeed Insights.

### Lighthouse CI (GitHub Actions)
This repo includes `.github/workflows/lighthouse.yml`. To enable automated weekly + on-push audits:

1) Set repo secret `SITE_URL` to your production URL (e.g., `https://yourdomain.com`).
2) Push to `main` or wait for the weekly schedule. Results are attached as workflow artifacts and uploaded to temporary public storage for quick viewing.

Local LHCI run (optional):
```bash
npx @lhci/cli autorun --collect.url=https://yourdomain.com --upload.target=temporary-public-storage
```

### Tips for score improvements
- Keep hero and LCP images preloaded and sized (already configured).
- Serve AVIF/WEBP for hero/project images (keep SVG fallback).
- Ensure fonts are WOFF2 + `font-display: swap` (configured).

## Maintenance Checklist

Monthly
- [ ] UptimeRobot status and false positive audit
- [ ] Run Lighthouse on production (Perf > 90, A11y & SEO pass)
- [ ] Review analytics privacy settings and traffic anomalies
- [ ] Validate Netlify Forms and spam honeypot
- [ ] Dependency audit: `npm audit` (if using local build tooling)
- [ ] Check PWA installability (manifest/SW still valid after changes)

## Style Guide

Theme variables (in `css/styles.css`):
- Colors: `--color-primary`, `--color-primary-600`, `--color-secondary`, `--color-accent`, `--color-text`, `--color-muted`, `--color-bg`, `--color-surface`
- Typography: `--font-sans`, `--font-mono`
- Spacing/Radius: `--space-*`, `--radius-*`

Dark mode
- Toggles `body.dark-mode`, overriding CSS variables.
- JS stores preference in `localStorage` and respects system preference by default.

Components
- Mobile‑first with Tailwind CDN utilities.
- AOS animations via `data-aos="fade-up"` on major sections.
- Skills: Cards + Chart.js horizontal bar chart with background track plugin.

## Troubleshooting

- If local Tailwind build is desired, upgrade to Tailwind v3 and add a PostCSS/CLI step (then update CI/Netlify build).
- If GitHub Pages is under a subpath, update `start_url` in `manifest.json` and asset paths in `sw.js`.

## License

MIT