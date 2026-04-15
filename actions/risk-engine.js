"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Helpers ────────────────────────────────────────────────────────────────

function serializeDecimal(obj) {
  const out = { ...obj };
  if (out.amount) out.amount = out.amount.toNumber();
  if (out.balance) out.balance = out.balance.toNumber();
  return out;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// ─── Core data fetcher ───────────────────────────────────────────────────────

async function fetchUserFinancialData(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Last 3 months for pattern analysis
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const [accounts, currentMonthTx, historicalTx, budget] = await Promise.all([
    db.account.findMany({ where: { userId } }),
    db.transaction.findMany({
      where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
      orderBy: { date: "asc" },
    }),
    db.transaction.findMany({
      where: { userId, date: { gte: threeMonthsAgo, lt: startOfMonth } },
      orderBy: { date: "asc" },
    }),
    db.budget.findFirst({ where: { userId } }),
  ]);

  return {
    accounts: accounts.map(serializeDecimal),
    currentMonthTx: currentMonthTx.map(serializeDecimal),
    historicalTx: historicalTx.map(serializeDecimal),
    budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
    now,
    startOfMonth,
    endOfMonth,
  };
}

// ─── Risk Score Calculator (0-100, lower = healthier) ───────────────────────

function calculateRiskScore(data) {
  const { accounts, currentMonthTx, historicalTx, budget, now } = data;

  let score = 0;
  const factors = [];

  // Total balance
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  // Current month income & expenses
  const monthIncome = currentMonthTx
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const monthExpenses = currentMonthTx
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);

  // Historical monthly averages (last 3 months)
  const monthlyGroups = {};
  historicalTx.forEach((t) => {
    const key = `${new Date(t.date).getFullYear()}-${new Date(t.date).getMonth()}`;
    if (!monthlyGroups[key]) monthlyGroups[key] = { income: 0, expenses: 0 };
    if (t.type === "INCOME") monthlyGroups[key].income += t.amount;
    else monthlyGroups[key].expenses += t.amount;
  });
  const monthKeys = Object.keys(monthlyGroups);
  const avgMonthlyIncome =
    monthKeys.length > 0
      ? monthKeys.reduce((s, k) => s + monthlyGroups[k].income, 0) /
        monthKeys.length
      : monthIncome || 1;
  const avgMonthlyExpenses =
    monthKeys.length > 0
      ? monthKeys.reduce((s, k) => s + monthlyGroups[k].expenses, 0) /
        monthKeys.length
      : monthExpenses || 0;

  // 1. Budget overspend risk (0-25 pts)
  if (budget) {
    const pct = (monthExpenses / budget.amount) * 100;
    if (pct >= 100) { score += 25; factors.push({ label: "Over budget", impact: "high" }); }
    else if (pct >= 80) { score += 15; factors.push({ label: "Near budget limit", impact: "medium" }); }
    else if (pct >= 60) { score += 8; factors.push({ label: "Moderate budget usage", impact: "low" }); }
  }

  // 2. Low balance risk (0-25 pts)
  const daysInMonth = getDaysInMonth(now.getFullYear(), now.getMonth());
  const dayOfMonth = now.getDate();
  const daysLeft = daysInMonth - dayOfMonth;
  const dailyBurnRate = dayOfMonth > 0 ? monthExpenses / dayOfMonth : 0;
  const projectedRemainingExpenses = dailyBurnRate * daysLeft;
  const projectedEndBalance = totalBalance - projectedRemainingExpenses;

  if (projectedEndBalance < 0) { score += 25; factors.push({ label: "Balance may go negative", impact: "high" }); }
  else if (projectedEndBalance < totalBalance * 0.1) { score += 15; factors.push({ label: "Very low projected balance", impact: "high" }); }
  else if (projectedEndBalance < totalBalance * 0.2) { score += 8; factors.push({ label: "Low projected balance", impact: "medium" }); }

  // 3. Overspending vs historical (0-20 pts)
  if (avgMonthlyExpenses > 0) {
    const spendRatio = monthExpenses / avgMonthlyExpenses;
    if (spendRatio > 1.3) { score += 20; factors.push({ label: "Spending 30%+ above average", impact: "high" }); }
    else if (spendRatio > 1.15) { score += 10; factors.push({ label: "Spending above average", impact: "medium" }); }
  }

  // 4. Income vs expense ratio (0-15 pts)
  const effectiveIncome = monthIncome || avgMonthlyIncome;
  if (effectiveIncome > 0) {
    const ratio = monthExpenses / effectiveIncome;
    if (ratio > 1) { score += 15; factors.push({ label: "Expenses exceed income", impact: "high" }); }
    else if (ratio > 0.85) { score += 8; factors.push({ label: "High expense-to-income ratio", impact: "medium" }); }
  }

  // 5. Recurring bills risk (0-15 pts)
  const recurringExpenses = currentMonthTx.filter(
    (t) => t.type === "EXPENSE" && t.isRecurring
  );
  const recurringTotal = recurringExpenses.reduce((s, t) => s + t.amount, 0);
  if (effectiveIncome > 0 && recurringTotal / effectiveIncome > 0.5) {
    score += 15;
    factors.push({ label: "High recurring bill burden", impact: "high" });
  } else if (effectiveIncome > 0 && recurringTotal / effectiveIncome > 0.35) {
    score += 7;
    factors.push({ label: "Moderate recurring bills", impact: "medium" });
  }

  return {
    score: Math.min(100, Math.round(score)),
    factors,
    totalBalance,
    monthIncome,
    monthExpenses,
    avgMonthlyIncome,
    avgMonthlyExpenses,
    projectedEndBalance,
    dailyBurnRate,
    daysLeft,
    recurringTotal,
  };
}

