WORK IN PROGRESS

# Vocabulary Learning Application – Documentation & Showcase

> *A full‑stack demo project created as a portfolio piece.*

## 1. Introduction

The **Vocabulary Learning Application** demonstrates end‑to‑end skills in building interactive language‑learning tools. Although **not intended for production**, it illustrates modern front‑end techniques, scalable back‑end services, and algorithmic implementations. The system supports **bidirectional learning between Polish and English**.

## 2. Tech Stack

| Layer         | Technology                 | Key Libraries                                       |
| ------------- | -------------------------- | --------------------------------------------------- |
| **Front‑end** | React 18 + Vite 6          | react‑router‑dom, react‑intl (i18n), Chart.js, GSAP |
| **Back‑end**  | Node + Express             | JWT auth, PostgreSQL via pg‑Promise                 |
| **Testing**   | Vitest + Testing Library   | fake‑indexeddb, jsdom                               |
| **DevOps**    | NPM scripts + Vite preview | *start*, *build*, *test*                            |

## 3. High‑Level Architecture

```
User ↔ React SPA ↔ REST API ↔ PostgreSQL
                       ↑
                 Admin Panel (JWT "admin")
```

* **JWT** secures every request, and the *admin* role unlocks additional endpoints. citeturn1file0

### 3.1 Vocabulary Data Preparation

The server hosts **≈ 5 000 vocabulary entries (3 000 B2 + 2 000 C1)**.

*Words are pre‑shuffled on the server into random batches of 30 (separate B2 and C1 pools).*
This removes randomization cost from the front‑end and **guarantees consistency across game modes**.

## 4. Global Features

### 4.1 Localisation, Themes & Responsiveness

* **Polish / English** toggled via `react‑intl`; all strings live in JSON bundles. citeturn1file1
* **Dark mode** – preference stored in `localStorage`; Tailwind classes rehydrate the UI.
* Mobile‑first layout down to **320 × 568 px**.

### 4.2 Authentication & Authorisation

* Sign‑up, sign‑in and token refresh.
* *Admin* role verified on the server and enforced by route guards. citeturn1file0

### 4.3 Error Reports

A **“Report Bug”** icon in the sidebar (logged‑in users only). Two report types: *word issue* and *other*. Server‑side validation blocks spam. citeturn1file11

## 5. Modules / Pages

> Order matches the sidebar navigation.

### 5.1 Flashcards – Core Game

Implements the **Leitner method** with five boxes. Correct translations move a word up; mistakes reset it to box 1. The Levenshtein algorithm tolerates a single typo, and settings let learners ignore Polish diacritics. citeturn1file13

* **Levels:** B2 (\~3 000 words) and C1 (\~2 000 words). citeturn1file13
* **Progress sync:** once logged in, flashcard progress is stored in the cloud and can be resumed on any device.
* **UI touches:** GSAP animations (bounce, confetti), dynamic input underline, full keyboard control. citeturn1file7
* **Progress bars:** global + daily — default goal 20 words/day, reset at 00:00. citeturn1file7

### 5.2 Vocabulary Test

Learners **measure what percentage** of the **3 000 B2** or **2 000 C1** words they already know.
*The server delivers chunks of 30 words to avoid cognitive overload.*
Progress is saved locally so the test can be finished later. Levenshtein and typo tolerance still apply. citeturn1file9

### 5.3 Arena (PvP)

Competitive online mode – the server assigns words based on the current rating (0 – 3 000 pts). Each answer instantly updates the score, and a chart visualises the trend. citeturn1file4

* **Availability:** Arena is restricted to registered users so the leaderboard reflects genuine progress.

### 5.4 Leaderboard

Two rankings: *Flashcards* (1 pt = 1 learned word) and *Arena* (PvP rating). Shows the TOP 10. citeturn1file10

### 5.5 Settings (Global)

1. **UI & audio:** sounds, dark mode, language, box skins. citeturn1file8
2. **Gameplay:** ignore diacritics, typo tolerance, daily goal. citeturn1file8
3. **Reset:** restore defaults, reset Flashcard/Test progress (B2/C1 separately). citeturn1file8

### 5.6 Account Settings

Change e‑mail, nickname, password and one of four avatars (used in leaderboards). Option for permanent account deletion. citeturn1file3

### 5.7 Admin Panel

Visible only to users with the *admin* role (verified via JWT and route guards). It provides **complete operational control** over the platform.

| Section             | Purpose                   | Key Features                                                                                                                                                   |
| ------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**       | High‑level KPIs           | Total users, active sessions, login trend, game visits; real‑time counters and Chart.js line & bar charts. citeturn1file0                                   |
| **Reports**         | Content & bug reports     | Filter by status, type, date; inline preview; bulk resolve/close with undo; email notification trigger. citeturn1file2                                      |
| **Words CRUD**      | Vocabulary management     | Fast search by ID or word, inline edit & delete, level tagging (B2/C1); batch import/export as CSV. citeturn1file5                                          |
| **Users**           | User administration       | Paginated table: ID, username, e‑mail, created at, last login, ranking ban toggle, role switch, soft/hard delete; multi‑select bulk actions. citeturn1file6 |
| **Audit Logs**      | Compliance & traceability | Timestamped log of every admin action; searchable and exportable (CSV/JSON).                                                                                   |
| **System Settings** | Platform configuration    | JWT secret rotation, database maintenance triggers, feature flags for A/B tests.                                                                               |

