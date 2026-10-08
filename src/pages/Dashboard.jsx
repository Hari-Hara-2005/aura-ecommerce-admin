import React from 'react';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';
import RevenueChart from '../components/RevenueChart';
import RecentOrdersTable from '../components/RecentOrdersTable';
import { MOCK_USERS } from '../services/api';
import { ArrowUpRight, Package, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const topProducts = [
  { name: 'Chronos Luminary Watch', sales: 128, revenue: '$114,752', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=64&q=80' },
  { name: 'CyberSphere Headphones', sales: 94, revenue: '$32,899', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=64&q=80' },
  { name: 'Solstice Eau De Parfum', sales: 87, revenue: '$16,095', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=64&q=80' },
  { name: 'Italian Leather Weekender', sales: 63, revenue: '$27,090', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=64&q=80' },
];

export default function Dashboard() {
  const recentUsers = MOCK_USERS.slice(0, 5);

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening with your store." />
      <div className="p-8 space-y-6">
        {/* Stats */}
        <StatsCards />

        {/* Charts & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Top Products</h3>
              <Link to="/products" className="text-xs text-violet-400 hover:text-violet-300 transition font-medium flex items-center gap-1">
                All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <img src={p.img} alt={p.name} className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700/50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.sales} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">{p.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <RecentOrdersTable />

        {/* Recent Customers */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/40">
            <h3 className="text-base font-semibold text-white">Recent Customers</h3>
            <Link to="/users" className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition font-medium">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-800/30 hover:border-slate-700/50 bg-slate-800/20 hover:bg-slate-800/40 transition group">
                <img src={u.imageUrl} alt={u.firstName} className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700/30" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                {u.role === 'vip' && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                    <Star className="w-3 h-3" /> VIP
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
