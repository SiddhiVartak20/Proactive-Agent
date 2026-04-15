import Database from 'better-sqlite3';
import path from 'path';

// Keep a cached connection across hot-reloads in development
let db;

if (!global.db) {
  // Use a local.db file at the root
  global.db = new Database(path.join(process.cwd(), 'local.db'));
  
  // Enforce foreign keys
  global.db.pragma('foreign_keys = ON');

  // Initialize Raw Schema (Matching old Prisma models)
  global.db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      clerkUserId TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      imageUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance REAL DEFAULT 0,
      isDefault INTEGER DEFAULT 0,
      userId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS accounts_userId_idx ON accounts(userId);

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      date DATETIME NOT NULL,
      category TEXT NOT NULL,
      receiptUrl TEXT,
      isRecurring INTEGER DEFAULT 0,
      recurringInterval TEXT,
      nextRecurringDate DATETIME,
      lastProcessed DATETIME,
      status TEXT DEFAULT 'COMPLETED',
      userId TEXT NOT NULL,
      accountId TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(accountId) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS transactions_userId_idx ON transactions(userId);
    CREATE INDEX IF NOT EXISTS transactions_accountId_idx ON transactions(accountId);

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      lastAlertSent DATETIME,
      userId TEXT UNIQUE NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS budgets_userId_idx ON budgets(userId);
  `);
}

db = global.db;

export { db };
