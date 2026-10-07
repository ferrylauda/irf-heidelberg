# IRF Heidelberg – Website

Static website for the **International Reformed Fellowship Heidelberg** (irf-heidelberg.org).
Plain HTML/CSS/JS, no build step. Languages: English, Bahasa Indonesia, Deutsch.

## Structure

```
index.html      Single-page site: Home, News, About, Sunday Service, Confession, Location, Contact
legal.html      Impressum & Datenschutz (required for German websites)
404.html        Error page for S3
css/styles.css  All styles (colours are CSS variables at the top)
js/i18n.js      All translations (en / id / de)
js/news.js      News items and the breaking-news pop-up
js/main.js      Language switch, mobile menu, news, pop-up, click-to-load map
favicon.svg
```

## Preview locally

Open `index.html` in a browser, or run a small server:

```
python -m http.server 8000
# or, with Node.js:
npx http-server -p 8000 -c-1
```

Then open http://localhost:8000. Add `?lang=de` or `?lang=id` to force a language.

## Things to fill in before going live

Search for `TODO` in the HTML files:

- Service time (`index.html`, currently 10:30) and service language
- Sunday School time and prayer meeting day/time (`index.html` + `js/i18n.js`, currently "Sundays · 14:00")
- Address and map coordinates (`index.html`, location section + map links)
- Contact email (`info@irf-heidelberg.org`)
- WhatsApp contact (Hendry): commented out in the contact section until the number is known
- The sample news item in `js/news.js`
- Impressum details in `legal.html` (responsible person / association)

## Editing text

All visible text lives in `js/i18n.js`, once per language under the same key.
The English text in the HTML is only a fallback; when you change a text, update `js/i18n.js`.

## News and breaking news

Everything is edited in `js/news.js` (texts once per language):

- **News:** add an entry to `items` (newest first, date as `YYYY-MM-DD`).
- **Breaking news pop-up** (e.g. a short-notice change of service time): fill in `breaking`,
  set `active: true` and give it a new `id`. Visitors see it as a pop-up once; after closing
  it, it stays pinned at the top of the News section. Set `active: false` to remove it.

## Adding activities or the gallery later

- **Activities:** duplicate an `activity` card in the `#worship` section.
- **Gallery:** put photos in `images/gallery/`, uncomment the gallery section in `index.html`
  and add a nav link `<a href="#gallery" data-i18n="nav.gallery">Gallery</a>`.
  The translations for the gallery are already in `js/i18n.js`.

## Deploy to AWS S3

```bash
aws s3 mb s3://irf-heidelberg.org --region eu-central-1
aws s3 website s3://irf-heidelberg.org --index-document index.html --error-document 404.html

aws s3 sync . s3://irf-heidelberg.org --delete \
  --exclude ".git/*" --exclude "README.md" \
  --cache-control "public, max-age=3600"
```

For HTTPS on the custom domain, put **CloudFront** in front of the bucket (Origin Access Control,
bucket stays private), use an ACM certificate from `us-east-1`, and point the domain (Route 53 or
your DNS provider) to the CloudFront distribution. With CloudFront, set the default root object to
`index.html` and map 403/404 errors to `/404.html`.
