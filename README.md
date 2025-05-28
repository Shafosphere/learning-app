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

* **JWT** secures every request, and the *admin* role unlocks additional endpoints.

### 3.1 Vocabulary Data Preparation

The server hosts **≈ 5 000 vocabulary entries (3 000 B2 + 2 000 C1)**.

*Words are pre‑shuffled on the server into random batches of 30 (separate B2 and C1 pools).*
This removes randomization cost from the front‑end and **guarantees consistency across game modes**.

## 4. Global Features

### 4.1 Localisation, Themes & Responsiveness

* **Polish / English** toggled via `react‑intl`; all strings live in JSON bundles.
* **Dark mode** – preference stored in `localStorage`; Tailwind classes rehydrate the UI.
* Mobile‑first layout down to **320 × 568 px**.

### 4.2 Authentication & Authorisation

* Sign‑up, sign‑in and token refresh.
* *Admin* role verified on the server and enforced by route guards.

### 4.3 Error Reports

A **“Report Bug”** icon in the sidebar (logged‑in users only). Two report types: *word issue* and *other*. Server‑side validation blocks spam. 

## 5. Modules / Pages

> Order matches the sidebar navigation.

![Main Page & Level Selection](./gifs/mainpage.gif) 

![Level Selection for Flashcards and Vocab Test](./gifs/chooselevel.gif)  
Before starting the Vocabulary Test or Flashcards, users choose their proficiency level (B2 or C1) as shown above.

### 5.1 Flashcards – Core Game

Implements the **Leitner method** with five boxes. Correct translations move a word up; mistakes reset it to box 1. The Levenshtein algorithm tolerates a single typo, and settings let learners ignore Polish diacritics.


![Flashcards Demo 1](./gifs/flashcards1.gif)

![Flashcards Demo 2](./gifs/flashcards2.gif)

* **Levels:** B2 (\~3 000 words) and C1 (\~2 000 words).
* **Progress sync:** once logged in, flashcard progress is stored in the cloud and can be resumed on any device.
* **UI touches:** GSAP animations (bounce, confetti), dynamic input underline, full keyboard control.
* **Progress bars:** global + daily — default goal 20 words/day, reset at 00:00.

### 5.2 Vocabulary Test

Learners **measure what percentage** of the **3 000 B2** or **2 000 C1** words they already know.
*The server delivers chunks of 30 words to avoid cognitive overload.*
Progress is saved locally so the test can be finished later. Levenshtein and typo tolerance still apply.

![Vocabulary Test Demo](./gifs/vocatest.gif)

### 5.3 Arena (PvP)

Competitive online mode – the server assigns words based on the current rating (0 – 3 000 pts). Each answer instantly updates the score, and a chart visualises the trend.

![Arena Demo](./gifs/arena.gif)

* **Availability:** Arena is restricted to registered users so the leaderboard reflects genuine progress.

### 5.4 Leaderboard

Two rankings: *Flashcards* (1 pt = 1 learned word) and *Arena* (PvP rating). Shows the TOP 10.

### 5.5 Settings (Global)

1. **UI & audio:** sounds, dark mode, language, box skins.
2. **Gameplay:** ignore diacritics, typo tolerance, daily goal.
3. **Reset:** restore defaults, reset Flashcard/Test progress (B2/C1 separately).

![App Settings Demo](./gifs/appsettings.gif)

### 5.6 Account Settings

Change e‑mail, nickname, password and one of four avatars (used in leaderboards). Option for permanent account deletion.

![Account Settings Demo](./gifs/accsettings.gif)

### 5.7 Admin Panel

Visible only to users with the *admin* role (verified via JWT and route guards). It provides **complete operational control** over the platform.

