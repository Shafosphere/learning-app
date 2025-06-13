WORK IN PROGRESS

# Vocabulary Learning Application – Documentation & Showcase

> *A full‑stack demo project created as a portfolio piece.*

# 1. Introduction

The **Vocabulary Learning Application** demonstrates end‑to‑end skills in building interactive language‑learning tools. Although **not intended for production**, it illustrates modern front‑end techniques, scalable back‑end services, and algorithmic implementations. The system supports **bidirectional learning between Polish and English**.

# 2. Tech Stack

| Layer         | Technology                 | Key Libraries                                       |
| ------------- | -------------------------- | --------------------------------------------------- |
| **Front‑end** | React 18 + Vite 6          | react‑router‑dom, react‑intl (i18n), Chart.js, GSAP |
| **Back‑end**  | Node + Express             | JWT auth, PostgreSQL via pg‑Promise                 |
| **Testing**   | Vitest + Testing Library   | fake‑indexeddb, jsdom                               |
| **DevOps**    | NPM scripts + Vite preview | *start*, *build*, *test*                            |

# 3. Installation

Instructions to install in the file: **installation.md**

# 4. API

The `API_endpoints.md` file in the repository contains a tabular overview of all REST API endpoints, including the required paths, HTTP methods, and controller functions.

# 5. Main Modules

## 5.1 Flashcards

### Overview

* Implements a **five‑box Leitner system**.
* Each new word starts in **Box 1**; every correct answer moves it to the next box.
* Reaching **Box 5** marks the word as mastered and removes it from the box.
* Any mistake sends the word back to **Box 1**.
* With every promotion the translation direction flips: **PL → ENG**, then **ENG → PL**, and so on.

![Flashcards Demo 1](./gifs/flashcards1.gif)

### Available Features

#### Synchronization

* **Logged‑in users** – progress is stored in the cloud and follows the user across devices.
  If the user makes progress without being logged in (even though they were logged in before), the system detects a version mismatch. After logging in and entering the game, the user is asked if they want to keep the local version or overwrite it with the version from the server.
* **Guest users** – progress persists in `localStorage`; refreshing the page does not reset the session.

#### Interface & Interaction

* **GSAP** animations.
* **Two progress bars**:

  1. **Daily progress** – today’s results.
  2. **Level progress** – overall completion of the current level (B2 / C1).
* **Three buttons:**

  * **Add words** – fetches another 30 words into **Box 1** (capped at 90).
  * **Submit** – checks the current answer.
  * **First letter** – reveals the word’s initial letter.
* Automatic **autofocus** shifts the cursor between input fields for faster typing.

#### Keyboard Shortcuts

* **↑ / ↓** – switch between inputs on the current flashcard.
* **Enter** – submit the answer.
* **← / →** – move between boxes.

#### Visual Feedback

* A correct answer in **Box 5** triggers a **confetti** celebration.
* An incorrect answer makes the flashcard turn red and shows a faint placeholder of the correct word in both languages until re‑typed accurately.

![Flashcards Demo 2](./gifs/flashcards2.gif)

#### Telemetry

* Every visit to the game is logged on the server for usage analytics.

## 5.2 Vocabulary Test

### Overview

* The page fetches **30 words** from the server.
* The user types each translation in sequence.
* A bottom progress bar tracks completion of the current 30‑word batch.
* After the 30th word:

  * A **confetti** animation plays.
  * The server sends the next 30 words.
  * The progress bar resets.
* This loop continues until the user processes every word in the level.

![Vocabulary Test Demo](./gifs/vocatest.gif)

### Page Structure

1. **Top section**

   * **Input field (left)** – user enters the translation.
   * **Animated carousel (right)** – displays the word to translate.
2. **Middle section**

   * **Progress bar** – shows progress through the current 30‑word set.
3. **Bottom section – two buttons**

   1. **Input mode toggle** – switches between:

      * Single input field **or**
      * Two buttons: **“I know” / “I don’t know”**.
   2. **Progress display toggle** – swaps the visible progress bar:

      * **Batch progress** – 30‑word set.
      * **Level progress** – overall completion for the current level (B2 / C1).

