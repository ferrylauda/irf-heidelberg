# IRF Heidelberg – Website

Static website for the **International Reformed Fellowship Heidelberg** (irf-heidelberg.org).
Plain HTML/CSS/JS. Languages: English, Bahasa Indonesia, Deutsch, each on its own URL
(`/`, `/id/`, `/de/`) so that search engines index all three.

## Structure

```
index.html      English single-page site (the source): Home, News, About, Sunday Service, Confession, Location, Contact
id/ de/         Generated Indonesian and German copies of index.html - do not edit by hand
tools/          build-languages.js generates id/, de/ and sitemap.xml
legal.html      Impressum & Datenschutz (required for German websites)
404.html        Error page for S3
css/styles.css  All styles (colours are CSS variables at the top)
js/i18n.js      All translations (en / id / de)
js/news.js      News items and the breaking-news pop-up
js/main.js      Language switch, mobile menu, news, pop-up, click-to-load map
favicon.svg
```

## Preview locally

Run the small preview server (Node.js, no install needed):

```
node tools/serve.js
```

Then open http://localhost:8000 (English), http://localhost:8000/id/ or http://localhost:8000/de/.
Opening the HTML files directly from disk does not work for the language pages, because they use
absolute paths like `/css/styles.css`.

Then open http://localhost:8000. Add `?lang=de` or `?lang=id` to force a language.

## Things to fill in before going live

Search for `TODO` in the HTML files:

- (Service time and language are set)

- Contact email (`info@irf-heidelberg.org`)
- WhatsApp contact (Hendry): commented out in the contact section until the number is known
- Impressum details in `legal.html` (responsible person / association)

## Editing text

All visible text lives in `js/i18n.js`, once per language under the same key (including the
`seo.*` keys for page title, description and structured data).
The English text in `index.html` must match `js/i18n.js`.

**After every change to `index.html` or `js/i18n.js`, run:**

```bash
node tools/build-languages.js
```

It regenerates `id/index.html`, `de/index.html` and `sitemap.xml` (the generated files are
committed). Visitors on `/` whose saved or browser language is Indonesian or German are sent to
`/id/` or `/de/`. The privacy page (`legal.html`) switches language in place.

## News and breaking news

Everything is edited in `js/news.js` (texts once per language):

- **News:** add an entry to `items` (newest first, date as `YYYY-MM-DD`). While `items` is empty
  and no breaking news is active, the News section and its menu link are hidden.
- **Breaking news pop-up** (e.g. a short-notice change of service time): fill in `breaking`,
  set `active: true` and give it a new `id`. Visitors see it as a pop-up once; after closing
  it, it stays pinned at the top of the News section. Set `active: false` to remove it.

## Adding activities or the gallery later

- **Activities:** duplicate an `activity` card in the `#worship` section.
- **Gallery:** put photos in `images/gallery/`, uncomment the gallery section in `index.html`
  and add a nav link `<a href="#gallery" data-i18n="nav.gallery">Gallery</a>`.
  The translations for the gallery are already in `js/i18n.js`.

## Deploy to AWS (live)

The site is live at https://www.irf-heidelberg.org (`irf-heidelberg.org` redirects to `www`).
Setup: private S3 bucket `www.irf-heidelberg.org` (eu-central-1) -> CloudFront distribution
`E2L6W284HEF46S` (Origin Access Control, ACM certificate in us-east-1, redirect function
`aws/redirect-apex.js`, which also serves `/id/` and `/de/` from their `index.html`) -> Route 53 zone `Z06221612TJEPIZM30K1M`.

To publish changes (AWS CLI profile `irf-heidelberg`):

```bash
node tools/build-languages.js   # stamps css/js with version hashes, rebuilds id/ de/ sitemap

# 1. css/ and js/ have a version hash in their URL: cache them for a year
aws s3 sync . s3://www.irf-heidelberg.org --delete \
  --exclude "*" --include "css/*" --include "js/*" \
  --cache-control "public, max-age=31536000, immutable"

# 2. everything else (HTML, sitemap, images): browsers must revalidate, so a new deploy shows at once
aws s3 sync . s3://www.irf-heidelberg.org --delete \
  --exclude ".git/*" --exclude ".gitignore" --exclude "README.md" --exclude "backend/*" \
  --exclude "aws/*" --exclude "tools/*" --exclude "css/*" --exclude "js/*" \
  --cache-control "no-cache"

aws cloudfront create-invalidation --distribution-id E2L6W284HEF46S --paths "/*"
```

Why: without version hashes and `no-cache` on the HTML, a browser could combine the new page with
an old cached stylesheet or script (a broken design until Ctrl+F5).

The IAM policies for the deploy user are in `aws/`.

## Contact form

The contact section has a form instead of an email address. It is a copy of the design used in
the `persekutuanheidelberg` project: the browser POSTs JSON to an API Gateway (throttled, CORS),
a Lambda checks it and sends it with Amazon SES to a private mailbox (Reply-To = visitor).
Nothing is stored and no address is shown on the site. Spam protection: hidden honeypot field,
server-side checks, CORS and throttling. Backend template: `backend/contact-form.yaml`.

Deployed as stack `irf-contact-form` (eu-central-1); `CONTACT_ENDPOINT` in `js/main.js` is set.
To redeploy or change it:

```
AWS_CLI_FILE_ENCODING=UTF-8 aws cloudformation deploy --region eu-central-1 \
  --stack-name irf-contact-form --template-file backend/contact-form.yaml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides RecipientEmail=ferry.lauda@gmx.de SenderEmail=no-reply@irf-heidelberg.org \
    SenderDomain=irf-heidelberg.org HostedZoneId=Z06221612TJEPIZM30K1M CreateRecipientIdentity=false
```

`CreateRecipientIdentity=false` because the recipient address already exists as a verified SES
identity (another project). SES is still in sandbox mode, which is fine: mail only goes to that
verified address. If the endpoint URL changes, update `CONTACT_ENDPOINT` and redeploy the site.

The privacy text (`legal.p5`) already describes the form.
