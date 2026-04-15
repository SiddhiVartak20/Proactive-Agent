'use client';

import React, { useState } from 'react';
import { Cpu, TrendingUp, TrendingDown, AlertTriangle, IndianRupee, Server, Zap, Database, Activity, Users, BarChart3, PieChart, Clock, Target, ChevronDown, Bell, Settings, Building2 } from 'lucide-react';

export default function BusinessDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const mlWorkflows = [
    { id: 1, name: 'Image Classification Model', gpu: 'A100 x4', cost: 45000, runtime: '120h', status: 'running', color: 'bg-green-500' },
    { id: 2, name: 'NLP Fine-tuning', gpu: 'V100 x2', cost: 28000, runtime: '85h', status: 'running', color: 'bg-green-500' },
    { id: 3, name: 'Recommendation Engine', gpu: 'T4 x8', cost: 32000, runtime: '156h', status: 'completed', color: 'bg-blue-500' },
    { id: 4, name: 'Data Preprocessing', gpu: 'CPU Cluster', cost: 8500, runtime: '48h', status: 'scheduled', color: 'bg-yellow-500' },
  ];

  const inferenceCosts = [
    { model: 'ResNet-50', requests: '1.2M', cost: 15000, perRequest: 0.0125 },
    { model: 'BERT-Base', requests: '850K', cost: 22000, perRequest: 0.026 },
    { model: 'GPT-2 Custom', requests: '450K', cost: 38000, perRequest: 0.084 },
    { model: 'YOLOv8', requests: '2.1M', cost: 18000, perRequest: 0.0086 },
  ];

  const teamExpenses = [
    { team: 'ML Research', budget: 200000, spent: 156000, percent: 78 },
    { team: 'Production AI', budget: 150000, spent: 142000, percent: 95 },
    { team: 'Data Engineering', budget: 100000, spent: 68000, percent: 68 },
    { team: 'MLOps', budget: 80000, spent: 71000, percent: 89 },
  ];

  const aiAlerts = [
    { type: 'critical', message: 'Production AI team exceeding budget by 15%', color: 'border-red-500 bg-red-500/10' },
    { type: 'warning', message: 'GPU utilization at 92% - consider scaling', color: 'border-orange-500 bg-orange-500/10' },
    { type: 'success', message: 'Saved ₹25K by optimizing inference batch size', color: 'border-green-500 bg-green-500/10' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-400" />
            ML Finance Command Center
          </h1>
          <p className="text-gray-400 mt-1">Real-time AI infrastructure cost monitoring & optimization</p>
        </div>
        <div className="flex gap-3 items-center">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg border border-white/20 hover:bg-white/20 transition cursor-pointer"
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Quarter">This Quarter</option>
          </select>
          <button className="p-3 bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-3 bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">Total ML Spend</p>
              <div className="flex items-baseline gap-1 mt-1">
                <IndianRupee className="w-6 h-6" />
                <h3 className="text-3xl font-bold">4.37L</h3>
              </div>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Cpu className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-blue-400 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +18% from last month
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">Active GPU Hours</p>
              <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-3xl font-bold">1,247</h3>
                <span className="text-sm text-gray-400">hrs</span>
              </div>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-purple-400 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            92% utilization rate
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">Inference Requests</p>
              <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-3xl font-bold">4.6M</h3>
              </div>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-sm text-green-400 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +24% increase
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-400 text-sm">Cost per Request</p>
              <div className="flex items-baseline gap-1 mt-1">
                <IndianRupee className="w-5 h-5" />
                <h3 className="text-3xl font-bold">0.095</h3>
              </div>
            </div>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Target className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-green-400 flex items-center gap-1">
            <TrendingDown className="w-4 h-4" />
            -8% optimized
          </p>
        </div>
      </div>

      {/* AI Alerts */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-6 h-6 text-orange-400" />
          <h3 className="text-xl font-bold">AI Cost Alerts & Recommendations</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {aiAlerts.map((alert, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${alert.color}`}>
              <p className="text-sm">{alert.message}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Active ML Workflows */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Server className="w-6 h-6 text-blue-400" />
              Active ML Workflows
            </h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {mlWorkflows.map((workflow) => (
              <div key={workflow.id} className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">{workflow.name}</p>
                    <p className="text-sm text-gray-400">{workflow.gpu}</p>
                  </div>
                  <span className={`px-3 py-1 ${workflow.color} rounded-full text-xs font-medium`}>
                    {workflow.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Cost: ₹{workflow.cost.toLocaleString()}</span>
                  <span className="text-gray-400">Runtime: {workflow.runtime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Budget Overview */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              Team Budget Overview
            </h3>
          </div>
          <div className="space-y-5">
            {teamExpenses.map((team, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{team.team}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${team.percent > 90 ? 'text-red-400' : team.percent > 75 ? 'text-orange-400' : 'text-green-400'}`}>
                      {team.percent}%
                    </span>
                    <span className="text-sm text-gray-400">
                      ₹{team.spent.toLocaleString()} / ₹{team.budget.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      team.percent > 90 ? 'bg-gradient-to-r from-red-600 to-red-400' :
                      team.percent > 75 ? 'bg-gradient-to-r from-orange-600 to-orange-400' :
                      'bg-gradient-to-r from-green-600 to-green-400'
                    }`}
                    style={{ width: `${team.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inference Cost Breakdown */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-400" />
            Inference Cost Calculator
          </h3>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold hover:scale-105 transition text-sm">
            Optimize Costs
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 text-sm font-semibold text-gray-400">Model</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-400">Requests</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-400">Total Cost</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-400">Per Request</th>
                <th className="text-right py-3 text-sm font-semibold text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {inferenceCosts.map((model, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-4">
                    <span className="font-medium">{model.model}</span>
                  </td>
                  <td className="text-right py-4 text-gray-300">{model.requests}</td>
                  <td className="text-right py-4">
                    <span className="font-semibold flex items-center justify-end gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {model.cost.toLocaleString()}
                    </span>
                  </td>
                  <td className="text-right py-4 text-gray-300">₹{model.perRequest}</td>
                  <td className="text-right py-4">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                      Optimized
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Forecast & Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Next Month Forecast
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Predicted GPU Spend</span>
              <span className="font-bold text-xl flex items-center gap-1">
                <IndianRupee className="w-5 h-5" />
                5.2L
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Inference Costs</span>
              <span className="font-bold text-xl flex items-center gap-1">
                <IndianRupee className="w-5 h-5" />
                1.1L
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Storage & Data Transfer</span>
              <span className="font-bold text-xl flex items-center gap-1">
                <IndianRupee className="w-5 h-5" />
                45K
              </span>
            </div>
            <div className="pt-4 border-t border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Projected</span>
                <span className="font-bold text-2xl text-blue-400 flex items-center gap-1">
                  <IndianRupee className="w-6 h-6" />
                  6.35L
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Cost Optimization Tips
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-white/10 rounded-lg">
              <p className="text-sm font-medium mb-1">Batch Size Optimization</p>
              <p className="text-xs text-gray-400">Increase inference batch size from 32 to 64</p>
              <p className="text-xs text-green-400 mt-1">Potential savings: ₹18K/month</p>
            </div>
            <div className="p-3 bg-white/10 rounded-lg">
              <p className="text-sm font-medium mb-1">Spot Instance Usage</p>
              <p className="text-xs text-gray-400">Switch 40% training to spot instances</p>
              <p className="text-xs text-green-400 mt-1">Potential savings: ₹45K/month</p>
            </div>
            <div className="p-3 bg-white/10 rounded-lg">
              <p className="text-sm font-medium mb-1">Model Quantization</p>
              <p className="text-xs text-gray-400">Apply INT8 quantization to BERT model</p>
              <p className="text-xs text-green-400 mt-1">Potential savings: ₹12K/month</p>
            </div>
          </div>
          <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:scale-105 transition">
            Apply Recommendations
          </button>
        </div>
      </div>
    </div>
  );
}