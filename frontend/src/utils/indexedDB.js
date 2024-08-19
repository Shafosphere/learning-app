import { openDB } from "idb";

const DB_NAME = "myDatabase";
const WORDS_STORE_NAME = "words";
const STATS_STORE_NAME = "statistics";
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
  const wordExists = words.find(entry => entry.word === word);
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