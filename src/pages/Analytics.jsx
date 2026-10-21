import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { orderService, categoryService, productService, userService } from '../services/api';
import {
  TrendingUp, PieChart, Globe, CreditCard,
  ShoppingBag, Users, CheckCircle2, Package
} from 'lucide-react';
import { formatINR } from '../utils/format';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    aov: 0,
    activeCustomers: 0,
    paymentMethods: [],
    categoryBreakdown: [],
    statusBreakdown: [],
  });

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const [ordersRes, categoriesRes, productsRes, usersRes] = await Promise.all([
          orderService.getOrders(),
          categoryService.getCategories(),
          productService.getProducts(),
        ]);

        const orders = Array.isArray(ordersRes) ? ordersRes : [];
        const categories = Array.isArray(categoriesRes) ? categoriesRes : [];
        const products = productsRes?.products || (Array.isArray(productsRes) ? productsRes : []);
        const users = Array.isArray(usersRes) ? usersRes : [];

        const validOrders = orders.filter((o) => o.status !== 'Cancelled');
        const revenue = validOrders.reduce(
          (sum, o) => sum + Number(o.pricing?.total || o.total_amount || 0),
          0
        );
        const aov = validOrders.length > 0 ? revenue / validOrders.length : 0;

        const paymentMap = {};
        orders.forEach((o) => {
          const method = o.payment_method || (o.payment?.gateway) || 'Razorpay';
          if (!paymentMap[method]) {
            paymentMap[method] = { count: 0, volume: 0 };
          }
          paymentMap[method].count += 1;
          paymentMap[method].volume += Number(o.pricing?.total || o.total_amount || 0);
        });

        const paymentMethods = Object.keys(paymentMap).map((m) => {
          const count = paymentMap[m].count;
          const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
          return {
            name: m,
            count,
            volume: paymentMap[m].volume,
            percent: pct,
          };
        });

        const totalProds = products.length;
        const categoryBreakdown = categories.map((cat) => {
          const count = Number(cat.product_count) || products.filter(
            (p) => String(p.category_id) === String(cat.id) || p.category?.toLowerCase() === cat.name?.toLowerCase()
          ).length;
          const pct = totalProds > 0 ? Math.round((count / totalProds) * 100) : 0;
          return {
            name: cat.name,
            count,
            percent: pct,
          };
        });

        const statusMap = { Confirmed: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
        orders.forEach((o) => {
          const st = o.status || 'Confirmed';
          if (statusMap[st] !== undefined) {
            statusMap[st] += 1;
          } else {
            statusMap[st] = 1;
          }
        });

        const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({
          status,
          count,
          percent: orders.length > 0 ? Math.round((count / orders.length) * 100) : 0,
        }));

        setMetrics({
          totalRevenue: revenue,
          totalOrders: orders.length,
          aov,
          activeCustomers: users.length,
          paymentMethods,
          categoryBreakdown,
          statusBreakdown,
        });
      } catch (err) {
        console.error('Failed to load analytics metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080C14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header
        title="Analytics & Intelligence"
        subtitle="Performance metrics, category distribution, and order pipeline from database."
      />

      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Total Realized Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
              {loading ? '—' : formatINR(metrics.totalRevenue)}
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> From {metrics.totalOrders} recorded orders
            </span>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Average Order Value (AOV)</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
              {loading ? '—' : formatINR(metrics.aov)}
            </h3>
            <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
              Per finalized checkout
            </span>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Total Store Orders</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
              {loading ? '—' : metrics.totalOrders.toLocaleString('en-IN')}
            </h3>
            <span className="text-xs text-slate-400 mt-1 inline-block">
              Across all order statuses
            </span>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Registered Customers</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
              {loading ? '—' : metrics.activeCustomers.toLocaleString('en-IN')}
            </h3>
            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium mt-1 inline-block">
              Verified customer records
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <CreditCard className="w-4 h-4" />
              </div>
              Payment Methods Breakdown
            </h3>
            {metrics.paymentMethods.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No orders recorded yet to evaluate payment methods.
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.paymentMethods.map((pm) => (
                  <div
                    key={pm.name}
                    className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{pm.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>Share: {pm.percent}%</span>
                        <span className="text-violet-600 dark:text-violet-400 font-semibold">{pm.count} orders</span>
                      </div>
                    </div>
                    <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                      {formatINR(pm.volume)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <PieChart className="w-4 h-4" />
              </div>
              Database Categories & Inventory Share
            </h3>
            {metrics.categoryBreakdown.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No categories in database yet.
              </div>
            ) : (
              <div className="space-y-5">
                {metrics.categoryBreakdown.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                        {category.name}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {category.count} items ({category.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                        style={{ width: `${Math.max(2, category.percent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
            Order Fulfillment Pipeline Status
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {metrics.statusBreakdown.map((st) => (
              <div
                key={st.status}
                className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-center space-y-1"
              >
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {st.status}
                </span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{st.count}</p>
                <span className="text-[11px] text-slate-400 block">{st.percent}% of total</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
