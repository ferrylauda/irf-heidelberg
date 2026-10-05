# IRF Heidelberg – Website

Static website for the **International Reformed Fellowship in Heidelberg** (irf-heidelberg.org).
Plain HTML/CSS/JS, no build step. Languages: English, Bahasa Indonesia, Deutsch.

## Structure

```
index.html      Single-page site: Home, About, Sunday Service, Confession, Location, Contact
legal.html      Impressum & Datenschutz (required for German websites)
404.html        Error page for S3
css/styles.css  All styles (colours are CSS variables at the top)
js/i18n.js      All translations (en / id / de)
js/main.js      Language switch, mobile menu, click-to-load map
favicon.svg
```

## Preview locally

Open `index.html` in a browser, or run a small server:

```
python -m http.server 8000
```

Then open http://localhost:8000. Add `?lang=de` or `?lang=id` to force a language.

## Things to fill in before going live

Search for `TODO` in the HTML files:

- Service time (`index.html`, currently 10:30) and service language
- Address and map coordinates (`index.html`, location section + map links)
- Contact email (`info@irf-heidelberg.org`)
- Impressum details in `legal.html` (responsible person / association)

## Editing text

All visible text lives in `js/i18n.js`, once per language under the same key.
The English text in the HTML is only a fallback; when you change a text, update `js/i18n.js`.

## Adding activities or the gallery later

- **Activities:** add another card in the `#worship` section (or duplicate the `service-card`).
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
