import { openDB } from "idb";

const DB_NAME = "myDatabase";
const WORDS_STORE_NAME = "words";

const WORDS_MAINGAME_B2 = "words_b2";
const WORDS_MAINGAME_C1 = "words_c1";

const MINIGAME_STORE_NAME = "minigame_words";

// Inicjalizuje bazę danych IndexedDB
async function initDB() {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(WORDS_STORE_NAME)) {
        db.createObjectStore(WORDS_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(WORDS_MAINGAME_B2)) {
        db.createObjectStore(WORDS_MAINGAME_B2, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(WORDS_MAINGAME_C1)) {
        db.createObjectStore(WORDS_MAINGAME_C1, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(MINIGAME_STORE_NAME)) {
        const minigameStore = db.createObjectStore(MINIGAME_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        minigameStore.createIndex("goodB2", "goodB2", { unique: true });
        minigameStore.createIndex("wrongB2", "wrongB2", { unique: true });
        minigameStore.createIndex("goodC1", "goodC1", { unique: true });
        minigameStore.createIndex("wrongC1", "wrongC1", { unique: true });

        minigameStore.add({
          goodB2: [],
          wrongB2: [],
          goodC1: [],
          wrongC1: [],
        });
      }
    },
  });
}

// Dodaje nowy wpis do bazy danych IndexedDB, jeśli słowo nie istnieje
export async function addWord(word, lvl) {
  const db = await initDB();
  let words = await getAllWords(lvl);
  const wordExists = words.find((entry) => entry.word === word);
  if (wordExists) {
    console.log(`Word "${word}" already exists in the database.`);
    return;
  }
  if (lvl === "B2") {
    await db.add(WORDS_MAINGAME_B2, { word });
  } else if (lvl === "C1") {
    await db.add(WORDS_MAINGAME_C1, { word });
  } else {
    await db.add(WORDS_STORE_NAME, { word });
  }
  // await updateStatistics(word);
}

// Pobiera wszystkie wpisy z bazy danych IndexedDB
export async function getAllWords(lvl) {
  if (lvl === "B2") {
    const db = await initDB();
    return await db.getAll(WORDS_MAINGAME_B2);
  }
  if (lvl === "C1") {
    const db = await initDB();
    return await db.getAll(WORDS_MAINGAME_C1);
  }
  const db = await initDB();
  return await db.getAll(WORDS_STORE_NAME);
}

// Pobiera wszystkie wpisy z bazy danych minigame
export async function getAllMinigameWords(lvl) {
  if (!["B2", "C1"].includes(lvl)) {
    throw new Error("Invalid level. Use 'B2' or 'C1'.");
  }

  const db = await initDB();
  const transaction = db.transaction(MINIGAME_STORE_NAME, "readonly");
  const minigameStore = transaction.objectStore(MINIGAME_STORE_NAME);

  const record = await minigameStore.get(1);
  if (!record) {
    console.error("Rekord nie został znaleziony.");
    return null;
  }

  return {
    good: record[`good${lvl}`],
    wrong: record[`wrong${lvl}`],
  };
}

//dodaj do good
export async function addNumberToGood(number, lvl) {
  if (!["B2", "C1"].includes(lvl)) {
    throw new Error("Invalid level. Use 'B2' or 'C1'.");
  }

  const db = await initDB();
  const transaction = db.transaction(MINIGAME_STORE_NAME, "readwrite");
  const minigameStore = transaction.objectStore(MINIGAME_STORE_NAME);

  let record = await minigameStore.get(1);

  if (record) {
    const goodKey = `good${lvl}`;
    const wrongKey = `wrong${lvl}`;

    // Upewnij się, że liczba nie znajduje się już w wrong
    if (
      !record[goodKey].includes(number) &&
      !record[wrongKey].includes(number)
    ) {
      record[goodKey].push(number);
      await minigameStore.put(record);
      console.log(`Liczba ${number} została dodana do ${goodKey}.`);
    } else {
      console.log(
        `Liczba ${number} już istnieje w ${goodKey} lub ${wrongKey}.`
      );
    }
  } else {
    console.error("Rekord nie został znaleziony.");
  }
}

//dodaj do wrong
export async function addNumberToWrong(number, lvl) {
  if (!["B2", "C1"].includes(lvl)) {
    throw new Error("Invalid level. Use 'B2' or 'C1'.");
  }

  const db = await initDB();
  const transaction = db.transaction(MINIGAME_STORE_NAME, "readwrite");
  const minigameStore = transaction.objectStore(MINIGAME_STORE_NAME);

  let record = await minigameStore.get(1);

  if (record) {
    const goodKey = `good${lvl}`;
    const wrongKey = `wrong${lvl}`;

    // Upewnij się, że liczba nie znajduje się już w good
    if (
      !record[wrongKey].includes(number) &&
      !record[goodKey].includes(number)
    ) {
      record[wrongKey].push(number);
      await minigameStore.put(record);
      console.log(`Liczba ${number} została dodana do ${wrongKey}.`);
    } else {
      console.log(
        `Liczba ${number} już istnieje w ${goodKey} lub ${wrongKey}.`
      );
    }
  } else {
    console.error("Rekord nie został znaleziony.");
  }
}