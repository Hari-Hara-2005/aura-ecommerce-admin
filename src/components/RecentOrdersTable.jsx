import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { ArrowUpRight, Clock, CheckCircle2, Truck, XCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../utils/format';

const statusConfig = {
  Confirmed: { color: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/15 border-sky-200 dark:border-sky-500/30', icon: CheckCircle2 },
  Processing: { color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/30', icon: Clock },
  Shipped: { color: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/30', icon: Truck },
  Delivered: { color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30', icon: CheckCircle2 },
  Cancelled: { color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/15 border-rose-200 dark:border-rose-500/30 line-through', icon: XCircle },
};

export default function RecentOrdersTable({ limit = 5 }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    orderService.getOrders().then((res) => {
      setOrders(Array.isArray(res) ? res.slice(0, limit) : []);
    }).catch(() => {});
  }, [limit]);

  return (
    <div className="bg-white dark:bg-[#0D1322]/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Recent Orders</h3>
        <Link to="/orders" className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
          View all <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/60">
              <th className="text-left px-6 py-3 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Order ID</th>
              <th className="text-left px-6 py-3 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Customer</th>
              <th className="text-left px-6 py-3 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Items</th>
              <th className="text-left px-6 py-3 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Total</th>
              <th className="text-left px-6 py-3 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const cfg = statusConfig[order.status] || statusConfig.Processing;
              const Icon = cfg.icon;
              return (
                <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer">
                  <td className="px-6 py-4 font-mono text-xs text-slate-900 dark:text-white font-semibold truncate max-w-[130px]">{order.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900 dark:text-white font-medium text-sm">
                      {order.customer?.name || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || order.customer_name || 'Customer'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">{order.customer?.email || order.customer_email || 'Verified Order'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {(order.items || []).reduce((a, i) => a + (Number(i.quantity) || 1), 0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white font-mono">{formatINR(order.pricing?.total || order.total_amount || 0)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" /> {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                    {new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">No orders yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
