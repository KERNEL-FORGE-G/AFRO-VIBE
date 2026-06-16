const Database = require('better-sqlite3');

async function setupDatabase() {
  const db = new Database('./database.sqlite');

  // Shim to maintain compatibility with async calls in routes
  db.all = async (sql, params = []) => {
    const actualParams = Array.isArray(params) ? params : [params];
    return db.prepare(sql).all(...actualParams);
  };
  db.get = async (sql, params = []) => {
    const actualParams = Array.isArray(params) ? params : [params];
    return db.prepare(sql).get(...actualParams);
  };
  db.run = async (sql, params = []) => {
    const actualParams = Array.isArray(params) ? params : [params];
    return db.prepare(sql).run(...actualParams);
  };
  db.execAsync = async (sql) => {
    return db.exec(sql);
  };

  console.log("Creating tables...");
  
  db.exec(`
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

  console.log('Database ready (no seed data).');

  return db;
}

module.exports = setupDatabase;
