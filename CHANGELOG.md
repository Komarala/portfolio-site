# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] - 2025-10-18
### Fixed
- JSON not reflecting in UI in some cases due to stale service worker cache; bumped cache and added `data/site.json` to precache
- Service worker registration now uses relative path (`./sw.js`) for GitHub Pages/subpath compatibility
- Contact form controls now follow device theme (explicit input/textarea/select theming)

### Changed
- Switched service worker asset list to relative paths and updated cache name (`portfolio-cache-v2`)
- Optional JSON-driven hero image support in `applySiteContent` (updates `<img src>` when provided)
- Updated hero/Open Graph image references to `assets/PicCV.jpg`

## [1.1.0] - 2025-10-18
### Added
- JSON-driven site copy: `data/site.json` with runtime population in `js/main.js` (hero/about/section headings)
- Lighthouse CI workflow (`.github/workflows/lighthouse.yml`) and config (`.lighthouserc.json`) with performance/accessibility/SEO thresholds
- Netlify Forms integration in Contact section (`data-netlify="true"`, honeypot)
- Plausible analytics snippet (replace `data-domain` with your domain)
- `.gitignore` including `node_modules/` and common artifacts

### Changed
- Theme now follows system preference via `prefers-color-scheme`; removed manual toggle button
- Improved performance hints: preconnects, preloads, and explicit image dimensions to reduce CLS

### Docs
- Expanded README: Git quick start, Lighthouse CI setup, deployment, maintenance checklist, and style guide

## [1.0.0] - 2025-10-18
### Added
- Initial project structure (assets, css, data, js)
- Mobile-first Tailwind styling via CDN
- CSS variables and dark mode support
- AOS animations for sections
- Chart.js skills visualization with horizontal bars and background track
- Structured JSON content: `data/skills.json`, `data/projects.json`
- Responsive images with lazy-loading and SVG fallbacks
- SEO meta, Open Graph, and Twitter Card tags
- WOFF2 font setup with preload and `font-display: swap`
- PWA manifest and service worker (static caching)
- Netlify config and GitHub Pages workflow
- README with setup, deploy, maintenance, and style guide
