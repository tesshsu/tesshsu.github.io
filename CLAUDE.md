# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JavaScript personal portfolio site for Yating Chatiron, hosted on GitHub Pages. No build system — edit files and push to deploy.

## Deployment

- Push to `master` → GitHub Actions builds with Jekyll → deploys to `gh-pages` branch
- Live at `tesshsu.github.io`
- Manual deploy trigger also available in GitHub Actions

## Architecture

### Pages

| File | Purpose |
|------|---------|
| `index.html` | Main portfolio (English) |
| `fr.html` | Main portfolio (French) |
| `blog.html` | Blog listing with search and category filtering |
| `blogs/blog-N.html` | Individual blog posts (currently 24) |
| `invest.html` / `result-invest.html` | Luxembourg investment calculator tool |

### Component Loading Pattern

Sidebar and footer are **not inlined in HTML** — they are loaded dynamically via `fetch()` in `script.js`:
- `assets/partials/sidebar.html` → injected into `#sidebar-container`
- `assets/partials/footer.html` → appended to `<main>`

Any changes to navigation or footer must be made in the partials, not in individual pages.

### Blog System (`assets/js/blog.js`)

Blogs are discovered dynamically at runtime — `blog.js` makes HEAD requests to `blogs/blog-N.html` sequentially until it gets a 404, then parses each file's `<head>` metadata (title, date, category, image, subtitle) to populate the listing. No CMS or manifest file — the blog count is inferred from the filesystem.

To add a new blog post:
1. Create `blogs/blog-{N+1}.html` following the existing post structure
2. Include `<meta>` tags for `description` and Open Graph (`og:image`, `og:title`)
3. Add a `data-category` attribute matching one of: `Cyber`, `DevOps`, `Compute`

### Bilingual Support

English (`index.html`) and French (`fr.html`) are **separate, manually maintained HTML files**. The language switcher in the sidebar toggles between them. There is no i18n framework — content changes must be applied to both files.

### Sliders

Project and blog sliders in `script.js` shuffle their items on load and use absolute-positioned prev/next buttons. Slider images are 310px wide. On mobile, navigation buttons are hidden (CSS media query in `styles.css`).

### Investment Calculator

`invest.js` fetches real-time stock prices from Yahoo Finance via a CORS proxy. Uses Chart.js for result visualizations. Calculator state is passed between `invest.html` and `result-invest.html` via URL parameters or localStorage.

## Tech Stack

- **CSS**: Tailwind CSS via CDN + custom `assets/css/styles.css`
- **Icons**: Font Awesome 6.4.0 via CDN
- **Analytics**: GoatCounter (privacy-focused, no cookies)
- **Charts**: Chart.js (invest pages only)
- **No build tools, no package manager, no frameworks**

## Push git
- Do not used author as Claude