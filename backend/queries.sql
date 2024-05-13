CREATE TABLE Word (
  id SERIAL PRIMARY KEY,
  word VARCHAR(100) NOT NULL
);
CREATE TABLE Translation (
  id SERIAL PRIMARY KEY,
  word_id INT NOT NULL,
  language VARCHAR(2) NOT NULL, -- 'en' for English, 'pl' for Polish
  translation VARCHAR(100) NOT NULL,
  description VARCHAR(100) NOT NULL,
  FOREIGN KEY (word_id) REFERENCES Word(id)
);