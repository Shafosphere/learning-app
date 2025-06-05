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

![Report](./gifs/report.gif)

### 4.4 Popup & Feedback Layer

A tiny, self-contained **popup system** handles all transient messages  
(*success*, *error*, *warning*).

* **React Portal** – every popup is rendered in `#portal-root`, outside the
  normal DOM tree, so it never collides with flex/grid layouts.
* **Context API** – wrap the app once in `<PopupProvider>` and call
  `setPopup({ message, emotion, duration })` from anywhere 
* **3 predefined colors** – popup color depends on the `emotion`:
  - `positive` → green  
  - `negative` → red  
  - `warning` → yellow
  *Sound ON/OFF* toggle.
* **Install in 3 steps**

  ```jsx
  // 1) index.html
  <div id="portal-root"></div>

  // 2) main.jsx
  import { PopupProvider } from "./components/popup/popupcontext";
  ReactDOM.createRoot(...).render(
    <PopupProvider>
      <App />
    </PopupProvider>
  );

  // 3) anywhere in code
  import { useContext } from "react";
  import { PopupContext } from "./components/popup/popupcontext";

  const { setPopup } = useContext(PopupContext);
  setPopup({ message: "Saved!", emotion: "positive", duration: 2000 });

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

Arena is available only to registered users

![Arena Demo](./gifs/arena.gif)

![Size change](./gifs/resize.gif)

* **Availability:** All game modes are available in small windows

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

### 8.1 Objectives and Design Principles

1. **Centralised error handling**

   * All backend errors are thrown via dedicated classes and helpers (`ApiError.js`, `throwErr.js`, `errorCodes.js`, `catchAsync.js`, `errorHandler.js`).
   * The frontend (file `api.jsx`) intercepts responses from the server and displays them to the user in a unified way via pop‑ups.

2. **Error codes and where to find them**

   * Every possible error is defined in the `ERRORS` object in **`errorCodes.js`** and contains three fields: `code`, `status`, and `message`.
   * This lets the frontend determine whether the incoming text is a translation key (`ERR_…`) or a plain human‑readable message.
   * New entries can be added to `ERRORS`, while message translations live in localisation files (folder `intl`).

3. **Throwing exceptions**

   * **`ApiError.js`** creates an error object containing an HTTP status (`statusCode`), error code (`code`), message (`message`), and optional extra details (`details`).
   * **`throwErr.js`** accepts a key from `ERRORS` (and optional details) and throws a fully‑formed `ApiError` instance.
   * **`catchAsync.js`** is middleware for Express (or any framework) that captures errors thrown inside asynchronous controllers and forwards them to the central error handler.
   * **Central error‑handling middleware** (`errorHandler.js`) sends a consistent JSON response to the client.

4. **Presenting errors on the frontend**

   * `api.jsx` defines Axios response interceptors.
   * When a response contains an error code, the interceptor:

     1. Reads `code` and `message` from the server payload.
     2. If `code` starts with `ERR_`, it is treated as a translation key and passed to `translate(code, rawMsg, details)`.
     3. Otherwise the plain `message` string is displayed.
     4. The pop‑up’s visual style is chosen by HTTP status (≥ 500 → **warning**, < 500 → **negative**).
   * The helper `showPopup({ message, emotion, duration })` displays the error to the user.

---

### 8.2 Backend – Defining & Throwing Errors

#### 1. `ApiError.js`

```js
// src/errors/ApiError.js
export default class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code       = code;
    this.details    = details; // optional extra info (e.g. validation array)
  }
}
```

*Purpose*: Provide a lightweight extension of the native `Error` class that carries an HTTP status code, a unique error code, a user‑facing message, and optional details to be returned in the JSON response.

#### 2. `errorCodes.js`

```js
// src/errors/errorCodes.js
export const ERRORS = {
  INVALID_CREDENTIALS: {
    code: "ERR_INVALID_CREDENTIALS",
    status: 401,
    message: "Invalid credentials",
  },
  TOKEN_NOT_FOUND: {
    code: "ERR_TOKEN_NOT_FOUND",
    status: 401,
    message: "Token not found",
  },
  // ... more error codes ...
};
```

*Purpose*: Provide a single source of truth for all error codes, their default messages, and HTTP status codes.

#### 3. `throwErr.js`

```js
// src/errors/throwErr.js
import ApiError from "./ApiError.js";
import { ERRORS } from "./errorCodes.js";

