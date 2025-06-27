/**
 * Migration: create_users_table
 * Created: 2025-06-27T09:23:49.375Z
 */

exports.up = async (db) => {
  await db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Example:
  // await db.query(`
  //   CREATE TABLE users (
  //     id INT PRIMARY KEY AUTO_INCREMENT,
  //     email VARCHAR(255) UNIQUE NOT NULL,
  //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  //   )
  // `);
};

exports.down = async (db) => {
  await db.run('DROP TABLE users');
  // Example:
  // await db.query('DROP TABLE users');
};
