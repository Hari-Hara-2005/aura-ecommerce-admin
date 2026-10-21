import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, ShoppingCart, Users, Package } from 'lucide-react';
import { orderService, userService, productService } from '../services/api';
import { formatINR } from '../utils/format';

export default function StatsCards() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    loading: true,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [ordersRes, usersRes, productsRes] = await Promise.all([
          orderService.getOrders(),
          userService.getUsers(),
          productService.getProducts(),
        ]);

        const orders = Array.isArray(ordersRes) ? ordersRes : [];
        const users = Array.isArray(usersRes) ? usersRes : [];
        const products = productsRes?.products || (Array.isArray(productsRes) ? productsRes : []);

        const revenue = orders.reduce((sum, o) => {
          if (o.status === 'Cancelled') return sum;
          return sum + Number(o.pricing?.total || o.total_amount || 0);
        }, 0);

        setStats({
          totalRevenue: revenue,
          totalOrders: orders.length,
          totalCustomers: users.length,
          totalProducts: products.length,
          loading: false,
        });
      } catch (err) {
        console.error('Failed to calculate stats from database:', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }

    fetchStats();
  }, []);

  const cards = [
    {
      key: 'revenue',
      label: 'Total Revenue',
      value: formatINR(stats.totalRevenue),
      subtitle: `${stats.totalOrders} recorded orders`,
      icon: IndianRupee,
      color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
      to: '/analytics',
    },
    {
      key: 'orders',
      label: 'Total Orders',
      value: stats.totalOrders.toLocaleString('en-IN'),
      subtitle: 'Live database orders',
      icon: ShoppingCart,
      color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 shadow-indigo-500/10',
      to: '/orders',
    },
    {
      key: 'customers',
      label: 'Registered Customers',
      value: stats.totalCustomers.toLocaleString('en-IN'),
      subtitle: 'Verified user accounts',
      icon: Users,
      color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 shadow-purple-500/10',
      to: '/users',
    },
    {
      key: 'products',
      label: 'Products Listed',
      value: stats.totalProducts.toLocaleString('en-IN'),
      subtitle: 'Active inventory items',
      icon: Package,
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-amber-500/10',
      to: '/products',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.key}
            to={card.to}
            className="group relative bg-white dark:bg-[#0D1322]/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/50 hover:shadow-xl dark:hover:shadow-black/40 transition-all block cursor-pointer backdrop-blur-sm"
          >
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{card.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono tracking-tight">
                  {stats.loading ? '—' : card.value}
                </h3>
                <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </span>
                  <span>{card.subtitle}</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl border shadow-sm ${card.color} group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