> **Security model:** Each section calls dedicated `/admin/*` endpoints protected by role‑based middleware; actions are idempotent and logged. JWT tokens expire after 15 min and can be refreshed via a secure refresh‑token flow.

---

# Backend Documentation – Vocabulary Learning App

---

## 1. Introduction

A short overview of the project, its purpose and what the backend is responsible for (word storage, user authentication, statistics, admin panel, etc.).

## 2. Technology Stack

| Layer             | Technology                                                  | Description                                           |
| ----------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| Runtime           | **Node.js 20 + Express 4**                                  | HTTP server and routing                               |
| Database          | **PostgreSQL** (library `pg`)                               | Relational database                                   |
| Authentication    | **JWT** (`jsonwebtoken`)                                    | Token stored in an HTTP‑only cookie                   |
| Security          | `express-rate-limit`, `cors`, `bcrypt`, `express-validator` | Rate limits, CORS, password hashing, input validation |
| Dev & CI          | `nodemon`, `jest`, `supertest`, Babel                       | Hot‑reload, unit & integration tests                  |
| Utility libraries | `dotenv`, `node-cron`, `nodemailer`, `date-fns`             | Config, CRON jobs, e‑mails, date helpers              |

## 3. Environment Configuration

`.env.local` (development) / `.env.production` (production). Key variables:

```dotenv
_DATABASE=postgres://user:pass@host:5432/db
_DB_USER=
_DB_HOST=
_DB_NAME=
_DB_PASSWORD=
_DB_PORT=
_TOKEN_KEY=
_ADMIN_PIN=
_APP_EMAIL_USER=...
_APP_EMAIL_PASSWORD=
```

### Missing variables handling

`config.js` throws and stops the server if any critical variable is absent.
`TODO`: add a friendly console message on startup.

## 4. Application Architecture

```
┌─────────────┐      JWT cookie      ┌────────────┐
│ Front‑end   │  ─────────────────▶ │ Express    │
│ React app   │ ◀────────────────── │ Routers    │
└─────────────┘     JSON REST        └────┬───────┘
                                          │
                                          ▼
                                 ┌────────────┐
                                 │ PostgreSQL │
                                 └────────────┘
```

**Main routers / modules**: `auth`, `word`, `user`, `report`, `admin`, `analytics`.

`TODO`: insert ERD diagram (export from dbdiagram.io) and a short description of table relations.

## 5. Database

Example tables:

* **users** (id, username, email, password\_hash, role, last\_login\_at)
* **words** (id, word, translation\_pl, translation\_en, patch, level)
* **answers\_history** (id, user\_id, word\_id, is\_correct, answered\_at)
* **reports** (id, user\_id, word\_id, type, description, status)

`TODO`: complete full list with foreign keys.

## 6. API

### Sample endpoint

| Method | Path          | Auth | Validators       | 200 Example                                          |
| ------ | ------------- | ---- | ---------------- | ---------------------------------------------------- |
| POST   | `/auth/login` | none | `loginValidator` | `{ "success": true, "message": "Login successful" }` |

The full endpoint list lives in **API\_endpoints.md** (generated from `Backend.md`).

## 7. Authentication Flow

1. Client posts `username`, `password` to `/auth/login`.
2. Server looks up the user and compares passwords with `bcrypt.compare`.
3. Generates a 1‑hour JWT: `jwt.sign({ id, username, role }, TOKEN_KEY, { expiresIn: "1h" })`.
4. Sends back a `token` cookie (**httpOnly**, `secure` in production, `sameSite=lax`).
5. Every subsequent request goes through `authenticateToken` and, if needed, `authorizeAdmin`.

## 8. Error Handling

JSON format (translated on the front‑end):

```json
{
  "success": false,
  "message": "ERR_TOKEN_NOT_FOUND",
  "code": "ERR_TOKEN_NOT_FOUND"
}
```

`TODO`: centralised error‑handler middleware + a table of all codes.

## 9. Validation & Security

* `express-validator` – specific rules per endpoint.
* Rate limiting: `express-rate-limit` (e.g. 15 failed logins → IP blocked for 1 h).
* CORS – allow only `https://your‑domain.com` in production.
* Password hashing: `bcrypt` (salt 10).
* `TODO`: add `helmet` and payload sanitisation.

## 10. Testing

* **Jest** + **Supertest** – API tests (login, word CRUD, ...).
* Script: `npm test`.
* `TODO`: describe `tests/` folder structure and show an example test.

## 11. Monitoring & Logging (planned)

* **HTTP logs**: `morgan` → file or stdout.
* **App logs**: `winston` with file transport.
* **Monitoring**: Prometheus + Grafana or a SaaS (e.g. New Relic).

## 12. Deployment & CI/CD (planned)


## 13. Scalability & Growth

| Challenge             | Proposed Solution                                      |
| --------------------- | ------------------------------------------------------ |
| Lots of requests      | Load balancer + multiple instances (PM2 cluster / K8s) |
| Slow DB queries       | Proper indexes, Redis cache                            |
| Heavy background jobs | Queue system (BullMQ)                                  |

## 14. Roadmap

* [ ] Finish ERD & endpoint list
* [ ] Add error‑handler + logger
* [ ] Prepare Docker deploy + CI/CD
* [ ] Add monitoring and metrics

---

