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

- (Service time and language are set)

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
  --exclude ".git/*" --exclude "README.md" --exclude "backend/*" --exclude "aws/*" \
  --cache-control "public, max-age=3600"
```

For HTTPS on the custom domain, put **CloudFront** in front of the bucket (Origin Access Control,
bucket stays private), use an ACM certificate from `us-east-1`, and point the domain (Route 53 or
your DNS provider) to the CloudFront distribution. With CloudFront, set the default root object to
`index.html` and map 403/404 errors to `/404.html`.

## Contact form

The contact section has a form instead of an email address. It is a copy of the design used in
the `persekutuanheidelberg` project: the browser POSTs JSON to an API Gateway (throttled, CORS),
a Lambda checks it and sends it with Amazon SES to a private mailbox (Reply-To = visitor).
Nothing is stored and no address is shown on the site. Spam protection: hidden honeypot field,
server-side checks, CORS and throttling. Backend template: `backend/contact-form.yaml`.

Until the backend is deployed, `CONTACT_ENDPOINT` in `js/main.js` is empty and the form only
validates, then says honestly that nothing was sent.

To go live:

1. Deploy the stack in `eu-central-1` (needs CloudFormation, Lambda, API Gateway, IAM, SES and
   Logs permissions, which the S3-only deploy user does not have):
   ```
   AWS_CLI_FILE_ENCODING=UTF-8 aws cloudformation deploy --region eu-central-1 \
     --stack-name irf-contact-form --template-file backend/contact-form.yaml \
     --capabilities CAPABILITY_IAM \
     --parameter-overrides RecipientEmail=<private mailbox> SenderEmail=<same mailbox, or no-reply@your-domain>
   ```
2. Click the SES verification link that arrives at the recipient address.
3. Read the `ContactEndpoint` output and put it into `CONTACT_ENDPOINT` in `js/main.js`, then redeploy the site.
4. Add the final domain to `AllowedOrigins` if it differs from the defaults.

The privacy text (`legal.p5`) already describes the form.
