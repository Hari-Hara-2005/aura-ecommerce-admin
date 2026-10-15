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
      to: '/analytics',
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      key: 'orders',
      label: 'Total Orders',
      value: stats.totalOrders.toLocaleString('en-IN'),
      subtitle: 'Live database orders',
      icon: ShoppingCart,
      to: '/orders',
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/20',
      tagColor: 'text-violet-700 bg-violet-50 border-violet-200',
    },
    {
      key: 'customers',
      label: 'Registered Customers',
      value: stats.totalCustomers.toLocaleString('en-IN'),
      subtitle: 'Verified user accounts',
      icon: Users,
      to: '/users',
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
      tagColor: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      key: 'products',
      label: 'Products Listed',
      value: stats.totalProducts.toLocaleString('en-IN'),
      subtitle: 'Active inventory items',
      icon: Package,
      to: '/products',
      gradient: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/20',
      tagColor: 'text-rose-700 bg-rose-50 border-rose-200',
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
            className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 block cursor-pointer"
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">{card.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                  {stats.loading ? '—' : card.value}
                </h3>
                <div className="mt-2 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${card.tagColor}`}>
                    Live
                  </span>
                  <span>{card.subtitle}</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} ${card.shadow} shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