## 5.3 Arena

Competitive online mode – the server assigns words based on the current rating (0 – 3 000 pts). Each answer instantly updates the score, and a chart visualises the trend.

### Access

* **Logged‑in users only.** Guests are redirected to the login page.
  *Reason: protects the ranking system.*

### Gameplay Flow

1. The server serves **one word** at a time, selected by the player’s **ranking score (0 – 3000 pts)**.
2. Difficulty mix (B2 vs C1) scales with rank:

```js
const tiers = [
  { max: 500,  B2: 1.0, C1: 0.0 },
  { max: 1000, B2: 0.9, C1: 0.1 },
  { max: 1500, B2: 0.7, C1: 0.3 },
  { max: 2000, B2: 0.5, C1: 0.5 },
  { max: 2500, B2: 0.4, C1: 0.6 },
  { max: 3000, B2: 0.1, C1: 0.9 },
];
```

### Page Layout

![Arena Demo](./gifs/arena.gif)

#### Top Pane

| Element                 | Functionality                                                                  |
| ----------------------- | ------------------------------------------------------------------------------ |
| **Live score**          | Updates after every answer.                                                    |
| **Language flag**       | Shows translation direction (PL → ENG or ENG → PL).                            |
| **Answer field**        | Single input; submit with **Confirm** button or **Enter**.                     |
| **Current word**        | Displayed directly above the input.                                            |
| **Last answer preview** | Visible above the field: green (correct) or red plus the correct form (wrong). |

#### Bottom Pane

* **Score chart** – animated line graph tracking point trends in real time.

![Level Selection for Flashcards and Vocab Test](./gifs/chooselevel.gif)

*Before starting the Vocabulary Test or Flashcards, users choose their proficiency level (B2 or C1) as shown above.*
*B2 (\~3 000 words) and C1 (\~2 000 words).*

![Size change](./gifs/resize.gif)

*Availability: All game modes are available in small windows.*

## 5.4 Settings

### The settings have three tabs:
All options are stored in the global **SettingsContext** with values persisted to
localStorage. A change here immediately updates components across the entire
application.

1. **UI & audio**

   * Sounds – You can enable or disable sounds on the page (from pop‑ups or games, if applicable).
   * Dark mode – Changes the page theme to dark and vice versa.
   * Language – Changes the language.
   * Skins – Changes the logo in the sidebar or the default appearance of the boxes in the Flashcards game.