/** Throws an ApiError based on a key from ERRORS */
export function throwErr(key, details) {
  const def = ERRORS[key];
  if (!def) {
    // Fallback: unknown key
    throw new ApiError(500, "ERR_UNDEFINED", `Undefined error key: ${key}`);
  }
  throw new ApiError(def.status, def.code, def.message, details);
}
```

*Purpose*: Simplify throwing typed errors in controllers without repeating boilerplate.

#### 4. `catchAsync.js`

```js
// src/errors/catchAsync.js
export default (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

*Purpose*: Allow writing `async/await` controllers without manual `try/catch` blocks.

#### 5. `errorHandler.js`

```js
// src/middleware/errorHandler.js
export default function errorHandler(err, req, res, next) {
  console.error(err);

  res.status(err.statusCode || 500).json({
    code: err.code || "ERR_SERVER",
    message: err.message || "Unknown error.",
    errors: err.details || undefined,
  });
}
```

*Purpose*: Centrally capture all errors and return a uniform JSON payload containing the error code, message, and (optional) details.

### 8.3 Frontend – Handling Errors in `api.jsx`

File `api.jsx` is the single place where we configure a global **Axios** instance and attach response interceptors. Every HTTP request made by the UI therefore shares the same error‑handling logic.

#### Key components

1. **Client configuration**

   ```js
   import axios from "axios";

   export const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
     withCredentials: true,
   });
   ```

   *Base URL* is read from an environment variable, and credentials (cookies) are sent automatically.

2. **Response interceptor**

   ```js
   api.interceptors.response.use(
     (response) => response,
     (error) => {
       const { status, data } = error.response ?? {};
       const { code, message, errors: list = [] } = data ?? {};

       // Translation, logging, and pop‑up display happen here.
       return Promise.reject(error);
     }
   );
   ```

   * Runs for *every* HTTP call.
   * Detects error codes beginning with `ERR_`.
   * Also processes validation error arrays (`errors`) returned by the backend.

3. **Translation & presentation**

   * `translate(code, rawMsg, details)` maps the error code to a user‑friendly string using the localisation files.
   * The user sees the message via:
   ```js
    showPopup({
      message: finalMsg,
      emotion: status >= 500 ? "warning" : "negative",
      duration: 5000,
      });
    ```

4. **Propagating errors**
   After displaying the pop‑up, the interceptor returns `Promise.reject(error)` so React components can still react (e.g. redirect to the login page on 401).

Thanks to this centralisation, UI components stay free of repetitive HTTP‑error boilerplate—developers just call `api.get(...)`, `api.post(...)`, and all errors are intercepted and surfaced consistently.

### 8.4 Summary

With this system:

* **Single source of truth** – all error codes live in `errorCodes.js`.
* **Unified backend layer** – errors are thrown through `ApiError` and `throwErr`, caught by `catchAsync`, and formatted by `errorHandler`.
* **Unified frontend layer** – the Axios interceptor translates and shows human‑readable pop‑ups.

## 9. Validation & Security

* `express-validator` – specific rules per endpoint.
* Rate limiting: `express-rate-limit` (e.g. 15 failed logins → IP blocked for 1 h).
* CORS – allow only `https://your‑domain.com` in production.
* Password hashing: `bcrypt` (salt 10).

## 10. Testing

* **Jest** + **Supertest** – API tests (login, word CRUD, ...).
* Script: `npm test`.
* `TODO`: describe `tests/` folder structure and show an example test.

## 10. Installation

The full Installation in **installation.md**