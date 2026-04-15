import { inngest } from "./client";
import { db } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

// 1. Recurring Transaction Processing with Throttling
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.userId",
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data:", event);
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = db.prepare('SELECT * FROM transactions WHERE id = ? AND userId = ?').get(event.data.transactionId, event.data.userId);

      if (!transaction || !isTransactionDue(transaction)) return;

      const txAction = db.transaction(() => {
        const newId = crypto.randomUUID();
        const now = new Date().toISOString();
        
        db.prepare(`
          INSERT INTO transactions (id, type, amount, description, date, category, status, isRecurring, userId, accountId, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newId, transaction.type, transaction.amount, `${transaction.description} (Recurring)`, 
          now, transaction.category, "COMPLETED", 0, transaction.userId, transaction.accountId, now, now
        );

        const balanceChange = transaction.type === "EXPENSE" ? -transaction.amount : transaction.amount;
        db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(balanceChange, transaction.accountId);

        const nextDate = calculateNextRecurringDate(new Date(), transaction.recurringInterval).toISOString();
        db.prepare('UPDATE transactions SET lastProcessed = ?, nextRecurringDate = ? WHERE id = ?').run(now, nextDate, transaction.id);
      });

      txAction();
    });
  }
);

// Trigger recurring transactions with batching
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return db.prepare(`SELECT * FROM transactions WHERE isRecurring = 1 AND status = 'COMPLETED' AND (lastProcessed IS NULL OR nextRecurringDate <= ?)`).all(new Date().toISOString());
      }
    );

    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: transaction.id,
          userId: transaction.userId,
        },
      }));
      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  }
);

// 2. Monthly Report Generation
async function generateFinancialInsights(stats, month) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return db.prepare('SELECT * FROM users').all();
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        const insights = await generateFinancialInsights(stats, monthName);
        console.log(`Report generated for ${user.email} - ${monthName}`);
      });
    }

    return { processed: users.length };
  }
);

// 3. Budget Alerts with Event Batching
export const checkBudgetAlerts = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budgets", async () => {
      const allBudgets = db.prepare('SELECT * FROM budgets').all();
      for (const budget of allBudgets) {
         const defaultAccount = db.prepare('SELECT * FROM accounts WHERE userId = ? AND isDefault = 1').get(budget.userId);
         budget.user = { accounts: defaultAccount ? [defaultAccount] : [], email: "budget-alert-user@example.com", name: "User" };
      }
      return allBudgets;
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      await step.run(`check-budget-${budget.id}`, async () => {
        const startDate = new Date();
        startDate.setDate(1);

        const expensesResult = db.prepare(`SELECT SUM(amount) as sumAmount FROM transactions WHERE userId = ? AND accountId = ? AND type = 'EXPENSE' AND date >= ?`).get(budget.userId, defaultAccount.id, startDate.toISOString());
        
        const totalExpenses = expensesResult.sumAmount || 0;
        const budgetAmount = budget.amount;
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          console.log(`Budget Alert logic processed for ${defaultAccount.name} at ${percentageUsed}% used.`);

          db.prepare('UPDATE budgets SET lastAlertSent = ? WHERE id = ?').run(new Date().toISOString(), budget.id);
        }
      });
    }
  }
);

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

// Utility functions
function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  return nextDue <= today;
}

function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = db.prepare('SELECT * FROM transactions WHERE userId = ? AND date >= ? AND date <= ?').all(userId, startDate.toISOString(), endDate.toISOString());

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount;
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}
