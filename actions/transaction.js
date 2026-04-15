"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";
import crypto from "crypto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount,
});

export async function createTransaction(data) {
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

    const account = db.prepare('SELECT * FROM accounts WHERE id = ? AND userId = ?').get(data.accountId, user.id);
    if (!account) throw new Error("Account not found");

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;

    const createTx = db.transaction(() => {
      const newTransactionId = crypto.randomUUID();
      const nextDate = data.isRecurring && data.recurringInterval
        ? calculateNextRecurringDate(data.date, data.recurringInterval).toISOString()
        : null;
      
      const now = new Date().toISOString();
      const dateStr = new Date(data.date).toISOString();

      db.prepare(`
        INSERT INTO transactions (id, type, amount, description, date, category, status, isRecurring, recurringInterval, nextRecurringDate, userId, accountId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newTransactionId, data.type, data.amount, data.description, dateStr, data.category, "COMPLETED", data.isRecurring ? 1 : 0, data.recurringInterval, nextDate, user.id, data.accountId, now, now);

      db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(balanceChange, data.accountId);
      
      return db.prepare('SELECT * FROM transactions WHERE id = ?').get(newTransactionId);
    });

    const transaction = createTx();

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = db.prepare('SELECT * FROM users WHERE clerkUserId = ?').get(userId);
  if (!user) throw new Error("User not found");

  const transaction = db.prepare('SELECT * FROM transactions WHERE id = ? AND userId = ?').get(id, user.id);
  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = db.prepare('SELECT * FROM users WHERE clerkUserId = ?').get(userId);
    if (!user) throw new Error("User not found");

    const originalTransaction = db.prepare('SELECT * FROM transactions WHERE id = ? AND userId = ?').get(id, user.id);
    if (!originalTransaction) throw new Error("Transaction not found");

    const oldBalanceChange = originalTransaction.type === "EXPENSE" ? -originalTransaction.amount : originalTransaction.amount;
    const newBalanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const netBalanceChange = newBalanceChange - oldBalanceChange;

    const updateTx = db.transaction(() => {
      const nextDate = data.isRecurring && data.recurringInterval
        ? calculateNextRecurringDate(data.date, data.recurringInterval).toISOString()
        : null;
      
      const now = new Date().toISOString();
      const dateStr = new Date(data.date).toISOString();

      db.prepare(`
        UPDATE transactions 
        SET type = ?, amount = ?, description = ?, date = ?, category = ?, isRecurring = ?, recurringInterval = ?, nextRecurringDate = ?, accountId = ?, updatedAt = ?
        WHERE id = ? AND userId = ?
      `).run(data.type, data.amount, data.description, dateStr, data.category, data.isRecurring ? 1 : 0, data.recurringInterval, nextDate, data.accountId, now, id, user.id);

      db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(netBalanceChange, data.accountId);

      return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    });

    const transaction = updateTx();

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = db.prepare('SELECT * FROM users WHERE clerkUserId = ?').get(userId);
    if (!user) throw new Error("User not found");

    let sql = 'SELECT t.*, a.name as accountName, a.type as accountType, a.balance as accountBalance, a.isDefault as accountIsDefault FROM transactions t LEFT JOIN accounts a ON t.accountId = a.id WHERE t.userId = ?';
    const params = [user.id];

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && typeof value !== 'object') {
        sql += ` AND t.${key} = ?`;
        params.push(value);
      }
    }

    sql += ' ORDER BY t.date DESC';

    const rawTx = db.prepare(sql).all(...params);

    const transactions = rawTx.map(t => {
      const { accountName, accountType, accountBalance, accountIsDefault, ...rest } = t;
      return {
        ...rest,
        account: {
          id: t.accountId,
          name: accountName,
          type: accountType,
          balance: accountBalance,
          isDefault: Boolean(accountIsDefault)
        }
      };
    });

    return { success: true, data: transactions };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Scan Receipt
export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt");
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
