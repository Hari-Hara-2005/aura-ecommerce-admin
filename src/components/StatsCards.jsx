import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

const cards = [
  { key: 'revenue', label: 'Total Revenue', value: '$48,672', change: '+12.5%', trend: 'up', icon: DollarSign, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
  { key: 'orders', label: 'Total Orders', value: '1,247', change: '+8.2%', trend: 'up', icon: ShoppingCart, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20' },
  { key: 'customers', label: 'Active Customers', value: '834', change: '+23.1%', trend: 'up', icon: Users, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20' },
  { key: 'products', label: 'Products Listed', value: '156', change: '-2.4%', trend: 'down', icon: Package, gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/20' },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map(card => {
        const Icon = card.icon;
        const isUp = card.trend === 'up';
        return (
          <div
            key={card.key}
            className="group relative bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5 hover:border-slate-700/60 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">{card.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{card.value}</h3>
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{card.change}</span>
                  <span className="text-slate-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} ${card.shadow} shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