// ─── Category spending patterns ──────────────────────────────────────────────

function analyzeCategoryPatterns(currentMonthTx, historicalTx) {
  const currentByCategory = {};
  currentMonthTx
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      currentByCategory[t.category] =
        (currentByCategory[t.category] || 0) + t.amount;
    });

  // Historical monthly average per category
  const historicalByCategory = {};
  const monthCount = {};
  historicalTx
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      const key = `${new Date(t.date).getFullYear()}-${new Date(t.date).getMonth()}`;
      if (!historicalByCategory[t.category])
        historicalByCategory[t.category] = {};
      historicalByCategory[t.category][key] =
        (historicalByCategory[t.category][key] || 0) + t.amount;
    });

  const avgByCategory = {};
  Object.entries(historicalByCategory).forEach(([cat, months]) => {
    const vals = Object.values(months);
    avgByCategory[cat] = vals.reduce((s, v) => s + v, 0) / vals.length;
  });

  const patterns = Object.entries(currentByCategory).map(([cat, amount]) => {
    const avg = avgByCategory[cat] || 0;
    const trend = avg > 0 ? ((amount - avg) / avg) * 100 : 0;
    return { category: cat, currentAmount: amount, avgAmount: avg, trend };
  });

  return patterns.sort((a, b) => b.currentAmount - a.currentAmount);
}

// ─── Salary cycle detection ──────────────────────────────────────────────────