| Section             | Purpose                   | Key Features                                                                                                                                                   |
| ------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**       | High‑level KPIs           | Total users, active sessions, login trend, game visits; real‑time counters and Chart.js line & bar charts.                                    |
| **Reports**         | Content & bug reports     | Filter by status, type, date; inline preview; bulk resolve/close with undo; email notification trigger.                                       |
| **Words CRUD**      | Vocabulary management     | Fast search by ID or word, inline edit & delete, level tagging (B2/C1); batch import/export as CSV.                                           |
| **Users**           | User administration       | Paginated table: ID, username, e‑mail, created at, last login, ranking ban toggle, role switch, soft/hard delete; multi‑select bulk actions.  |
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
DATABASE=postgres://user:pass@host:5432/db
DB_USER=
DB_HOST=
DB_NAME=
DB_PASSWORD=
DB_PORT=
TOKEN_KEY=
ADMIN_PIN=
APP_EMAIL_USER=...
APP_EMAIL_PASSWORD=
```

### Missing variables handling

`config.js` throws and stops the server if any critical variable is absent.
`TODO`: add a friendly console message on startup.

## 4. Application Architecture / Database

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

![diagram](diagram.png)

### 5 Database Schema

A detailed list of tables, key columns, and the designation of primary keys (PK) and foreign keys (FK) follows.

#### Tables and Columns

* **users**

  * `id` (PK)
  * `username`
  * `email`
  * `password_hash`
  * `role`
  * `disabled`
  * `created_at`
  * `last_login_at`

* **word**

  * `id` (PK)
  * `word`
  * `translation_pl`
  * `translation_en`
  * `patch`
  * `level`

* **translation**

  * `id` (PK)
  * `word_id` (FK → word.id)
  * `language_code`
  * `text`

* **word\_patches**

  * `patch_id` (PK)
  * `description`

* **b2\_patches**

  * `patch_id` (PK, FK → word\_patches.patch\_id)
  * `word_ids` (JSON)

* **c1\_patches**

  * `patch_id` (PK, FK → word\_patches.patch\_id)
  * `word_ids` (JSON)

* **user\_word\_progress**

  * `id` (PK)
  * `user_id` (FK → users.id)
  * `word_id` (FK → word.id)
  * `box_number`
  * `last_answered`

* **answer\_history**

  * `id` (PK)
  * `user_id` (FK → users.id)
  * `word_id` (FK → word.id)
  * `is_correct`
  * `answered_at`

* **arena**

  * `id` (PK)
  * `user_id` (FK → users.id)
  * `current_point`
  * `answered_at`

* **user\_autosave**

  * `id` (PK)
  * `user_id` (FK → users.id)
  * `words` (JSON)
  * `updated_at`

* **user\_activity\_stats**

  * `activity_date` (part of PK)
  * `activity_type` (part of PK)
  * `activity_count`

* **page\_visit\_stats**

  * `visit_date` (part of PK)
  * `page` (part of PK)
  * `visit_count`

* **ranking**

  * `user_id` (PK, FK → users.id)
  * `point`
  * `updated_at`

* **reports**

  * `id` (PK)
  * `user_id` (FK → users.id)
  * `word_id` (FK → word.id)
  * `type`
  * `description`
  * `status`

## 6. API

The full endpoint list lives in **API\_endpoints.md**

## 7. Authentication Flow

1. Client posts `username`, `password` to `/auth/login`.
2. Server looks up the user and compares passwords with `bcrypt.compare`.
3. Generates a 1‑hour JWT: `jwt.sign({ id, username, role }, TOKEN_KEY, { expiresIn: "1h" })`.
4. Sends back a `token` cookie (**httpOnly**, `secure` in production, `sameSite=lax`).
5. Every subsequent request goes through `authenticateToken` and, if needed, `authorizeAdmin`.

## 8. Error Handling

### 8.1 Goal

Provide a consistent, debuggable, and i18n‑ready way of conveying errors between **backend (Express)** and **frontend (React + Axios)**.

---

### 8.2 Backend – how an error is created

| Element            | File                             | Role                                                                                                                                                                  |
| ------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ApiError`**     | `src/errors/ApiError.js`         | Base class for all our errors (extends `Error`). Accepts **`statusCode, code, message, details?`**.                                                                   |
| **`catchAsync`**   | `src/utils/catchAsync.js`        | Higher‑order function that wraps controllers so `async/await` exceptions are forwarded to `next()` as an `ApiError`.                                                  |
| **Global 404**     | `app.js`                         | When no route matches → `next(new ApiError(404, 'ERR_NOT_FOUND', 'Route not found'))`.                                                                                |
| **`errorHandler`** | `src/middleware/errorHandler.js` | Last middleware in the stack. Turns any `ApiError` into a JSON response (see 8.3), logs the stack trace, and maps unexpected exceptions to `ERR_UNKNOWN_ERROR (500)`. |

