# QuantEdge GMAT — website

Marketing site + student login for a GMAT Quant tutoring business.

- **Home page**: GMAT Quant section facts, free intro Zoom session, 4-week bootcamp ($349), FAQ
- **Student accounts**: email + password (bcrypt-hashed), secure signed-cookie sessions, CSRF protection, login rate limiting
- **Private student dashboard**: request the free Zoom session and see the Zoom link once confirmed; register for the bootcamp; read announcements, class links and resources from the tutor; ask the tutor questions and see replies
- **Tutor admin (`/admin`)**: schedule free sessions (add time + Zoom link), mark bootcamp students as paid/active, post announcements/resources (to everyone or to enrolled bootcamp students only), reply to questions, see the student list

Built with Node.js + Express + EJS. Data is stored in Postgres (required on Vercel); locally it falls back to a JSON file.

---

## Deploy to Vercel (about 10 minutes)

1. **Put the code on GitHub.** Create a new repository and upload this folder (everything except `node_modules`, `data`, and `.env`).
2. **Import to Vercel.** On vercel.com → **Add New… → Project** → pick the repo → **Deploy**. Vercel detects Express automatically; no build settings needed.
3. **Add a database.** In your Vercel project → **Storage** → **Create Database** → choose **Neon (Postgres)** → connect it to the project. This adds `DATABASE_URL` automatically. Tables are created on first request.
4. **Add environment variables** (Project → **Settings → Environment Variables**):

   | Name | Value |
   |---|---|
   | `SESSION_SECRET` | a long random string (e.g. from https://www.random.org/strings or `openssl rand -hex 32`) |
   | `ADMIN_EMAIL` | the email you'll use as the tutor (comma-separate for several) |
   | `CONTACT_EMAIL` | the email shown on the site |
   | `SITE_NAME` | optional, defaults to `QuantEdge GMAT` |
   | `BOOTCAMP_PRICE` | optional, defaults to `$349` |
   | `PAYMENT_LINK` | optional Stripe Payment Link (see below) |

5. **Redeploy** (Deployments → ⋯ → Redeploy) so the variables take effect.
6. **Create your tutor account**: open your site, click *Book free session*, and register with the `ADMIN_EMAIL` address. You'll land on `/admin`.
7. Optional: add your own domain under **Settings → Domains**.

## Taking payments (optional)

Create a **Payment Link** in Stripe for the $349 bootcamp and set it as `PAYMENT_LINK`. When a student clicks *Register for the bootcamp*, their seat is held and they're sent to Stripe with their email pre-filled. When the payment arrives, open `/admin` and set the student's enrollment to **active** — that unlocks the bootcamp-only posts on their dashboard.

Without `PAYMENT_LINK`, registration simply holds the seat and you invoice the student yourself (Zelle, PayPal, etc.).

## Day-to-day use

- **New free-session request** → `/admin` → enter the confirmed time and your Zoom link → status *scheduled* → Save. The student sees a *Join Zoom session* button.
- **Bootcamp class links / recordings / practice sets** → *Share with students*, audience *Enrolled bootcamp students only*.
- **Password resets**: there's no automated email yet; the login page tells students to email you. To reset, delete their row in Neon's SQL editor (`DELETE FROM docs WHERE collection='users' AND data->>'email'='student@x.com';`) and ask them to register again — or ask me to add email-based password reset.

## Run locally

```bash
npm install
cp .env.example .env    # then edit ADMIN_EMAIL
npm start               # http://localhost:3000
```

Without `DATABASE_URL`, data is saved to `data/db.json`. Paste your Neon `DATABASE_URL` into `.env` to use the real database locally.

## Notes

- GMAT facts on the home page (21 questions, 45 minutes, no calculator, section score 60–90, total 205–805) are from mba.com as of September 2026 — re-check if GMAC changes the exam.
- The login rate limiter is per server instance; for heavier protection enable Vercel Firewall rate-limiting rules on `/login` and `/register`.
