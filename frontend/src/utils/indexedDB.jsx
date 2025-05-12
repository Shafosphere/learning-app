import { openDB } from "idb";

const DB_NAME = "myDatabase";
const WORDS_STORE_NAME = "words";
const WORDS_MAINGAME_B2 = "words_b2";
const WORDS_MAINGAME_C1 = "words_c1";
const MINIGAME_STORE_NAME = "minigame_words";

// Initializes the IndexedDB database
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
        // Create indexes for tracking correct and incorrect answers by level
        minigameStore.createIndex("goodB2", "goodB2", { unique: true });
        minigameStore.createIndex("wrongB2", "wrongB2", { unique: true });
        minigameStore.createIndex("goodC1", "goodC1", { unique: true });
        minigameStore.createIndex("wrongC1", "wrongC1", { unique: true });

        // Initialize the minigame record
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

// Adds a new word to IndexedDB if it doesn't already exist
export async function addWord(word, lvl) {
  const db = await initDB();
  const words = await getAllWords(lvl);
  const wordExists = words.find(entry => entry.word === word);
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
}

// Retrieves all words for the given level
export async function getAllWords(lvl) {
  const db = await initDB();
  if (lvl === "B2") {
    return await db.getAll(WORDS_MAINGAME_B2);
  }
  if (lvl === "C1") {
    return await db.getAll(WORDS_MAINGAME_C1);
  }
  return await db.getAll(WORDS_STORE_NAME);
}

// Retrieves the minigame record for the given level
export async function getAllMinigameWords(lvl) {
  if (!["B2", "C1"].includes(lvl)) {
    throw new Error("Invalid level. Use 'B2' or 'C1'.");
  }

  const db = await initDB();
  const transaction = db.transaction(MINIGAME_STORE_NAME, "readonly");
  const store = transaction.objectStore(MINIGAME_STORE_NAME);

  const record = await store.get(1);
  if (!record) {
    console.error("Record not found.");
    return null;
  }

  return {
    good: record[`good${lvl}`],
    wrong: record[`wrong${lvl}`],
  };
}

// Adds a number to the 'good' list for the given level
export async function addNumberToGood(number, lvl) {
  if (!["B2", "C1"].includes(lvl)) {
    throw new Error("Invalid level. Use 'B2' or 'C1'.");
  }

  const db = await initDB();
  const transaction = db.transaction(MINIGAME_STORE_NAME, "readwrite");
  const store = transaction.objectStore(MINIGAME_STORE_NAME);
  const record = await store.get(1);

  if (record) {
    const goodKey = `good${lvl}`;
    const wrongKey = `wrong${lvl}`;

    // Ensure the number isn’t already in wrong or good
    if (!record[goodKey].includes(number) && !record[wrongKey].includes(number)) {
      record[goodKey].push(number);
      await store.put(record);
      console.log(`Number ${number} has been added to ${goodKey}.`);
    } else {
      console.log(`Number ${number} already exists in ${goodKey} or ${wrongKey}.`);
    }
  } else {
    console.error("Record not found.");
  }
}

// Adds a number to the 'wrong' list for the given level
export async function addNumberToWrong(number, lvl) {
  if (!["B2", "C1"].includes(lvl)) {
    throw new Error("Invalid level. Use 'B2' or 'C1'.");
  }

  const db = await initDB();
  const transaction = db.transaction(MINIGAME_STORE_NAME, "readwrite");
  const store = transaction.objectStore(MINIGAME_STORE_NAME);
  const record = await store.get(1);

  if (record) {
    const goodKey = `good${lvl}`;
    const wrongKey = `wrong${lvl}`;

    // Ensure the number isn’t already in good or wrong
    if (!record[wrongKey].includes(number) && !record[goodKey].includes(number)) {
      record[wrongKey].push(number);
      await store.put(record);
      console.log(`Number ${number} has been added to ${wrongKey}.`);
    } else {
      console.log(`Number ${number} already exists in ${goodKey} or ${wrongKey}.`);
    }
  } else {
    console.error("Record not found.");
  }
}
