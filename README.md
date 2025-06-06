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

### End‑of‑Level Summary

* Two result tables appear:

  * **Left:** incorrectly answered words.
  * **Right:** correctly answered words.
* Displays the **percentage of correct translations**.

TODO wygenerowac gifa z wynikami

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

1. **UI & audio**

   * Sounds – You can enable or disable sounds on the page (from pop‑ups or games, if applicable).
   * Dark mode – Changes the page theme to dark and vice versa.
   * Language – Changes the language.
   * Skins – Changes the logo in the sidebar or the default appearance of the boxes in the Flashcards game.
2. **Gameplay**

   * Ignore diacritics – The checking system ignores diacritical marks (ą, ć, ź, etc.) *Does not work in the arena!*
   * Typo tolerance – You can make one mistake. *Does not work in the arena!*
   * Daily goal – You can adjust the daily goal in the Flashcard Game.
3. **Reset**

   * Restore default settings
   * Reset Flashcard/Test progress (B2/C1 separately)

![App Settings Demo](./gifs/appsettings.gif)

## 5.5 Account Settings

Change e‑mail, nickname, password and one of four avatars (used in leaderboards). Option for permanent account deletion.

![Account Settings Demo](./gifs/accsettings.gif)

---

### TO DO

admin panel
small systems: Popup notification system, Centralized API error handling, Persisted user settings, Visual feedback components `NewProgressBar`, `Confetti` , `ScrambledText`, arena chart, system auto zapisu i auto wczytywania, `useSpellchecking`, system autoryzacji, opis bazy danych, system reportów
