"use server";

import aj from "@/lib/arcjet";
import { db } from "@/lib/db";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) serialized.balance = obj.balance;
  if (obj.amount) serialized.amount = obj.amount;
  if (obj.isDefault !== undefined) serialized.isDefault = Boolean(obj.isDefault);
  return serialized;
};

export async function getUserAccounts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = db.prepare('SELECT * FROM users WHERE clerkUserId = ?').get(userId);
  if (!user) throw new Error("User not found");

  try {
    const accounts = db.prepare('SELECT * FROM accounts WHERE userId = ? ORDER BY createdAt DESC').all(user.id);
    const getCount = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE accountId = ?');
    
    for (const account of accounts) {
      account._count = { transactions: getCount.get(account.id).count };
    }

    return accounts.map(serializeTransaction);
  } catch (error) {
    console.error(error.message);
  }
}

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const req = await request();
    const decision = await aj.protect(req, { userId, requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({ code: "RATE_LIMIT_EXCEEDED", details: { remaining, resetInSeconds: reset } });
        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked");
    }

    const user = db.prepare('SELECT * FROM users WHERE clerkUserId = ?').get(userId);
    if (!user) throw new Error("User not found");

    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) throw new Error("Invalid balance amount");

    const existingAccounts = db.prepare('SELECT id FROM accounts WHERE userId = ?').all(user.id);
    const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;

    const createTx = db.transaction(() => {
      if (shouldBeDefault) {
        db.prepare('UPDATE accounts SET isDefault = 0 WHERE userId = ? AND isDefault = 1').run(user.id);
      }
      const newId = crypto.randomUUID();
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO accounts (id, name, type, balance, isDefault, userId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newId, data.name, data.type, balanceFloat, shouldBeDefault ? 1 : 0, user.id, now, now);
      
      return db.prepare('SELECT * FROM accounts WHERE id = ?').get(newId);
    });

    const account = createTx();

    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = db.prepare('SELECT * FROM users WHERE clerkUserId = ?').get(userId);
  if (!user) throw new Error("User not found");

  const transactions = db.prepare('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC').all(user.id);

  return transactions.map(serializeTransaction);
}
