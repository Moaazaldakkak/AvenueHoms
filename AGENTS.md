# AvenueHoms (Avenue project)

## What this is

A **static, offline-first mirror** of the **Kastell** real-estate WordPress demo theme
(`https://kastell.qodeinteractive.com/` — "Apartment Complex" layout).

It is **NOT** a real WordPress/PHP application. There is no backend, database,
or server-side logic — only pre-rendered HTML files plus their CSS/JS/image assets.

- Repo root: `/Users/muaz/Projects/Avenue`
- Git remote: `git@github.com:Moaazaldakkak/AvenueHoms.git` (private), branch `main`
- Main page: `kastell/site/apartment-complex/index.html`
- `kastell/site/index.html` is a 1-line meta-refresh redirect to `apartment-complex/`

## Directory layout

```
Avenue/
├── .gitignore                  # ignores .DS_Store
└── kastell/
    ├── index.html              # STALE original scrape (URLs still point at live host). Do not use.
    └── site/                   # the working mirror — THIS is what matters
        ├── index.html          # redirect -> apartment-complex/index.html
        ├── apartment-complex/
        │   └── index.html      # main fully-mirrored page (hero slider + map fixed)
        ├── wp-content/         # themes (kastell), plugins (revslider, js_composer,
        │                       #   woocommerce, mkdf-core, contact-form-7, ...), uploads/ (images)
        └── wp-includes/        # core WP assets (jquery, mediaelement, etc.)
```

## How to preview

Always serve from `kastell/site/` so the `../` relative paths resolve:

```bash
cd kastell/site && python3 -m http.server 8000
# open http://localhost:8000/apartment-complex/index.html
```

Opening HTML via `file://` mostly works too, but serving over HTTP is the reliable
way (some slider behaviors differ under `file://`).

## What was already done (by previous sessions)

1. **URL rewrite** — every `https://kastell.qodeinteractive.com/...` and
   `//kastell.qodeinteractive.com/...` reference in `apartment-complex/index.html`
   was rewritten to local relative paths (`../wp-content/...`, `../wp-includes/...`,
   `../property-item/.../index.html`, etc.), for both single-quoted/double-quoted
   HTML attributes AND escaped-slash inline-JSON strings.
2. **Missing assets downloaded** into the mirror, including:
   `uploads/2017/11/h4-slide-1.jpg` (hero bg), `graphic-1.png`, `graphic-2.png`,
   `google-pin.png`, `map-floor-plan-img.png`, favicon, `wlwmanifest.xml`,
   theme `filter_icon*.png`.
3. **Hero (RevSlider) fixed** — it was invisible because the wrapper starts
   `style="visibility:hidden"` and only becomes visible after `rs6.min.js`
   initializes; that JS (plus `rbtools.min.js`, `rs6.css`, and slide images)
   is now local.
4. **Google Maps section replaced** — the original custom Google Maps **JS API**
   map (needs API key + geocoder + `modules.min.js` marker code) was swapped for a
   plain standard embed iframe:
   `<iframe src="https://www.google.com/maps?q=...&output=embed&z=12">` (no key needed).
   The old `maps.googleapis.com/maps/api/js` script tag was removed.
5. **Wordfence tracking beacon removed**; inline-JS endpoints (`admin-ajax.php`,
   `cart_url`) made relative.
6. **git repo** `AvenueHoms` created (private) and pushed.

## Known limitations / gotchas

- **Navigation is not fully mirrored.** The main page links to ~113 other pages
  (`../property-item/*/index.html`, `../elements/*/index.html`, `../blog/*`, ...)
  that are **not** present in this mirror yet → they 404 locally. Only the
  `apartment-complex` page is currently complete.
- **`kastell/index.html` (top level) is stale** — it still contains live-site URLs.
  Other AI models should treat `kastell/site/` as the source of truth.
- **Third-party hosts intentionally remain** (they degrade gracefully offline,
  don't block rendering):
  - Google Fonts (`fonts.googleapis.com`)
  - Zendesk chat (`static.zdassets.com`)
  - GTM (`googletagmanager.com`)
  - qodInteractive toolbar (`toolbar.qodeinteractive.com`)
  - Vimeo embeds (`vimeo.com`) — only load with internet
  - `maps.googleapis.com` / `s.w.org` / `gmpg.org` refs are non-executable
    `<link>`/dependency hints, not active scripts
- **No backend.** If someone asks to "log in", "submit forms", "hook up admin",
  etc. — it cannot be done without rebuilding, because there is no WordPress/PHP/db.

## Git workflow facts

- Branch: `main` (tracks `origin/main`), 317 files committed.
- Push via SSH (`git push`), no PAT needed for pushes.
- GitHub repo is **private**: `https://github.com/Moaazaldakkak/AvenueHoms`.
- `gh` CLI is NOT installed on this machine; use the GitHub REST API + the
  token in macOS keychain (`security find-internet-password -s github.com -g`)
  if repo creation/API calls are needed.

## Quick verification commands

```bash
# all asset refs resolve locally
cd kastell/site && python3 - <<'EOF'
import re,os
s=open("apartment-complex/index.html",encoding="utf-8").read()
miss=[]
for m in re.finditer(r"""(?:src|href|data-lazyload|data-pin)=(['"])(.*?)\1""",s,re.I):
    r=m.group(2).split("?")[0].split("#")[0]
    if r and not r.startswith(("http","//","data:","javascript:","#",":")):
        if not os.path.exists(os.path.normpath(os.path.join("apartment-complex",r))): miss.append(r)
print("missing:",miss)
EOF

# live server smoke test
cd kastell/site && python3 -m http.server 8787 &
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8787/apartment-complex/index.html
```