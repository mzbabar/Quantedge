# series7.mzbacademy.com — Series 7 Mastery book site

Static site with a tiny build step (no dependencies). Vercel runs `node build.mjs`,
which copies `src/` to `public/` and fills in links from environment variables.

## Deploy
1. Upload this folder to a GitHub repo (or run `vercel` in it) and import it in Vercel.
   vercel.json already sets the build command and output folder.
2. Project → Settings → Domains → add `series7.mzbacademy.com` and create the CNAME it shows.
3. Project → Settings → Environment Variables → add the variables below.

## Amazon links (set these once the book is live)
| Variable | Example |
|---|---|
| KINDLE_URL | https://www.amazon.com/dp/B0XXXXXXXX |
| PAPERBACK_URL | https://www.amazon.com/dp/979816481102X |
| HARDCOVER_URL | https://www.amazon.com/dp/... |

Until a URL is set, its button shows "coming soon" (hardcover is hidden entirely).
**After adding or changing a variable, redeploy** (Deployments → ⋯ → Redeploy) — values are
built into the pages so search engines see the real Amazon links.

Optional: KINDLE_ASIN, PAPERBACK_ISBN, HARDCOVER_ISBN, *_PRICE (e.g. 39.99), ACADEMY_URL,
REPORT_ERROR_URL (https:// or mailto:), AUTHOR_CENTRAL_URL, GOODREADS_URL, LINKEDIN_URL,
GOOGLE_SITE_VERIFICATION, BING_SITE_VERIFICATION, GA_MEASUREMENT_ID (G-XXXX).

Short links for print/QR codes: /go/kindle, /go/paperback, /go/hardcover, /go/academy,
/go/report-error — these redirect live, no redeploy needed.

## Visit counter (hidden)
Every page counts visits silently; visitors see nothing. Only counts are stored: no IP addresses, no cookies.
1. Vercel → this project → **Storage** → **Create Database** → **Upstash for Redis** (free plan) →
   connect it to this project. That adds the database variables automatically.
2. Settings → Environment Variables → add **STATS_KEY** = your admin password
   (at least 8 characters, e.g. `s7Stats2026Babar`). Then redeploy.
3. Open **https://series7.mzbacademy.com/admin**, enter the password, and bookmark the page.
   You stay signed in on that browser for 90 days ("Sign out" link at the top right).

The page shows: visits and unique visitors (today, 7 and 30 days, all time) and average time per visit;
practice tests started, finished, completion rate, average score and the share scoring 72%+ for each exam
and quiz, plus a score distribution; the most-clicked links and buttons, by page, and Amazon button clicks;
each page's views, average time on page and how many visitors read 75%+ of it; landing pages; device,
country, U.S. state, new vs. returning and time of day; referring websites and utm_source campaigns;
flashcard decks opened, cards flipped and marked known; audio lessons played and finished; and a 30-day
daily table. Everything is stored as totals only.

## Readiness quiz, ratings, testimonials and social links
- **/series-7-readiness-quiz** is a free 20-question check weighted like the real exam. It shows a score by
  FINRA function and recommends the 8-, 4- or 2-week plan. Starts, finishes, average score and result bands
  appear on /admin under "Readiness quiz".
- The home page's **live counters** (questions answered, tests finished, readiness quizzes, flashcards flipped)
  come from /api/public-stats and stay hidden until PUBLIC_STATS_MIN questions (default 1,000) have been answered.
- **Ratings and testimonials are empty slots.** Set AMAZON_RATING and AMAZON_REVIEW_COUNT to your *actual*
  Amazon figures, and TESTIMONIAL_1..3 (+ _NAME) / TESTIMONIAL_VIDEO (a YouTube ID) only with real readers'
  words and their permission. Until then nothing shows. Invented reviews break Amazon's rules and the FTC's
  rule on fake reviews and testimonials.
- Footer: CONTACT_EMAIL, YOUTUBE_URL, TIKTOK_URL, INSTAGRAM_URL, FACEBOOK_URL, LINKEDIN_URL.

## Search engines and AI assistants
- **robots.txt** welcomes Google, Bing and the AI crawlers by name (ChatGPT/OpenAI, Claude, Perplexity,
  Gemini/Google-Extended, Apple, Meta, Amazon and others), so the site can be indexed and cited.
- **/llms.txt** is a short summary with key exam facts; **/llms-full.txt** is the text of every page in
  Markdown. AI assistants read these instead of parsing the HTML.
- Every page is plain HTML: the flashcards, audio lessons and practice-test catalog are also written into
  the page, so crawlers that do not run JavaScript still see the content.
- Fonts are self-hosted and the stylesheet is inlined, so pages paint without waiting on other servers.
- After each deploy, submit https://series7.mzbacademy.com/sitemap.xml in Google Search Console and
  Bing Webmaster Tools (Bing also feeds ChatGPT search and Copilot).

## After launch (SEO checklist)
1. Google Search Console: add the domain, paste the token into GOOGLE_SITE_VERIFICATION,
   redeploy, verify, then submit https://series7.mzbacademy.com/sitemap.xml.
2. Bing Webmaster Tools: same with BING_SITE_VERIFICATION (also feeds ChatGPT/Copilot search).
3. Amazon Author Central: claim the book, add a bio linking to this site; set AUTHOR_CENTRAL_URL.
4. Test structured data at https://search.google.com/test/rich-results.
5. Earn links: MZB Academy homepage, LinkedIn, Reddit r/FinancialCareers answers, Goodreads.

## Local preview
    KINDLE_URL=https://www.amazon.com/dp/TEST node build.mjs && npx serve public
