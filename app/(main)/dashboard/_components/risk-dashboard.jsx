"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  RefreshCw,
  Activity,
  Zap,
  Target,
  Brain,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import useFetch from "@/hooks/use-fetch";
import { getRiskAnalysis } from "@/actions/risk-engine";
import { cn } from "@/lib/utils";

// ─── Risk Score Gauge ────────────────────────────────────────────────────────

function RiskScoreGauge({ score, healthLabel, healthColor }) {
  const colorMap = {
    green: { ring: "stroke-green-500", text: "text-green-600", bg: "bg-green-50 border-green-200" },
    blue: { ring: "stroke-blue-500", text: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
    yellow: { ring: "stroke-yellow-500", text: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
    orange: { ring: "stroke-orange-500", text: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
    red: { ring: "stroke-red-500", text: "text-red-600", bg: "bg-red-50 border-red-200" },
  };
  const colors = colorMap[healthColor] || colorMap.blue;

  // SVG arc for gauge
  const radius = 54;
  const circumference = Math.PI * radius; // half circle
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center justify-center p-6 rounded-xl border-2", colors.bg)}>
      <div className="relative w-36 h-20 overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            className={colors.ring}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 157} 157`}
          />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className={cn("text-3xl font-black", colors.text)}>{score}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">out of 100</p>
      <Badge
        className={cn("mt-2 text-sm font-semibold", colors.text, colors.bg, "border")}
        variant="outline"
      >
        {healthLabel}
      </Badge>
      <p className="text-xs text-muted-foreground mt-1">Financial Health</p>
    </div>
  );
}

// ─── Alert Item ──────────────────────────────────────────────────────────────

function AlertItem({ alert }) {
  const typeStyles = {
    critical: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };
  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-lg border text-sm", typeStyles[alert.type])}>
      <span className="text-lg leading-none mt-0.5">{alert.icon}</span>
      <div>
        <p className="font-semibold">{alert.title}</p>
        <p className="opacity-80 mt-0.5">{alert.message}</p>
      </div>
    </div>
  );
}

// ─── Suggestion Item ─────────────────────────────────────────────────────────

function SuggestionItem({ suggestion }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-purple-50 border-purple-200 text-sm">
      <span className="text-lg leading-none mt-0.5">{suggestion.icon}</span>
      <div className="flex-1">
        <p className="font-semibold text-purple-800">{suggestion.title}</p>
        <p className="text-purple-700 opacity-80 mt-0.5">{suggestion.description}</p>
        {suggestion.potentialSaving > 0 && (
          <p className="text-green-700 font-medium mt-1">
            💡 Potential saving: ${suggestion.potentialSaving.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Prediction Item ─────────────────────────────────────────────────────────

function PredictionItem({ prediction }) {
  const severityStyles = {
    critical: { bg: "bg-red-50 border-red-300", badge: "bg-red-100 text-red-700", icon: "🔴" },
    high: { bg: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700", icon: "🟠" },
    medium: { bg: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-100 text-yellow-700", icon: "🟡" },
    low: { bg: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700", icon: "🔵" },
  };
  const style = severityStyles[prediction.severity] || severityStyles.low;
  return (
    <div className={cn("flex items-start gap-3 p-3 rounded-lg border text-sm", style.bg)}>
      <span className="text-base leading-none mt-0.5">{style.icon}</span>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{prediction.title}</p>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", style.badge)}>
            {prediction.severity}
          </span>
        </div>
        <p className="text-muted-foreground mt-0.5">{prediction.description}</p>
      </div>
    </div>
  );
}

// ─── Category Pattern Row ────────────────────────────────────────────────────

function CategoryPatternRow({ pattern }) {
  const isUp = pattern.trend > 5;
  const isDown = pattern.trend < -5;
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium capitalize">{pattern.category}</span>
        {isUp && <TrendingUp className="h-3 w-3 text-red-500" />}
        {isDown && <TrendingDown className="h-3 w-3 text-green-500" />}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">${pattern.currentAmount.toFixed(0)}</span>
        {pattern.avgAmount > 0 && (
          <span
            className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              isUp ? "bg-red-100 text-red-700" : isDown ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            )}
          >
            {pattern.trend > 0 ? "+" : ""}{pattern.trend.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function RiskDashboard() {
  const { loading, fn: fetchRisk, data: riskData, error } = useFetch(getRiskAnalysis);

  useEffect(() => {
    fetchRisk();
  }, []);

  const analysis = riskData?.data;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Brain className="h-8 w-8 animate-pulse text-purple-500" />
            <p className="text-sm">Analyzing your financial patterns...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <p className="text-sm">Add more transactions to enable risk analysis.</p>
            <Button size="sm" variant="outline" onClick={() => fetchRisk()}>
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { riskScore, healthLabel, healthColor, riskFactors, predictions, alerts, suggestions, categoryPatterns, salaryCycleDay, metrics } = analysis;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">AI Risk Intelligence</h2>
        </div>
        <Button size="sm" variant="outline" onClick={() => fetchRisk()} disabled={loading}>
          <RefreshCw className={cn("h-3 w-3 mr-1", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Top Row: Score + Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Risk Score */}
        <RiskScoreGauge score={riskScore} healthLabel={healthLabel} healthColor={healthColor} />

        {/* Key Metrics */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          <MetricCard
            label="Monthly Income"
            value={`$${metrics.monthIncome.toFixed(0)}`}
            sub={`Avg: $${metrics.avgMonthlyIncome.toFixed(0)}`}
            icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          />
          <MetricCard
            label="Monthly Expenses"
            value={`$${metrics.monthExpenses.toFixed(0)}`}
            sub={`Avg: $${metrics.avgMonthlyExpenses.toFixed(0)}`}
            icon={<TrendingDown className="h-4 w-4 text-red-500" />}
          />
          <MetricCard
            label="Projected Balance"
            value={`$${metrics.projectedEndBalance.toFixed(0)}`}
            sub={`${metrics.daysLeft} days left`}
            icon={<Target className="h-4 w-4 text-blue-500" />}
            highlight={metrics.projectedEndBalance < 0}
          />
          <MetricCard
            label="Daily Burn Rate"
            value={`$${metrics.dailyBurnRate.toFixed(0)}/day`}
            sub={`Recurring: $${metrics.recurringTotal.toFixed(0)}`}
            icon={<Zap className="h-4 w-4 text-orange-500" />}
          />
        </div>
      </div>

      {/* Budget Progress */}
      {metrics.budgetAmount && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Budget Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>${metrics.monthExpenses.toFixed(2)} spent</span>
                <span className="text-muted-foreground">${metrics.budgetAmount.toFixed(2)} budget</span>
              </div>
              <Progress
                value={Math.min(100, (metrics.monthExpenses / metrics.budgetAmount) * 100)}
                extraStyles={
                  metrics.monthExpenses / metrics.budgetAmount >= 1
                    ? "bg-red-500"
                    : metrics.monthExpenses / metrics.budgetAmount >= 0.8
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }
              />
              <p className="text-xs text-muted-foreground text-right">
                {((metrics.monthExpenses / metrics.budgetAmount) * 100).toFixed(1)}% used
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid: Predictions + Alerts + Suggestions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Predictions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-orange-500" />
              Risk Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {predictions.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600 text-sm py-2">
                <CheckCircle2 className="h-4 w-4" />
                No major risks predicted this month!
              </div>
            ) : (
              predictions.map((p, i) => <PredictionItem key={i} prediction={p} />)
            )}
          </CardContent>
        </Card>

        {/* Smart Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Smart Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600 text-sm py-2">
                <CheckCircle2 className="h-4 w-4" />
                All clear — no alerts right now.
              </div>
            ) : (
              alerts.map((a, i) => <AlertItem key={i} alert={a} />)
            )}
            {salaryCycleDay && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-sm text-indigo-800">
                <Info className="h-4 w-4 shrink-0" />
                <span>Salary pattern detected: typically around day <strong>{salaryCycleDay}</strong> of the month.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Auto-Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-purple-500" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestions.map((s, i) => <SuggestionItem key={i} suggestion={s} />)}
          </CardContent>
        </Card>
      )}

      {/* Habit Learning: Category Patterns */}
      {categoryPatterns.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-indigo-500" />
              Spending Habit Analysis
              <span className="text-xs text-muted-foreground font-normal ml-1">(vs. 3-month avg)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {categoryPatterns.slice(0, 6).map((p, i) => (
                <CategoryPatternRow key={i} pattern={p} />
              ))}
            </div>
            {/* Risk Factors */}
            {riskFactors.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">Contributing Risk Factors</p>
                <div className="flex flex-wrap gap-2">
                  {riskFactors.map((f, i) => (
                    <span
                      key={i}
                      className={cn(
                        "text-xs px-2 py-1 rounded-full border font-medium",
                        f.impact === "high"
                          ? "bg-red-50 border-red-200 text-red-700"
                          : f.impact === "medium"
                          ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                          : "bg-blue-50 border-blue-200 text-blue-700"
                      )}
                    >
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Small metric card ───────────────────────────────────────────────────────

function MetricCard({ label, value, sub, icon, highlight }) {
  return (
    <div className={cn("p-3 rounded-lg border bg-card", highlight && "border-red-300 bg-red-50")}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className={cn("text-lg font-bold", highlight && "text-red-600")}>{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
