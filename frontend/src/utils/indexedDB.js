import { openDB } from "idb";

const DB_NAME = "myDatabase";
const WORDS_STORE_NAME = "words";
const STATS_STORE_NAME = "statistics";
const MINIGAME_STORE_NAME = "minigame_words";
const B2 = 3264;

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
      if (!db.objectStoreNames.contains(STATS_STORE_NAME)) {
        const statsStore = db.createObjectStore(STATS_STORE_NAME, {
          keyPath: "category",
        });
        statsStore.add({ category: "B2", count: 0 });
        statsStore.add({ category: "C1", count: 0 });
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

// Aktualizuje statystyki
async function updateStatistics(word) {
  const db = await initDB();
  const transaction = db.transaction(STATS_STORE_NAME, "readwrite");
  const statsStore = transaction.objectStore(STATS_STORE_NAME);

  if (word <= B2) {
    const stat = await statsStore.get("B2");
    stat.count += 1;
    await statsStore.put(stat);
  } else {
    const stat = await statsStore.get("C1");
    stat.count += 1;
    await statsStore.put(stat);
  }
}

// Dodaje nowy wpis do bazy danych IndexedDB, jeśli słowo nie istnieje
export async function addWord(word) {
  const db = await initDB();
  let words = await getAllWords();
  const wordExists = words.find((entry) => entry.word === word);
  if (wordExists) {
    console.log(`Word "${word}" already exists in the database.`);
    return;
  }
  await db.add(WORDS_STORE_NAME, { word });
  await updateStatistics(word);
}

// Pobiera wszystkie wpisy z bazy danych IndexedDB
export async function getAllWords() {
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

// Usuwa wpis z bazy danych IndexedDB według identyfikatora
export async function deleteWord(id) {
  const db = await initDB();
  return await db.delete(WORDS_STORE_NAME, id);
}

// Aktualizuje istniejący wpis w bazie danych IndexedDB
export async function updateWord(id, newWord) {
  const db = await initDB();
  await db.put(WORDS_STORE_NAME, { id, word: newWord });
  await updateStatistics(newWord);
}

// Pobiera wpisy z bazy danych IndexedDB według słowa
export async function getWordsByIds(ids) {
  const db = await initDB();
  const transaction = db.transaction(WORDS_STORE_NAME, "readonly");
  const objectStore = transaction.objectStore(WORDS_STORE_NAME);
  const words = [];

  for (const id of ids) {
    const word = await objectStore.get(id);
    if (word) {
      words.push(word);
    }
  }

  return words;
}

// Pobiera statystyki z bazy danych IndexedDB
export async function getStatistics() {
  const db = await initDB();
  return await db.getAll(STATS_STORE_NAME);
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
    if (!record[goodKey].includes(number) && !record[wrongKey].includes(number)) {
      record[goodKey].push(number);
      await minigameStore.put(record);
      console.log(`Liczba ${number} została dodana do ${goodKey}.`);
    } else {
      console.log(`Liczba ${number} już istnieje w ${goodKey} lub ${wrongKey}.`);
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
    if (!record[wrongKey].includes(number) && !record[goodKey].includes(number)) {
      record[wrongKey].push(number);
      await minigameStore.put(record);
      console.log(`Liczba ${number} została dodana do ${wrongKey}.`);
    } else {
      console.log(`Liczba ${number} już istnieje w ${goodKey} lub ${wrongKey}.`);
    }
  } else {
    console.error("Rekord nie został znaleziony.");
  }
}
