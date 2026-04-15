'use client';

import React, { useState } from 'react';
import { Camera, TrendingDown, TrendingUp, AlertCircle, IndianRupee, Calendar, PieChart, Bell, Settings, User, CreditCard, ShoppingCart, Home, Utensils, Zap, Phone, Mail, Download, Upload } from 'lucide-react';

export default function IndividualDashboard() {
  const [selectedMonth] = useState('November 2024');

  const expenses = [
    { id: 1, category: 'Food & Dining', amount: 8500, icon: Utensils, color: 'from-orange-500 to-red-500', percent: 28 },
    { id: 2, category: 'Shopping', amount: 6200, icon: ShoppingCart, color: 'from-purple-500 to-pink-500', percent: 20 },
    { id: 3, category: 'Rent & Bills', amount: 15000, icon: Home, color: 'from-blue-500 to-cyan-500', percent: 50 },
    { id: 4, category: 'Utilities', amount: 3500, icon: Zap, color: 'from-green-500 to-emerald-500', percent: 12 },
  ];

  const recentTransactions = [
    { id: 1, name: 'Swiggy - Dinner', amount: -450, date: 'Today, 8:30 PM', category: 'Food', type: 'expense' },
    { id: 2, name: 'Salary Credited', amount: 75000, date: 'Today, 2:00 AM', category: 'Income', type: 'income' },
    { id: 3, name: 'Metro Recharge', amount: -500, date: 'Yesterday', category: 'Transport', type: 'expense' },
    { id: 4, name: 'Amazon - Electronics', amount: -2499, date: 'Nov 27', category: 'Shopping', type: 'expense' },
    { id: 5, name: 'Electricity Bill', amount: -1850, date: 'Nov 25', category: 'Utilities', type: 'expense' },
  ];

  const aiInsights = [
    { type: 'warning', message: 'Food spending is 35% higher than last month', color: 'border-orange-500 bg-orange-500/10' },
    { type: 'success', message: 'Great! You saved ₹4,200 this month', color: 'border-green-500 bg-green-500/10' },
    { type: 'info', message: 'Consider investing in Mutual Funds with your savings', color: 'border-blue-500 bg-blue-500/10' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Rahul 👋</h1>
          <p className="text-gray-400 mt-1">Here's your financial overview for {selectedMonth}</p>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-3 bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:scale-105 transition">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* AI Scan Button - Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="relative flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Scan Receipt with AI</h2>
            <p className="text-white/80 mb-4">Snap any bill - AI adds it automatically. Works offline!</p>
            <button className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:scale-105 transition flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Scan Now
            </button>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Camera className="w-16 h-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">Total Balance</p>
              <div className="flex items-baseline gap-1 mt-1">
                <IndianRupee className="w-6 h-6" />
                <h3 className="text-3xl font-bold">48,250</h3>
              </div>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-sm text-green-400 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +12.5% from last month
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">This Month Spent</p>
              <div className="flex items-baseline gap-1 mt-1">
                <IndianRupee className="w-6 h-6" />
                <h3 className="text-3xl font-bold">33,200</h3>
              </div>
            </div>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <TrendingDown className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-orange-400 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +8.2% higher than usual
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">Savings Goal</p>
              <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-3xl font-bold">68%</h3>
              </div>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* AI Insights */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold">AI Insights</h3>
          </div>
          <div className="space-y-4">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${insight.color}`}>
                <p className="text-sm">{insight.message}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:scale-105 transition">
            Get Full AI Report
          </button>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Spending by Category</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {expenses.map((expense) => {
              const Icon = expense.icon;
              return (
                <div key={expense.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${expense.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{expense.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        <span className="font-bold">{expense.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className={`bg-gradient-to-r ${expense.color} h-2 rounded-full`} style={{ width: `${expense.percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Recent Transactions</h3>
          <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">View All</button>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((txn) => (
            <div key={txn.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  txn.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {txn.type === 'income' ? (
                    <Download className="w-5 h-5 text-green-400" />
                  ) : (
                    <Upload className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{txn.name}</p>
                  <p className="text-sm text-gray-400">{txn.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${txn.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {txn.type === 'income' ? '+' : ''}{txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">{txn.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Features Banner */}
      <div className="mt-8 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="relative flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold mb-2">Upgrade to Premium Features</h3>
            <p className="text-white/80 mb-4">Get AI call alerts, behavior detection, and personalized investment guidance</p>
            <button className="px-6 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:scale-105 transition flex items-center gap-2">
              Explore Premium
            </button>
          </div>
          <div className="hidden md:flex gap-4">
            <Phone className="w-12 h-12 opacity-50" />
            <Mail className="w-12 h-12 opacity-50" />
            <CreditCard className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}