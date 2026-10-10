import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';
import RevenueChart from '../components/RevenueChart';
import RecentOrdersTable from '../components/RecentOrdersTable';
import { userService, productService, orderService } from '../services/api';
import { ArrowUpRight, Package, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../utils/format';

export default function Dashboard() {
  const [recentUsers, setRecentUsers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          userService.getUsers(),
          productService.getProducts({ limit: 20 }),
          orderService.getOrders(),
        ]);

        const users = Array.isArray(usersRes) ? usersRes : [];
        setRecentUsers(users.slice(0, 6));

        const products = productsRes?.products || (Array.isArray(productsRes) ? productsRes : []);
        const orders = Array.isArray(ordersRes) ? ordersRes : [];

        // Calculate actual product sales from live orders
        const salesMap = {};
        orders.forEach((ord) => {
          if (ord.status === 'Cancelled') return;
          (ord.items || []).forEach((item) => {
            const pId = item.product_id || item.id;
            if (!salesMap[pId]) {
              salesMap[pId] = {
                id: pId,
                name: item.title || item.name || 'Product',
                sales: 0,
                revenue: 0,
                img: item.thumbnail || item.image || '',
              };
            }
            salesMap[pId].sales += Number(item.quantity || 1);
            salesMap[pId].revenue += Number(item.price || 0) * Number(item.quantity || 1);
          });
        });

        const sortedOrderProducts = Object.values(salesMap).sort((a, b) => b.revenue - a.revenue);

        if (sortedOrderProducts.length > 0) {
          setTopProducts(sortedOrderProducts.slice(0, 5));
        } else {
          // If no orders yet, display real products from the catalog
          const fallbackCatalog = products.slice(0, 5).map((p) => ({
            id: p.id,
            name: p.title || p.name,
            sales: p.stock !== undefined ? `${p.stock} in stock` : '0 sold',
            revenue: formatINR(p.price),
            img: p.thumbnail || p.image || '',
          }));
          setTopProducts(fallbackCatalog);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening with your store." />
      <div className="p-8 space-y-6">
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Store Products</h3>
              <Link to="/products" className="text-xs text-violet-600 hover:text-violet-700 transition font-semibold flex items-center gap-1">
                All Products <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No products in database yet.<br />
                  <Link to="/products" className="text-violet-600 font-semibold hover:underline mt-1 inline-block">
                    Add products now
                  </Link>
                </div>
              ) : (
                topProducts.map((p, i) => (
                  <div key={p.id || i} className="flex items-center gap-3 group">
                    <img
                      src={p.img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=64&q=80'}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 bg-slate-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-violet-600 transition">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {typeof p.sales === 'number' ? `${p.sales} units sold` : p.sales}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 font-mono">
                      {typeof p.revenue === 'number' ? formatINR(p.revenue) : p.revenue}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <RecentOrdersTable />

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Recent Customers</h3>
            <Link to="/users" className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 transition font-semibold">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-6">
            {recentUsers.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No customer accounts registered in database yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 transition group">
                    <img
                      src={u.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                      alt={u.name || 'User'}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate group-hover:text-violet-600 transition">
                        {u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Client'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{u.email || u.clerk_user_id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
