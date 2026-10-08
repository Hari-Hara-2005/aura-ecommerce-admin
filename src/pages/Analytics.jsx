import React from 'react';
import Header from '../components/Header';
import {
  TrendingUp, BarChart3, PieChart, DollarSign,
  Users, ShoppingBag, ArrowUpRight, Zap, Globe, CreditCard
} from 'lucide-react';

export default function Analytics() {
  const topChannels = [
    { channel: 'Direct Traffic', share: 44, revenue: '$21,415', growth: '+14%' },
    { channel: 'Google Organic', share: 28, revenue: '$13,628', growth: '+19%' },
    { channel: 'Social (Instagram & X)', share: 18, revenue: '$8,760', growth: '+32%' },
    { channel: 'Email Newsletter', share: 10, revenue: '$4,867', growth: '+8%' },
  ];

  const categoryBreakdown = [
    { name: 'Fragrances & Beauty', percent: 34, color: 'bg-violet-500', amount: '$16,548' },
    { name: 'Smartphones & Tech', percent: 28, color: 'bg-fuchsia-500', amount: '$13,628' },
    { name: 'Luxury Watches', percent: 22, color: 'bg-emerald-500', amount: '$10,707' },
    { name: 'Fashion & Bags', percent: 16, color: 'bg-amber-500', amount: '$7,787' },
  ];

  return (
    <div className="min-h-screen">
      <Header title="Analytics & Intelligence" subtitle="Performance metrics, conversion funnels, and revenue channel breakdown." />

      <div className="p-8 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5">
            <p className="text-sm text-slate-400 font-medium">Conversion Rate</p>
            <h3 className="text-2xl font-bold text-white mt-1">3.82%</h3>
            <span className="text-xs text-emerald-400 mt-1 inline-flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +0.6% vs last week
            </span>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5">
            <p className="text-sm text-slate-400 font-medium">Average Order Value (AOV)</p>
            <h3 className="text-2xl font-bold text-white mt-1">$342.80</h3>
            <span className="text-xs text-emerald-400 mt-1 inline-flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +$24.10 from last month
            </span>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5">
            <p className="text-sm text-slate-400 font-medium">Razorpay Success Rate</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">99.4%</h3>
            <span className="text-xs text-slate-400 mt-1 inline-block">0.6% dropped checkouts</span>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5">
            <p className="text-sm text-slate-400 font-medium">Cart Abandonment</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">21.8%</h3>
            <span className="text-xs text-emerald-400 mt-1 inline-block">-4.2% below industry avg</span>
          </div>
        </div>

        {/* Channels & Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Performance */}
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-400" />
              Acquisition Channels
            </h3>
            <div className="space-y-4">
              {topChannels.map((c, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{c.channel}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>Share: {c.share}%</span>
                      <span className="text-emerald-400 font-medium">{c.growth}</span>
                    </div>
                  </div>
                  <span className="text-base font-bold text-white">{c.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Share */}
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-fuchsia-400" />
              Category Revenue Share
            </h3>
            <div className="space-y-5">
              {categoryBreakdown.map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">{cat.name}</span>
                    <span className="font-bold text-white">{cat.amount} ({cat.percent}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Razorpay Payment Methods Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-center">
              <p className="text-xs text-slate-400">UPI / QR (Google Pay, PhonePe)</p>
              <h4 className="text-2xl font-bold text-white mt-1">68.2%</h4>
              <p className="text-xs text-emerald-400 mt-1">Instant settlements</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-center">
              <p className="text-xs text-slate-400">Credit / Debit Cards</p>
              <h4 className="text-2xl font-bold text-white mt-1">24.5%</h4>
              <p className="text-xs text-slate-400 mt-1">Visa, Mastercard, RuPay</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-center">
              <p className="text-xs text-slate-400">NetBanking & Wallets</p>
              <h4 className="text-2xl font-bold text-white mt-1">7.3%</h4>
              <p className="text-xs text-slate-400 mt-1">All major Indian banks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
