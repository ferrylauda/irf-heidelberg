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
- Impressum details in `legal.html` (responsible person / association)

## Editing text

All visible text lives in `js/i18n.js`, once per language under the same key.
The English text in the HTML is only a fallback; when you change a text, update `js/i18n.js`.

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
`aws/redirect-apex.js`) -> Route 53 zone `Z06221612TJEPIZM30K1M`.

To publish changes (AWS CLI profile `irf-heidelberg`):

```bash
aws s3 sync . s3://www.irf-heidelberg.org --delete \
  --exclude ".git/*" --exclude ".gitignore" --exclude "README.md" --exclude "backend/*" --exclude "aws/*" \
  --cache-control "public, max-age=3600"
aws cloudfront create-invalidation --distribution-id E2L6W284HEF46S --paths "/*"
```

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