2. **Gameplay**

   - **Ignore diacritics** – when on, `useSpellchecking` strips Polish accents
     before comparison so “lód” and “lod” are equal. Off requires exact accents.
     The Arena always enforces strict checking.
   - **Typo tolerance** – allows a one‑character difference using the Levenshtein
     algorithm (see [6.8](#68-spellchecking)). Disabled in the Arena.
   - **Daily goal** – determines the target of correct answers per day in
     Flashcards. Progress tracking and confetti celebrations rely on this value.
3. **Reset**

   - **Restore default settings** – reverts all of the above to their initial
     values.
   - **Reset Flashcard/Test progress (B2/C1 separately)** – clears stored
     progress from localStorage and IndexedDB.

![App Settings Demo](./gifs/appsettings.gif)

## 5.5 Account Settings

Change e‑mail, nickname, password and one of four avatars (used in leaderboards). Option for permanent account deletion.

![Account Settings Demo](./gifs/accsettings.gif)


## 5.6 Admin Panel

Administrative dashboard available at `/admin` for users with the **admin** role only. The sidebar exposes four main sections and a separate **Reshuffle** action:

1. **Main** – high‑level statistics
   * **Counters** for total users, reports, languages and words (with B2/C1 breakdown).
   * **Today’s activity**: number of logins and visits to Flashcards and Vocabulary pages.
   * **Charts** showing new registrations and overall page views.
   * The sidebar button **Reshuffle** (PIN protected) lives here and regenerates word patches used in all games.
2. **Reports** – translation issue management
   * **Sortable table** listing user‑submitted problems with type, short description and date.
   * Clicking a row opens **detailed view** where translations can be edited in place.
   * Reports may be saved with the new wording or removed entirely after confirmation.

    ![AdminReport](./gifs/adminreport.gif)

3. **Words** – vocabulary database
   * **Search bar** with instant results for quick lookup by ID or word.
   * **Infinite‑scroll table** of all words; selecting a row opens the editable details panel.
   * Admins can **edit translations and descriptions**, switch between B2 and C1, or **delete** a word.
   * The “new word” button launches a form to add fresh entries to the system.

    ![AdminWords](./gifs/adminwords.gif)

4. **Users** – account management
   * **Search** by ID, nickname or e‑mail with auto scrolling to the result.
   * **Inline editing** of username, email, ranking ban and role; each change can be confirmed or undone.
   * A “Confirm Changes” button sends all edits to the server, while the trash icon removes a user account.

    ![AdminUsers](./gifs/adminuser.gif)

# 6. Other Important Components

## 6.1 Popup

### Overview

- **PopupProvider** wraps the app and supplies a `PopupContext` with `setPopup`.
    
- **NewPopup** renders the current message in a portal attached to `#portal-root`.
    
- **popupManager.js** exposes `showPopup()` so components and utilities can trigger popups without importing the context.
    
  ![Popup](./gifs/popup.gif)

### Usage

1. Import and call `showPopup()` with a message and optional options:
    

```js
import { showPopup } from "./utils/popupManager";

showPopup({
  message: "Saved successfully!",
  emotion: "positive",   // "positive", "negative", "warning" or "default"
  duration: 3000          // milliseconds
});
```

2. Inside the provider, `NewPopup` automatically hides after the **duration** and calls `onClose` to clear the message. When sounds are enabled in **Settings**, an audio cue matching the emotion plays.
    
3. If the message string begins with `ERR_`, React‑Intl looks up the translation key and renders the localized text.
    

The popup system provides consistent user feedback across the application, including API error handling and form validation.

## 6.2 ProgressBar

The **ProgressBar** component renders a graphical indicator of completion. It accepts three props:

1. **vertical** – boolean (default `false`). When `true`, the bar fills **top‑to‑bottom**; otherwise **left‑to‑right**.
    
2. **percent** – number (0 – 100) representing the fill percentage. Together with `vertical`, it controls the gradient direction:
    
  ![ProgressBar](./gifs/bar.gif)

```jsx
style={{
  // Use a CSS gradient to fill the bar up to `percent`
  "--progress-gradient": vertical
    ? `linear-gradient(to top, var(--highlight) ${percent}%, var(--secondary) ${percent}%)`
    : `linear-gradient(to right, var(--highlight) ${percent}%, var(--secondary) ${percent}%)`,
}}
```

3. **text** – optional label. Rendered next to the bar only when provided and styled per orientation:
    

```jsx
<div className={`progress-container ${vertical ? "progress-container-vertical" : ""}`}>
  {text && (
    <span className={`progress-text ${vertical ? "progress-text-vertical" : ""}`}>{text}</span>
  )}
</div>
```

## 6.3 Confetti

An overlay emits small confetti pieces to celebrate milestones. It covers the viewport but ignores pointer events.

### Implementation Details

- Located in `frontend/src/components/confetti/confetti.jsx` with styles in `confetti.css`.
    
- When `generateConfetti` is `true`, 20 `<div class="confetti">` elements spawn every 300 ms:
    
  ![Confetti](./gifs/confe.gif)

```jsx
const total = 20;
if (generateConfetti) {
  interval = setInterval(() => {
    const newConfetti = Array.from({ length: total }, (_, i) => <div className="confetti" key={i} />);
    setConfettiElements(prev => [...prev, ...newConfetti]);
  }, 300);
}
```

- Each element animates via `offset-path`, randomising colour and timing:
    

```css
.confetti::before {
  background-color: hsl(var(--color));
  animation: confetti 2s cubic-bezier(0.5, 0, 0.5, 1) both,
             confetti-opacity 2s cubic-bezier(0.5, 0, 0.5, 1) both;
  offset-path: padding-box;
}
```

- Generation stops after ≈2 s; the overlay disappears after ≈4 s.
    

#### Triggers

- Clearing **Box 5** in Flashcards.
    
- Completing each 30‑word batch in Vocabulary Test.
    

## 6.4 ScrambledText

**ScrambledText** is a lightweight component that animates the transition between strings by scrambling characters.

1. `scramble` starts a `setInterval` that runs every `interval` (default **30 ms**) and updates the display.
    
2. During the first phase, the visible length interpolates from the previous string to the target:
    
  ![ScrambledText](./gifs/text.gif)

```jsx
const currentLength = Math.round(fromLength + (toLength - fromLength) * progress);
```

3. Positions that are not yet final display random characters from `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`:
    

```jsx
let result = "";
for (let i = 0; i < currentLength; i++) {
  if (i < toLength && progress >= (i + 1) / toLength) {
    result += toText[i];
  } else {
    result += i < toLength ? CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)] : "";
  }
}
```

4. After `duration` (default **1500 ms**), the interval stops and the target text is fully rendered.
    
## 6.5 Arena Chart

The competitive **Arena** mode features a lightweight chart that visualizes your
ranking points. The `MyCustomChart` component receives an array of scores and
renders up to the last ten values on a 400×200 SVG canvas.

- **Location:** `frontend/src/components/arena/chart.jsx` with styling rules in
  `arena.css`.
- **Scaling:** points are normalised to the current 500‑point bracket so the
  graph stays centered on your recent progress.
- **Colours:** rising segments use the `line-up` class while drops use
  `line-down`. The final score is marked with a circle coloured to match the last
  segment (`circle-up`/`circle-down`).
- **Updates:** the chart lives under the game view and refreshes after each
  answer you submit.

  ![ArenaChart](./gifs/chart.gif)

## 6.6 VocaTest Summary

After finishing a vocabulary level, the **ResultsSummary** screen presents a
detailed breakdown of your answers.

- **Location:** `frontend/src/components/voca/summary/resultssummary.jsx` with
  auxiliary components in the same folder.
- **Intro text:** before the results appear, a short message
  “you have finished all parts! :D” types itself out as an animation.
- **Progress:** a bar shows the overall percentage of correct translations.
- **Tables:**
  - **Good results** – correctly typed words.
  - **Wrong results** – mistakes to review.
- **Buttons:** colour‑coded controls switch between tables and reset your
  progress. They only appear on narrow screens (under 768 px), where one table
  is displayed at a time.

  ![VocaTestSummary](./gifs/summary.gif)



## 6.7 Auto-save / Auto-load

Flashcard progress can be saved to the browser and, for logged-in users, synced
to the server. The logic lives inside the `useBoxesDB` hook.

- **Hook location:** `frontend/src/hooks/boxes/useBoxesDB.jsx`.
- **Saving:** when the `autoSave` flag becomes `true`, data is pushed to the
  `/user/auto-save` endpoint (if logged in) and always mirrored into IndexedDB.
- **Loading:** on mount, the hook requests `/user/auto-load` and resolves
  conflicts using timestamps stored in `localStorage`.
- **Cleanup:** calling `/user/auto-delete` removes the stored progress after a
  level is completed.

```jsx
const serverAutosave = useCallback(async () => {
  const currentPatch = lvl === "B2" ? patchNumberB2 : patchNumberC1;
  const words = Object.entries(boxes)
    .flatMap(([boxName, items]) => items.map(({ id }) => ({ id, boxName })));

  await api.post("/user/auto-save", {
    level: lvl,
    deviceId,
    words,
    patchNumber: currentPatch,
  });
}, [boxes, lvl, deviceId, patchNumberB2, patchNumberC1]);

useEffect(() => {
  const saveData = async () => {
    if (!autoSave) return;
    if (isLoggedIn) await serverAutosave();
    // persist to IndexedDB ...
    setAutoSave(false);
  };
  saveData();
}, [autoSave, boxes, lvl, isLoggedIn, serverAutosave]);
```

## 6.8 Spellchecking

### Overview
The `useSpellchecking` **custom React hook** centralises every rule that decides whether a user’s typed translation counts as correct or not.  
It supports two optional helpers from **Settings**:

- **Location:** `frontend/src/hooks/spellchecking/spellchecking.jsx`.

| Setting field | Effect on checking logic |
| ------------- | ------------------------ |
| `diacritical` | Ignore (off) / respect (on) Polish diacritical marks |
| `spellChecking` | Allow one typo (on) / require an exact match (off) |

Both settings are consumed through React Context, so any toggle in the **Settings** page instantly propagates to Flashcards and VocaTest:

```jsx
const { diacritical, spellChecking } = useContext(SettingsContext);

function checkSpelling(userWord, correctWord) {
  const a = diacritical ? userWord : normalizeText(userWord);
  const b = diacritical ? correctWord : normalizeText(correctWord);
  return spellChecking
    ? levenshtein(a, b) <= 1
    : a === b;
}
```

### Levenshtein Distance
To implement *“allow one typo”* the hook embeds a lightweight **Levenshtein distance** calculator.  
Distance = minimal number of **insertions, deletions or substitutions** needed to transform *A* into *B*.  
`spellChecking` enabled ⇒ a distance ≤ 1 passes.

```jsx
function levenshtein(a, b) {
  const matrix = [];
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
```

## 6.9 API Error System

### Overview

The back‑end uses a centralized error workflow so every failure returns a consistent JSON response. The core pieces live in `backend/src/errors/`:

- `ApiError` class – extends the native `Error` object with `statusCode`, `code`, and optional `details`.
- `errorCodes.js` – a dictionary mapping short keys to structured error definitions.
- `throwErr(key, details)` – looks up `key` in that dictionary and throws an `ApiError`.
- `catchAsync` – wrapper for controllers so thrown errors reach the global handler.

`backend/src/middleware/errorHandler.js` is the single Express middleware that logs the error and sends the HTTP response:

```js
export default function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.statusCode || 500).json({
    code: err.code || "ERR_SERVER",
    message: err.message || "Unknown error.",
    errors: err.details || undefined,
  });
}
```

Controllers simply call `throwErr` whenever validation fails:

```js
import { throwErr } from "../errors/throwErr.js";

export const loginUser = catchAsync(async (req, res) => {
  const user = await getUserByUsername(req.body.username);
  if (!user) throwErr("INVALID_CREDENTIALS");
  // ... rest of logic
});
```

Error definitions reside in `errorCodes.js`:

```js
export const ERRORS = {
  INVALID_CREDENTIALS: {
    code: "ERR_INVALID_CREDENTIALS",
    status: 401,
    message: "Invalid credentials",
  },
  // ...many more
};
```

### Front‑end integration

Responses from `errorHandler` bubble up to the Axios interceptor in
`frontend/src/utils/api.jsx`. That interceptor extracts the `code`, `message`
and validation `errors`, translates them when possible and finally calls
`showPopup` so the user sees a friendly notification.

```jsx
api.interceptors.response.use(
  (r) => r,
  (error) => {
    const { code, message, errors = [] } = error.response?.data || {};
    showPopup({
      message: message || code,
      emotion: error.response?.status >= 500 ? "warning" : "negative",
    });
    return Promise.reject(error);
  }
);
```

## 6.10 Reports

### Overview
Logged-in users can flag translation mistakes or any other issues. The sidebar shows a **Report a bug** option which opens a popup form.

### Report Types
- `word_issue` – points to a specific word translation.
- `other` – generic problem description.

### Submitting
The form sends a POST request to `/report/add` with the chosen type, optional word and a description:

```jsx
await api.post("/report/add", { reportType, word, description });
```

  ![Report](./gifs/report.gif)

On success the API replies with `{ success: true, message: "Report received", reportId }` and the frontend displays a popup.

### Admin workflow
Admins access the **Reports** tab in the Admin Panel. A sortable table lists all submissions; selecting one fetches its details (and translations for `word_issue`). Administrators can update the provided translations or delete the report entirely.

## 6.11 Authorization System

### Overview
User authentication relies on **JSON Web Tokens (JWT)** issued during login. Each token contains the user ID, username and role and is signed with `TOKEN_KEY`. The cookie is HTTP-only and expires after one hour, so JavaScript cannot read it directly.

```js
const generateToken = (user) =>
  jwt.sign({ id: user.id, username: user.username, role: user.role },
           process.env.TOKEN_KEY, { expiresIn: "1h" });
```

### Password Hashing
Passwords are never stored in plain text. During registration the server hashes them with **bcrypt** using 10 salt rounds:

```js
const hashedPassword = await bcrypt.hash(password, 10);
```

Login compares the submitted password with the hash. If valid, the token cookie is set:

```js
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 3600000,
});
```

### Route Protection
Every protected endpoint first runs `authenticateToken`, which verifies the JWT and attaches `req.user`. Admin routes additionally use `authorizeAdmin` to check the user role:

```js
router.get("/admin", authenticateToken, authorizeAdmin, catchAsync(adminWelcome));
```

Requests without a valid token receive `ERR_TOKEN_NOT_FOUND` or `ERR_INVALID_TOKEN`. Non-admin users hitting an admin URL get `ERR_USER_NOT_ADMIN`. Therefore, merely knowing the admin panel URL does not reveal any data.
    

## 6.12 Password Reset Emails

### Overview
When a user requests a password reset, the back end sends an HTML e‑mail with a secure link. The system relies on **NodeMailer** and Gmail credentials defined in environment variables.

### Implementation
- **Service Location:** `backend/src/services/email.service.js`.
- `generateResetPasswordEmail(link, lang)` – returns a translated HTML template.
- `sendEmail({ to, subject, text, html })` – sends the message through the configured transporter.

### Reset Flow
The controller `sendUserResetLink` composes the e‑mail:

```js
const token = generateToken(user); // expires in 1 hour
const resetLink = `http://localhost:3000/reset-password/${token}`;
const html = generateResetPasswordEmail(resetLink, language);
await sendEmail({ to: email, subject, html });
```

The user follows the link to set a new password via `/auth/reset-password`. If the token has expired or is invalid, the API responds with the appropriate error code.

## 6.13 Ranking System

### Tables

The project keeps player scores in three PostgreSQL tables:

1. **`ranking`** – flashcard leaderboard
   - `user_id` references a user and is unique.
   - `flashcard_points` increase after each correct flashcard answer.
   - `ban` flag hides the account from rankings.

2. **`arena`** – current arena rating
   - `current_points` start at **1000** and change by ±5 per answer.
   - `current_streak` counts consecutive correct answers.
   - `last_answered` and `last_updated` store timestamps for activity checks.

3. **`answer_history`** – detailed arena log
   - Records the submitted answer, whether it was correct and points before/after.
   - Includes response time and the difficulty tier used for the word.
   - Feeds the in-game chart showing the last ten results.

### Awarding Points

- **Flashcards:** when a word is learned, the `learnWord` controller in
  `backend/src/controllers/userControllers.js` calls
  `userRankingUpdate` to increment the player's `flashcard_points`.
- **Arena:** the `submitAnswer` controller in
  `backend/src/controllers/wordController.js` adjusts
  `arena.current_points` by ±5 via `updateUserArena` and stores a log entry with
  `updateUserRankingHistory`.

### Leaderboards

Endpoints `/user/ranking-flashcard` and `/user/ranking-arena` return the top
scorers (10 by default). The frontend page `RankingTableSelect` fetches this data
and displays the ranking tables with user avatars and medals.

# 7. Database Schema Documentation

The complete SQL dump is located in `backend/src/db/schema.sql`. Installation steps
are described in [installation.md](./installation.md). Below is a high-level overview of
the main tables and their roles. A visual diagram of the schema is also included in the
repository as **diagram.png**.

## 7.1 Core Tables

- **`users`** – registered accounts
  - `id` *(PK)* – auto-increment identifier.
  - `username`, `email`, `password` – login credentials.
  - `role` – "user" or "admin".
  - `avatar` – avatar index.
  - `created_at`, `last_login` – timestamps.

- **`word`** – vocabulary entries
  - `id` *(PK)*.
  - `word` – the base word.
  - `level` – "B2" or "C1" difficulty.

- **`translation`** – translations for each word
  - `id` *(PK)*.
  - `word_id` *(FK → word.id)*.
  - `language` – "pl" or "en".
  - `translation` – actual text.
  - `description` – usage notes.

## 7.2 Learning Progress

- **`user_word_progress`** – when a word is mastered
  - `id` *(PK)*.
  - `user_id` *(FK → users.id)*.
  - `word_id` *(FK → word.id)*.
  - `learned_at` – timestamp.

- **`user_autosave`** – saved game state
  - `id` *(PK)*.
  - `user_id` *(FK → users.id)*.
  - `level` – "B2" or "C1".
  - `words` – JSON of Leitner boxes.
  - `device_identifier` – optional device link.
  - `last_saved` – timestamp.
  - `version` – increments with each save.
  - `patch_number_b2`, `patch_number_c1` – track word batches.

## 7.3 Arena & Ranking

- **`ranking`** – flashcard leaderboard
  - `id` *(PK)*.
  - `user_id` *(FK → users.id)*.
  - `username` – stored for display.
  - `flashcard_points` – total points.
  - `last_updated` – timestamp.
  - `ban` – hides the user from leaderboards.

- **`arena`** – active arena status
  - `user_id` *(PK, FK → users.id)*.
  - `current_points` – rating starting at 1000.
  - `current_streak` – consecutive correct answers.
  - `last_answered`, `last_updated` – timestamps.

- **`answer_history`** – detailed arena log
  - `id` *(PK)*.
  - `user_id` *(FK → users.id)*.
  - `word_id` *(FK → word.id)*.
  - `given_answer`, `is_correct`.
  - `points_before`, `points_after`.
  - `response_time_ms`, `difficulty_tier`, `streak`.
  - `created_at` – timestamp.

## 7.4 Patches & Reports

- **`word_patches`**, **`b2_patches`**, **`c1_patches`** –
  store sets of word IDs used when generating word batches.
  Each row contains a `patch_id` and JSON `word_ids` array.

- **`reports`** – issues submitted by users
  - `id` *(PK)*.
  - `user_id` *(FK → users.id)*.
  - `report_type` – "word_issue" or "other".
  - `word_id` – optional reference.
  - `description` – free text.
  - `created_at` – timestamp.

## 7.5 Statistics

- **`page_visit_stats`** – daily page view counters
  - `id` *(PK)*.
  - `page_name`, `stat_date`.
  - `visit_count` – number of visits.

- **`user_activity_stats`** – aggregated activity totals
  - `id` *(PK)*.
  - `activity_date`, `activity_type`.
  - `activity_count`.

## 7.6 Foreign Keys & Indexes

Foreign key constraints link `users`, `word`, and ranking tables. Notable
indexes include `idx_translation_word` on `translation.word_id`,
`idx_user_word_unique` on `(user_id, word_id)`, and `idx_word_level` on
`word.level`.

The schema targets PostgreSQL 16 and can be recreated by running the SQL dump
from `backend/src/db/schema.sql`.

## 7.7 Schema Diagram

A graphical overview of all tables and relationships can be found in
`diagram.png` located in the project root:

![Database Diagram](./diagram.png)

TO DO 
Testy