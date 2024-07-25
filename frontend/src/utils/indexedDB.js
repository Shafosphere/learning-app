import { openDB } from "idb";

const DB_NAME = "myDatabase";
const STORE_NAME = "words";

// Inicjalizuje bazę danych IndexedDB
async function initDB() {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
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
  return await db.add(STORE_NAME, { word });
}


// Pobiera wszystkie wpisy z bazy danych IndexedDB
export async function getAllWords() {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
}

// Usuwa wpis z bazy danych IndexedDB według identyfikatora
export async function deleteWord(id) {
  const db = await initDB();
  return await db.delete(STORE_NAME, id);
}

// Aktualizuje istniejący wpis w bazie danych IndexedDB
export async function updateWord(id, newWord) {
  const db = await initDB();
  return await db.put(STORE_NAME, { id, word: newWord });
}

// Pobiera wpisy z bazy danych IndexedDB według słowa
export async function getWordsByIds(ids) {
  const db = await initDB();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const objectStore = transaction.objectStore(STORE_NAME);
  const words = [];

  for (const id of ids) {
    const word = await objectStore.get(id);
    if (word) {
      words.push(word);
    }
  }

  return words;
}
