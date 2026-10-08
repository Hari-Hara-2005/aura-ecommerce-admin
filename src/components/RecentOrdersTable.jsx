import React from 'react';
import { getMockOrders } from '../services/api';
import { ArrowUpRight, Clock, CheckCircle2, Truck, XCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusConfig = {
  Confirmed: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: CheckCircle2 },
  Processing: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock },
  Shipped: { color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', icon: Truck },
  Delivered: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  Cancelled: { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: XCircle },
};

export default function RecentOrdersTable({ limit = 5 }) {
  const orders = getMockOrders().slice(0, limit);

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/40">
        <h3 className="text-base font-semibold text-white">Recent Orders</h3>
        <Link to="/orders" className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition font-medium">
          View all <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/30">
              <th className="text-left px-6 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Order ID</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Customer</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Items</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Total</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-slate-500 font-medium text-xs uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const cfg = statusConfig[order.status] || statusConfig.Processing;
              const Icon = cfg.icon;
              return (
                <tr key={order.id} className="border-b border-slate-800/20 hover:bg-slate-800/20 transition cursor-pointer">
                  <td className="px-6 py-4 font-mono text-xs text-violet-400">{order.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium text-sm">{order.customer.firstName} {order.customer.lastName}</p>
                    <p className="text-slate-500 text-xs">{order.customer.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-300">{order.items.reduce((a, i) => a + i.quantity, 0)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">${order.pricing.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${cfg.color}`}>
                      <Icon className="w-3.5 h-3.5" /> {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">No orders yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
