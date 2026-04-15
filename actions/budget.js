"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = db.prepare('SELECT * FROM users WHERE clerkUserId = ?').get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const budget = db.prepare('SELECT * FROM budgets WHERE userId = ?').get(user.id);

    // Get current month's expenses
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const expenses = db.prepare(`
      SELECT SUM(amount) as sumAmount
      FROM transactions 
      WHERE userId = ? AND type = 'EXPENSE' AND accountId = ? AND date >= ? AND date <= ?
    `).get(user.id, accountId, startOfMonth.toISOString(), endOfMonth.toISOString());

    return {
      budget: budget ? { ...budget, amount: budget.amount } : null,
      currentExpenses: expenses.sumAmount ? expenses.sumAmount : 0,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = db.prepare('SELECT * FROM users WHERE clerkUserId = ?').get(userId);
    if (!user) throw new Error("User not found");

    const upsertTx = db.transaction(() => {
      let b = db.prepare('SELECT id FROM budgets WHERE userId = ?').get(user.id);
      if (b) {
        db.prepare('UPDATE budgets SET amount = ?, updatedAt = ? WHERE userId = ?')
          .run(amount, new Date().toISOString(), user.id);
      } else {
        const newId = crypto.randomUUID();
        const now = new Date().toISOString();
        db.prepare('INSERT INTO budgets (id, amount, userId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)')
          .run(newId, amount, user.id, now, now);
      }
      return db.prepare('SELECT * FROM budgets WHERE userId = ?').get(user.id);
    });

    const budget = upsertTx();

    revalidatePath("/dashboard");
    return {
      success: true,
      data: { ...budget, amount: budget.amount },
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return { success: false, error: error.message };
  }
}