function detectSalaryCycle(historicalTx) {
  const incomes = historicalTx
    .filter((t) => t.type === "INCOME")
    .map((t) => ({ ...t, day: new Date(t.date).getDate() }));

  if (incomes.length === 0) return null;

  const dayCounts = {};
  incomes.forEach((t) => {
    dayCounts[t.day] = (dayCounts[t.day] || 0) + 1;
  });

  const mostCommonDay = Object.entries(dayCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return mostCommonDay ? parseInt(mostCommonDay[0]) : null;
}

// ─── Main exported function ──────────────────────────────────────────────────

export async function getRiskAnalysis() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });
    if (!user) throw new Error("User not found");

    const data = await fetchUserFinancialData(user.id);
    const riskMetrics = calculateRiskScore(data);
    const categoryPatterns = analyzeCategoryPatterns(
      data.currentMonthTx,
      data.historicalTx
    );
    const salaryCycleDay = detectSalaryCycle(data.historicalTx);

    // Build predictions
    const predictions = [];

    // Overspending prediction
    if (riskMetrics.dailyBurnRate > 0 && riskMetrics.daysLeft > 0) {
      const projectedMonthTotal =
        riskMetrics.monthExpenses +
        riskMetrics.dailyBurnRate * riskMetrics.daysLeft;
      if (data.budget && projectedMonthTotal > data.budget.amount) {
        predictions.push({
          type: "overspending",
          severity: "high",
          title: "Budget Overspend Predicted",
          description: `At current pace, you'll spend $${projectedMonthTotal.toFixed(2)} vs your $${data.budget.amount.toFixed(2)} budget.`,
          projectedAmount: projectedMonthTotal,
        });
      }
    }

    // Low balance prediction
    if (riskMetrics.projectedEndBalance < riskMetrics.totalBalance * 0.15) {
      predictions.push({
        type: "low_balance",
        severity:
          riskMetrics.projectedEndBalance < 0 ? "critical" : "high",
        title: "Low Balance Warning",
        description: `Projected end-of-month balance: $${riskMetrics.projectedEndBalance.toFixed(2)}`,
        projectedAmount: riskMetrics.projectedEndBalance,
      });
    }

    // Missed bill prediction (recurring transactions not yet processed this month)
    const now = data.now;
    const recurringDue = data.historicalTx.filter((t) => {
      if (!t.isRecurring || t.type !== "EXPENSE") return false;
      const alreadyPaid = data.currentMonthTx.some(
        (ct) => ct.category === t.category && ct.description === t.description
      );
      return !alreadyPaid;
    });

    if (recurringDue.length > 0) {
      predictions.push({
        type: "missed_bill",
        severity: "medium",
        title: "Potential Missed Bills",
        description: `${recurringDue.length} recurring expense(s) may not have been paid this month.`,
        count: recurringDue.length,
      });
    }

    // Build smart alerts
    const alerts = [];

    if (riskMetrics.score >= 70) {
      alerts.push({
        id: "critical-risk",
        type: "critical",
        icon: "🚨",
        title: "High Financial Risk Detected",
        message: `Your risk score is ${riskMetrics.score}/100. Immediate action recommended.`,
      });
    }

    if (data.budget) {
      const pct = (riskMetrics.monthExpenses / data.budget.amount) * 100;
      if (pct >= 80) {
        alerts.push({
          id: "budget-alert",
          type: "warning",
          icon: "⚠️",
          title: `Budget ${pct >= 100 ? "Exceeded" : "Almost Exhausted"}`,
          message: `You've used ${pct.toFixed(1)}% of your monthly budget.`,
        });
      }
    }

    const topOverspentCategory = categoryPatterns.find((p) => p.trend > 20);
    if (topOverspentCategory) {
      alerts.push({
        id: "category-spike",
        type: "warning",
        icon: "📈",
        title: `${topOverspentCategory.category} Spending Spike`,
        message: `${topOverspentCategory.category} spending is ${topOverspentCategory.trend.toFixed(0)}% above your average.`,
      });
    }

    if (salaryCycleDay) {
      const daysToSalary =
        salaryCycleDay > now.getDate()
          ? salaryCycleDay - now.getDate()
          : getDaysInMonth(now.getFullYear(), now.getMonth()) -
            now.getDate() +
            salaryCycleDay;
      if (daysToSalary <= 5 && riskMetrics.totalBalance < riskMetrics.dailyBurnRate * daysToSalary * 1.5) {
        alerts.push({
          id: "salary-soon",
          type: "info",
          icon: "💰",
          title: "Salary Expected Soon",
          message: `Your salary is typically received around day ${salaryCycleDay}. ${daysToSalary} day(s) away.`,
        });
      }
    }

    // Build auto-suggestions
    const suggestions = [];

    const highSpendCategories = categoryPatterns
      .filter((p) => p.trend > 15)
      .slice(0, 2);
    highSpendCategories.forEach((p) => {
      suggestions.push({
        id: `reduce-${p.category}`,
        type: "reduce_spending",
        icon: "✂️",
        title: `Reduce ${p.category} Spending`,
        description: `You're spending ${p.trend.toFixed(0)}% more on ${p.category} than usual. Try cutting back by $${(p.currentAmount * 0.2).toFixed(2)}.`,
        potentialSaving: p.currentAmount * 0.2,
        category: p.category,
      });
    });

    if (riskMetrics.projectedEndBalance < riskMetrics.totalBalance * 0.2) {
      const nonEssentialCategories = ["entertainment", "shopping", "travel", "personal", "gifts"];
      const nonEssentialSpend = categoryPatterns
        .filter((p) => nonEssentialCategories.includes(p.category))
        .reduce((s, p) => s + p.currentAmount, 0);
      if (nonEssentialSpend > 0) {
        suggestions.push({
          id: "delay-nonessential",
          type: "delay_purchase",
          icon: "⏸️",
          title: "Delay Non-Essential Purchases",
          description: `You have $${nonEssentialSpend.toFixed(2)} in non-essential spending. Consider delaying until next month.`,
          potentialSaving: nonEssentialSpend * 0.5,
        });
      }
    }

    const unautomatedRecurring = data.currentMonthTx.filter(
      (t) => t.type === "EXPENSE" && !t.isRecurring && t.amount > 50
    );
    if (unautomatedRecurring.length > 0) {
      suggestions.push({
        id: "auto-payment",
        type: "auto_payment",
        icon: "🔄",
        title: "Set Up Auto-Payments",
        description: `${unautomatedRecurring.length} large expense(s) could be automated as recurring transactions to avoid missed payments.`,
        count: unautomatedRecurring.length,
      });
    }

    // Health label
    let healthLabel, healthColor;
    const s = riskMetrics.score;
    if (s <= 20) { healthLabel = "Excellent"; healthColor = "green"; }
    else if (s <= 40) { healthLabel = "Good"; healthColor = "blue"; }
    else if (s <= 60) { healthLabel = "Fair"; healthColor = "yellow"; }
    else if (s <= 80) { healthLabel = "Poor"; healthColor = "orange"; }
    else { healthLabel = "Critical"; healthColor = "red"; }

    return {
      success: true,
      data: {
        riskScore: riskMetrics.score,
        healthLabel,
        healthColor,
        riskFactors: riskMetrics.factors,
        predictions,
        alerts,
        suggestions,
        categoryPatterns,
        salaryCycleDay,
        metrics: {
          totalBalance: riskMetrics.totalBalance,
          monthIncome: riskMetrics.monthIncome,
          monthExpenses: riskMetrics.monthExpenses,
          avgMonthlyIncome: riskMetrics.avgMonthlyIncome,
          avgMonthlyExpenses: riskMetrics.avgMonthlyExpenses,
          projectedEndBalance: riskMetrics.projectedEndBalance,
          dailyBurnRate: riskMetrics.dailyBurnRate,
          daysLeft: riskMetrics.daysLeft,
          recurringTotal: riskMetrics.recurringTotal,
          budgetAmount: data.budget?.amount || null,
        },
      },
    };
  } catch (error) {
    console.error("Risk analysis error:", error);
    return { success: false, error: error.message };
  }
}
