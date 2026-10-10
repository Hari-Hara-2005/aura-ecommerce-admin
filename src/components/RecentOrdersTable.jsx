import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { ArrowUpRight, Clock, CheckCircle2, Truck, XCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../utils/format';

const statusConfig = {
  Confirmed: { color: 'text-blue-700 bg-blue-50 border-blue-200', icon: CheckCircle2 },
  Processing: { color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
  Shipped: { color: 'text-violet-700 bg-violet-50 border-violet-200', icon: Truck },
  Delivered: { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  Cancelled: { color: 'text-rose-700 bg-rose-50 border-rose-200', icon: XCircle },
};

export default function RecentOrdersTable({ limit = 5 }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    orderService.getOrders().then((res) => {
      setOrders(Array.isArray(res) ? res.slice(0, limit) : []);
    }).catch(() => {});
  }, [limit]);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">Recent Orders</h3>
        <Link to="/orders" className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 transition font-semibold">
          View all <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-6 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">Order ID</th>
              <th className="text-left px-6 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">Customer</th>
              <th className="text-left px-6 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">Items</th>
              <th className="text-left px-6 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">Total</th>
              <th className="text-left px-6 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const cfg = statusConfig[order.status] || statusConfig.Processing;
              const Icon = cfg.icon;
              return (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition cursor-pointer">
                  <td className="px-6 py-4 font-mono text-xs text-violet-600 font-medium truncate max-w-[130px]">{order.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900 font-medium text-sm">
                      {order.customer?.name || `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || order.customer_name || 'Customer'}
                    </p>
                    <p className="text-slate-500 text-xs">{order.customer?.email || order.customer_email || 'Verified Order'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700 font-medium">
                        {(order.items || []).reduce((a, i) => a + (Number(i.quantity) || 1), 0)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900 font-mono">{formatINR(order.pricing?.total || order.total_amount || 0)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" /> {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
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
