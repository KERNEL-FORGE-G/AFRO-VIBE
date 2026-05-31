const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const fs = require('fs');

async function setupDatabase() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  console.log("Creating tables...");
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT,
      fullName TEXT,
      avatar TEXT,
      followers INTEGER DEFAULT 0,
      following INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      bio TEXT,
      isVerified INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      videoUrl TEXT,
      caption TEXT,
      likes INTEGER DEFAULT 0,
      commentsCount INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      audioName TEXT,
      category TEXT,
      views INTEGER DEFAULT 0,
      thumbnail TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      video_id TEXT,
      user_id TEXT,
      text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (video_id) REFERENCES videos (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      video_id TEXT,
      user_id TEXT,
      FOREIGN KEY (video_id) REFERENCES videos (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(video_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT,
      receiver_id TEXT,
      text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users (id),
      FOREIGN KEY (receiver_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS follows (
      follower_id TEXT,
      following_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users (id),
      FOREIGN KEY (following_id) REFERENCES users (id)
    );
  `);

  // No seed data — the database starts clean.
  // Real users will register via the app and videos will be uploaded by them.
  console.log('Database ready (no seed data).');

  return db;
}

module.exports = setupDatabase;
