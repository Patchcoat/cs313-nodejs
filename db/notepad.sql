CREATE EXTENSION pgcrypto;

CREATE TABLE users 
(
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE notepads
(
    id INTEGER NOT NULL,
    textbox TEXT,
    FOREIGN KEY (id) REFERENCES users (id)
);

INSERT INTO users (username, password) VALUES (
    'test',
    crypt('password', gen_salt('bf'))
);

SELECT id FROM users 
    WHERE username='username'
    AND password = crypt('pass', password);
