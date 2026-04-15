"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeDecimal = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) serialized.balance = obj.balance;
  if (obj.amount) serialized.amount = obj.amount;
  if (obj.isDefault !== undefined) serialized.isDefault = Boolean(obj.isDefault);
  return serialized;
};

export async function getAccountWithTransactions(accountId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = db.prepare('SELECT * FROM users WHERE clerkUserId = ?').get(userId);
  if (!user) throw new Error("User not found");

  const account = db.prepare('SELECT * FROM accounts WHERE id = ? AND userId = ?').get(accountId, user.id);
  if (!account) return null;

  const transactions = db.prepare('SELECT * FROM transactions WHERE accountId = ? ORDER BY date DESC').all(account.id);
  account.transactions = transactions;

  return {
    ...serializeDecimal(account),
    transactions: account.transactions.map(serializeDecimal),
  };
}

export async function bulkDeleteTransactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = db.prepare('SELECT * FROM users WHERE clerkUserId = ?').get(userId);
    if (!user) throw new Error("User not found");

    if (!transactionIds || transactionIds.length === 0) return { success: true };

    const placeholders = transactionIds.map(() => '?').join(',');
    const transactions = db.prepare(`SELECT * FROM transactions WHERE userId = ? AND id IN (${placeholders})`).all(user.id, ...transactionIds);

    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change = transaction.type === "EXPENSE" ? transaction.amount : -transaction.amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    const executeBulk = db.transaction(() => {
      const deleteStmt = db.prepare('DELETE FROM transactions WHERE id = ? AND userId = ?');
      for (const id of transactionIds) {
        deleteStmt.run(id, user.id);
      }

      const updateStmt = db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?');
      for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
        updateStmt.run(balanceChange, accountId);
      }
    });

    executeBulk();

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = db.prepare('SELECT * FROM users WHERE clerkUserId = ?').get(userId);
    if (!user) throw new Error("User not found");

    let account;
    const executeToggle = db.transaction(() => {
      db.prepare('UPDATE accounts SET isDefault = 0 WHERE userId = ? AND isDefault = 1').run(user.id);
      db.prepare('UPDATE accounts SET isDefault = 1 WHERE id = ? AND userId = ?').run(accountId, user.id);
      account = db.prepare('SELECT * FROM accounts WHERE id = ? AND userId = ?').get(accountId, user.id);
    });

    executeToggle();

    revalidatePath("/dashboard");
    return { success: true, data: serializeDecimal(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
