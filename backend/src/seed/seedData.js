// utils/seedData.js
import pool from '../db/dbClient.js';
import { format } from 'date-fns'

const userIds = [1, 3, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 19, 20, 22, 23, 25, 26, 27, 28];

console.log("Rozpoczęcie działania skryptu seedData.js...");

const wordIds = [
  4796, 1623, 808, 1455, 396, 300, 3627, 2533, 4416, 1251, 2716, 1866, 3839,
  4824, 806, 611, 2511, 2802, 4090, 181, 4388, 3591, 4654, 4374, 1742, 4166,
  4760, 4538, 383, 1567, 4544, 3060, 507, 1007, 2755, 1058, 4460, 179, 3061,
  3702, 3829, 2346, 3834, 4835, 3045, 226, 2986, 2712, 3442, 3317, 1676, 2494,
  3190, 4053, 3170, 4323, 3472, 2235, 1947, 172, 4574, 3201, 2440, 2764, 3009,
  2794, 2742, 2224, 2767, 606, 4347, 1679, 5208, 1032, 167, 4054, 4320, 1062,
  2340, 1196, 1862, 3938, 1059, 4807, 1642, 62, 2036, 523, 720, 4888
];

export async function generateTestData() {
    const endDate = new Date('2024-12-03T14:50:42.512Z');
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Tydzień wcześniej
  
    const userWordCounts = {
      1: 20,
      3: 18,
      6: 16,
      7: 14,
      8: 12,
      9: 10,
      10: 8,
      11: 6,
      12: 4,
      14: 2,
      15: 1,
      16: 5,
      18: 7,
      19: 9,
      20: 11,
      22: 13,
      23: 15,
      25: 17,
      26: 19,
      27: 3,
      28: 2
    };
  
    const client = await pool.connect();
  
    try {
      console.log('Rozpoczęcie generowania danych testowych...');
      await client.query('BEGIN');
  
      for (const userId of userIds) {
        console.log(`Przetwarzanie użytkownika ID: ${userId}`);
        const n = userWordCounts[userId] || Math.floor(Math.random() * 15) + 5;
        console.log(`Użytkownik ${userId} będzie miał ${n} słówek.`);
  
        let availableWordIds = [...wordIds]; // Kopia listy słówek
  
        // Jeśli liczba słówek do wylosowania jest większa niż dostępne słówka, zresetuj listę
        if (n > availableWordIds.length) {
          availableWordIds = [...wordIds];
        }
  
        const userWordIds = [];
  
        for (let i = 0; i < n && availableWordIds.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * availableWordIds.length);
          const wordId = availableWordIds.splice(randomIndex, 1)[0];
          userWordIds.push(wordId);
        }
  
        console.log(`Wylosowano słówka dla użytkownika ${userId}:`, userWordIds);
  
        for (const wordId of userWordIds) {
          const randomTimestamp = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
          const learnedAt = new Date(randomTimestamp);
  
          const learnedAtStr = format(learnedAt, 'yyyy-MM-dd HH:mm:ss.SSSSSS');
          console.log(`Wstawianie: user_id=${userId}, word_id=${wordId}, learned_at=${learnedAtStr}`);
  
          const result = await client.query(
            'INSERT INTO user_word_progress (user_id, word_id, learned_at) VALUES ($1, $2, $3)',
            [userId, wordId, learnedAtStr]
          );
  
          console.log(`Rezultat wstawienia dla user_id=${userId}, word_id=${wordId}:`, result.rowCount);
        }
      }
  
      await client.query('COMMIT');
      console.log('Dane testowe zostały pomyślnie wygenerowane i wstawione do bazy danych.');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Błąd podczas generowania danych testowych:', error);
      throw error;
    } finally {
      client.release();
      console.log('Zakończono działanie skryptu.');
    }
  }

generateTestData() 