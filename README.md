WORK IN PROGRESS

## 1. Introduction

The Vocabulary Learning Application is a showcase project to demonstrate full-stack development skills in creating interactive language-learning tools. It is not intended for production deployment, but rather as a portfolio piece illustrating front-end interfaces, back-end services, and algorithmic implementations. The application supports bidirectional learning between Polish and English.

## 2. Technology Stack & Design

* **Frontend:** React, Vite, HTML5, CSS3, JavaScript
* **Backend:** Node.js, Express
* **Database:** PostgreSQL (managed via PgAdmin4)
* **Design & Prototyping:** Figma
* **Key Features:**

  * Dark mode toggle
  * Responsive layouts (mobile-first, minimum 320×568 px)
  * Internationalization for PL ↔ EN

## 3. Core Implementation Details

### 3.1. Shared Data Fetching & Server-Side Randomization

The server maintains a main pool of \~5000 vocabulary entries (3000 B2 + 2000 C1).

* On the server side, words are already prepared in randomly selected patches of 30 entries, divided into C1 and B2 groups.
* This preparation on the server side minimizes the load on the front-end (no need to randomize) and guarantees consistency across different game modes.

### 3.2. Levenshtein Distance Algorithm

* All input-based game modes use a centralized Levenshtein distance function for answer validation.
* Features:

  * Allows up to one character difference (insertion, deletion, substitution).
  * Optionally strips Polish diacritics for more forgiving comparisons.
  * Implemented once in `utils/levenshtein.js` and imported wherever needed.

## 4. Game Modes

### 4.1. Flashcards (Leitner System)

**Purpose:** Leverage spaced repetition to reinforce long-term memory.

**Mechanics & Scheduling:**

1. Words start in Box 1 and move through five boxes based on correct responses.
2. Review intervals increase exponentially: Box 1 (daily), Box 2 (every 2 days), Box 3 (every 4 days), Box 4 (every week), Box 5 (biweekly).
3. A correct answer advances the word to the next box; an incorrect answer resets it to Box 1.
4. Translation direction alternates per box: odd-numbered boxes use Polish→English; even-numbered use English→Polish.

**Scoring & Progress:**

* Each vocabulary word moved through all five Leitner boxes counts as one completed review toward the daily goal.
* The default daily goal is 20 fully reviewed words; the user can customize this target in settings.
* Daily progress resets locally at midnight on the user's device, encouraging consistent practice without relying on server time.

**User Interface:**

* Central card displays the current word; an input field (autofocus) sits below.
* Dynamic underline adjusts to word length, providing visual balance.
* Controls:

  * **Submit/Enter:** Confirm answer.
  * **First Letter Hint:** Reveals the first letter of the correct translation.
* Animations enhance feedback:

  * Card bounces on correct answers and shakes on incorrect ones.
  * Color highlights: green for correct, red for incorrect.
  * Smooth transitions when cards move between boxes.
* Two progress bars:

  * **Session Progress:** Tracks completion of the 30-word batch.
  * **Daily Goal:** Visualizes progress toward the target of reviews for the day.

**Settings & Customization:**

* Toggle diacritic sensitivity.
* Adjust daily goal count.
* Choose between keyboard input or on-screen buttons for answers.
* Option to review only words in specific boxes for targeted revision.

### 4.2. Vocabulary Test

**Purpose:** Evaluate knowledge level in a linear test format.

**Mechanics:**

* At session start, the server randomly selects a fresh batch of 30 words from the chosen proficiency level (B2: \~3000 words or C1: \~2000 words), mirroring the selection logic used in Flashcards.
* Users type translations sequentially; validation via Levenshtein distance.
* Option to switch between "Type Answer" and "Know/Don’t Know" button modes.

**User Interface:**

1. **Test Panel:** Input field or dual buttons for quick responses.
2. **Animated Carousel:** Rotates through words visually between questions.
3. **Progress Indicator:** Single bar toggles between session progress (30 words) and overall level completion.
4. **Completion Celebration:** Confetti animation upon finishing the batch.

**Results & Analysis:**

* Post-test summary displays two tables: correctly answered words and those requiring improvement.
* Each entry shows user answer, correct translation, and error margin.
* Overall score and percentage accuracy are highlighted.

### 4.3. Arena (PvP with Ranking)

**Purpose:** Real-time competition to motivate learners through gamification.

**Mechanics:**

* Logged-in users are matched based on an ELO-like ranking system (range: 0–3000).
* Each round presents words selected from the server-randomized batch, balanced by player skill.
* Response time and correctness feed into ranking adjustments.

**User Interface:**

* **Header:** Displays current ranking points, translation direction icon, and input field with submit button.
* **Feedback Panel:** Shows last answer outcome (colored badge) and the correct translation when missed.
* **Trend Chart:** Live-updating line graph of ranking progression during the match.

## 5. Additional Features

* **Authentication & User Management:** Secure login flows, account settings, password reset, admin roles.
* **Global Leaderboard:** Tracks top performers across all users with pagination and filters.
* **Admin Dashboard:** User oversight, report handling, and content moderation tools.
* **Error Reporting:** In-app form for flagging translation mistakes or UI issues.
* **Offline Support & Conflict Resolution:** IndexedDB synchronization with server during intermittent connectivity.