```js
// example use in a controller
export const login = catchAsync(async (req, res) => {
  if (!req.body.email) {
    throw new ApiError(400, 'ERR_VALIDATION', 'ERR_VALIDATION', [
      { field: 'email', msg: 'Email is required', value: null }
    ]);
  }
  ...
});
```

---

### 8.3 Standard response format

```jsonc
{
  "success": false,          // always false for errors
  "code": "ERR_VALIDATION",  // fixed key starting with ERR_
  "message": "ERR_VALIDATION", // code or ready‑to‑show string
  "details": [...]           // optional array/object with extra info
}
```

**Examples**

*401 – missing token*

```json
{
  "success": false,
  "code": "ERR_TOKEN_NOT_FOUND",
  "message": "ERR_TOKEN_NOT_FOUND"
}
```

*400 – validation error*

```json
{
  "success": false,
  "code": "ERR_VALIDATION",
  "message": "ERR_VALIDATION",
  "details": [
    { "field": "email", "msg": "Email is required", "value": null }
  ]
}
```

---

### 8.4 Error code glossary

| Code                       | HTTP | Meaning                  | Default front‑end action                  |
| -------------------------- | ---- | ------------------------ | ----------------------------------------- |
| **ERR\_NOT\_FOUND**        | 404  | Route/resource not found | Popup "Route not found"                   |
| **ERR\_TOKEN\_NOT\_FOUND** | 401  | Missing JWT              | Interceptor rejects → login redirect      |
| **ERR\_TOKEN\_EXPIRED**    | 401  | Expired JWT              | Refresh token / re‑login                  |
| **ERR\_VALIDATION**        | 400  | Invalid input            | First item in `details` is shown          |
| **ERR\_UNKNOWN\_ERROR**    | 500  | Unhandled server error   | Generic popup "An unknown error occurred" |

> **Tip:** The full list is kept in `errors/codes.js`. Remember to add new entries and translations in `en.json` / `pl.json`.

---

### 8.5 Front‑end interceptor (Axios)

```js
import axios from 'axios';
import { showPopup } from './popupManager';
import { translate } from './intlManager';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status    = error.response?.status;
    const errorCode = error.response?.data?.code;

    // 1) Special path for auth errors
    if (errorCode === 'ERR_TOKEN_NOT_FOUND') {
      return Promise.reject(error); // login page takes over
    }

    // 2) Defaults
    let rawMsg = error.response?.data?.message || 'ERR_UNKNOWN_ERROR';
    let params = {};

    // 3) Validation – pick first item
    const list = error.response?.data?.details || error.response?.data?.errors;
    if (status === 400 && Array.isArray(list) && list.length) {
      rawMsg = list[0].message || list[0].msg || rawMsg;
      params = list[0].params || {};
    }

    // 4) i18n
    const finalMsg = rawMsg.startsWith('ERR_')
      ? translate(rawMsg, 'An unknown error occurred', params)
      : rawMsg;

    // 5) Popup
    showPopup({
      message: finalMsg,
      emotion: status >= 500 ? 'warning' : 'negative',
      duration: 5000,
    });

    return Promise.reject(error);
  }
);

export default api;
```

**Flow**

1. 2xx responses pass through untouched.
2. On error, read `status`, `code`, `message`, `details`.
3. `ERR_TOKEN_NOT_FOUND` hands control to routing (logout / redirect).
4. On 400 validation, the first detail item overrides `message`.
5. If `message` starts with `ERR_`, it is passed to `translate()` and returned as UI‑language text.
6. Every error triggers a popup; `status >= 500` uses the "warning" emotion.

---

### 8.6 Checklist – adding a new error

1. Add the `ERR_…` constant in `errors/codes.js`.
2. Throw `new ApiError(...)` in a controller/service.
3. Add translations to `pl.json` and `en.json`.
4. Update the table in section 8.4.

> Thanks to this centralised approach, reporting and displaying errors is **consistent** and **bilingual**, and debugging boils down to searching for a single `ERR_…` code. 🎉


## 9. Validation & Security

* `express-validator` – specific rules per endpoint.
* Rate limiting: `express-rate-limit` (e.g. 15 failed logins → IP blocked for 1 h).
* CORS – allow only `https://your‑domain.com` in production.
* Password hashing: `bcrypt` (salt 10).

## 10. Testing

* **Jest** + **Supertest** – API tests (login, word CRUD, ...).
* Script: `npm test`.
* `TODO`: describe `tests/` folder structure and show an example test.
