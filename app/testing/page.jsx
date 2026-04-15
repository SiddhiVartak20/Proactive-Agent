'use client';

import React, { useState } from 'react';
import { Sparkles, Wifi, WifiOff, Zap, Brain, TrendingUp, Receipt, Phone, Mail, Building2, Cpu, BarChart3, ArrowRight, Check, IndianRupee } from 'lucide-react';

export default function FinanceLandingPage() {
  const [activeTab, setActiveTab] = useState('individual');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold">FinanceAI</span>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition">
              Sign In
            </button>
          </div>
        </nav>

        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full mb-6 border border-purple-500/30">
            <WifiOff className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-purple-300">100% Offline Capable • Works Anywhere in India</span>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Manage Your Finance Like Never Before 
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            AI-powered finance management that works without internet. 
            For individuals growing wealth and businesses scaling AI.
          </p>
          
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-lg hover:scale-105 transition flex items-center gap-2">
              Start Free <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur rounded-lg font-semibold text-lg hover:bg-white/20 transition">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Tab Switch */}
        <div className="flex justify-center gap-4 mb-12">
          <button 
            onClick={() => setActiveTab('individual')}
            className={`px-8 py-3 rounded-lg font-semibold transition ${
              activeTab === 'individual' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            For Individuals
          </button>
          <button 
            onClick={() => setActiveTab('business')}
            className={`px-8 py-3 rounded-lg font-semibold transition ${
              activeTab === 'business' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            For Business
          </button>
        </div>

        {/* Individual Features */}
        {activeTab === 'individual' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Receipt Scanner</h3>
              <p className="text-gray-300">Snap any bill, receipt, or invoice. AI extracts everything automatically. No manual entry ever.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <WifiOff className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Offline AI</h3>
              <p className="text-gray-300">Works in rural areas, during travel, anywhere. Zero internet needed. Processes in your browser.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Alerts & Calls</h3>
              <p className="text-gray-300">AI detects overspending patterns and calls you before budget breach. Real-time intervention.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Monthly AI Coach</h3>
              <p className="text-gray-300">End-of-month summary with category-wise insights and personalized savings suggestions via email.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Investment Guidance</h3>
              <p className="text-gray-300">AI-powered recommendations to grow your wealth. Step-by-step guides for every financial decision.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Behavior Detection</h3>
              <p className="text-gray-300">Premium users get AI behavior analysis with proactive change suggestions and habit tracking.</p>
            </div>
          </div>
        )}

        {/* Business Features */}
        {activeTab === 'business' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">ML Workflow Finance</h3>
              <p className="text-gray-300">Track every rupee spent on GPU compute, cloud resources, and AI infrastructure in real-time.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Inference Cost Calculator</h3>
              <p className="text-gray-300">Predict deployment costs before production. Optimize model serving and prevent budget overruns.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time Optimization</h3>
              <p className="text-gray-300">AI suggests cost-saving opportunities across your ML pipeline. Auto-optimize resource allocation.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Multi-Team Dashboard</h3>
              <p className="text-gray-300">Centralized finance hub for AI companies. Track expenses across teams, projects, and departments.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Budget Forecasting</h3>
              <p className="text-gray-300">AI predicts next quarter's compute costs based on usage patterns and model complexity.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">API Access</h3>
              <p className="text-gray-300">Integrate cost tracking into your ML ops pipeline. Programmatic access to all finance data.</p>
            </div>
          </div>
        )}

        {/* Pricing Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4">Pay Only For What You Need</h2>
          <p className="text-gray-300 text-center mb-12">No bundles. No waste. Choose your features.</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Individual Pricing */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
              <h3 className="text-2xl font-bold mb-4">Individual</h3>
              <div className="flex items-baseline mb-6">
                <IndianRupee className="w-6 h-6 mr-1" />
                <span className="text-4xl font-bold">149-399</span>
                <span className="text-gray-300 ml-2">/feature/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span>AI Receipt Scanner - ₹249/mo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span>Offline AI Access - ₹149/mo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span>Monthly AI Reports - ₹249/mo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span>Investment Guidance - ₹299/mo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span>Smart Alerts & Calls - ₹399/mo</span>
                </li>
              </ul>
              <p className="text-sm text-gray-300 mb-6">Average: ₹750/month (3 features)</p>
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:scale-105 transition">
                Start Free Trial
              </button>
            </div>

            {/* Business Pricing */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/30">
              <h3 className="text-2xl font-bold mb-4">Business</h3>
              <div className="flex items-baseline mb-6">
                <IndianRupee className="w-6 h-6 mr-1" />
                <span className="text-4xl font-bold">3,999</span>
                <span className="text-gray-300 ml-2">/month base</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span>ML Workflow Dashboard - ₹7,999/mo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span>Inference Calculator - ₹6,499/mo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span>Multi-Team Analytics - ₹11,999/mo</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span>API Access - ₹0.80/prediction</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span>Priority Support & Onboarding</span>
                </li>
              </ul>
              <p className="text-sm text-gray-300 mb-6">Average: ₹20,000/month</p>
              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold hover:scale-105 transition">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-8 mb-20 text-center">
          <div>
            <div className="text-4xl font-bold text-purple-400 mb-2">94%</div>
            <div className="text-gray-300">Receipt Accuracy</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-pink-400 mb-2">200ms</div>
            <div className="text-gray-300">Processing Speed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">0</div>
            <div className="text-gray-300">Internet Required</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400 mb-2">₹3,500</div>
            <div className="text-gray-300">Avg Monthly Savings</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Finances?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands managing money smarter. Works anywhere in India.</p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold text-lg hover:scale-105 transition">
              Get Started Free
            </button>
            <button className="px-8 py-4 bg-white/20 backdrop-blur rounded-lg font-semibold text-lg hover:bg-white/30 transition">
              Talk to Sales
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>© 2024 FinanceAI. Made with 💜 for India's Financial Future.</p>
        </div>
      </div>
    </div>
  );
}