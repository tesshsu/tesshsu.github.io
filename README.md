# Yating Chatiron — Portfolio

**Live site: [tesshsu.github.io](https://tesshsu.github.io/)**

Personal portfolio and technical blog for Yating Chatiron — Cybersecurity & Cloud Infrastructure Engineer specializing in healthcare/medical systems. Static site, hosted on GitHub Pages, built with Jekyll.

## Site Structure

- `index.html` / `fr.html` — Main portfolio (English / French), sections for About, Experience, Certificates, and Skills.
- `blog.html` — Blog listing (search + category filtering: Cyber, DevOps, Compute).
- `blogs/blog-N.html` — Individual blog posts, discovered dynamically at runtime.
- `invest.html` / `result-invest.html` — Luxembourg life-insurance investment calculator.
- `assets/partials/` — Shared sidebar/footer, loaded via `fetch()` into every page.
- `_includes/ga-tag.html` — Shared Google Analytics tag, included via Jekyll (`{% include ga-tag.html %}`) on every page.
- `sitemap.xml`, `robots.txt`, `llms.txt` — SEO / AI-crawler discovery files.

## Setup

1. Clone: `git clone https://github.com/tesshsu/tesshsu.github.io.git`
2. Edit files directly — no build step required locally.
3. Push to `master` → GitHub Actions builds with Jekyll → deploys to `gh-pages`.

To add a new blog post: create `blogs/blog-{N+1}.html` following the existing post structure (see `blogs/blog-template.html`), including `.blog-title`, date, `.category`, and `.sub-title` elements — `blog.js` parses these at runtime, no manifest needed.

## Technologies Used

- HTML, Tailwind CSS (via CDN), Vanilla JavaScript
- Jekyll (GitHub Pages default build)
- Chart.js (investment calculator)
- GoatCounter + Google Analytics (traffic)
