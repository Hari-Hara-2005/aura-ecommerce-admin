import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import { orderService } from '../services/api';
import {
  ShoppingCart, Search, Filter, CheckCircle2, Clock, Truck,
  XCircle, Eye, Package, User, MapPin, CreditCard, DollarSign,
  ArrowUpRight, X, Calendar, Download, AlertCircle, RefreshCw
} from 'lucide-react';

const statusConfig = {
  Confirmed: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: CheckCircle2, label: 'Confirmed' },
  Processing: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Clock, label: 'Processing' },
  Shipped: { color: 'text-violet-400 bg-violet-500/10 border-violet-500/20', icon: Truck, label: 'Shipped' },
  Delivered: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, label: 'Delivered' },
  Cancelled: { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: XCircle, label: 'Cancelled' },
};

export default function Orders() {
  const [orders, setOrders] = useState(() => orderService.getOrders());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleRefresh = () => {
    const refreshed = orderService.getOrders();
    setOrders(refreshed);
    showToast('Orders refreshed from storage');
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        o.id?.toLowerCase().includes(q) ||
        o.customer?.firstName?.toLowerCase().includes(q) ||
        o.customer?.lastName?.toLowerCase().includes(q) ||
        o.customer?.email?.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const totalOrders = orders.length;
  const processingCount = orders.filter(o => o.status === 'Processing' || o.status === 'Confirmed').length;
  const shippedCount = orders.filter(o => o.status === 'Shipped').length;
  const grossRevenue = orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  const handleStatusChange = (orderId, newStatus) => {
    const updated = orderService.updateOrderStatus(orderId, newStatus);
    setOrders(updated);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(updated.find(o => o.id === orderId));
    }
    showToast(`Order ${orderId} status updated to ${newStatus}`);
  };

  return (
    <div className="min-h-screen">
      <Header title="Orders Management" subtitle="Track live client orders, Razorpay transactions, and fulfillment stages." />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/90 text-white px-5 py-3 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2 border border-emerald-400/30 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toast}</span>
        </div>
      )}

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Total Orders Placed</p>
                <h3 className="text-2xl font-bold text-white mt-1">{totalOrders}</h3>
                <span className="text-xs text-slate-500 mt-1 inline-block">Client checkouts</span>
              </div>
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">To Fulfill / Processing</p>
                <h3 className="text-2xl font-bold text-amber-400 mt-1">{processingCount}</h3>
                <span className="text-xs text-slate-500 mt-1 inline-block">Needs warehouse packing</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">In Transit / Shipped</p>
                <h3 className="text-2xl font-bold text-violet-400 mt-1">{shippedCount}</h3>
                <span className="text-xs text-slate-500 mt-1 inline-block">On courier route</span>
              </div>
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Truck className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">Gross Sales Volume</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">${grossRevenue.toFixed(2)}</h3>
                <span className="text-xs text-slate-500 mt-1 inline-block">Razorpay verified</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by Order ID, customer, email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-800/60 border border-slate-700/50 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="ALL">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-sm font-medium border border-slate-700/60 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Orders</span>
          </button>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/50 bg-slate-900/40">
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Order Reference</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Items Summary</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Payment</th>
                  <th className="text-left px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Fulfillment</th>
                  <th className="text-right px-6 py-3.5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filteredOrders.map(order => {
                  const cfg = statusConfig[order.status] || statusConfig.Processing;
                  const Icon = cfg.icon;
                  const itemCount = order.items?.reduce((a, b) => a + (b.quantity || 1), 0) || 1;

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-violet-400 block">{order.id}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          {new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-white font-medium text-sm">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </p>
                        <p className="text-slate-500 text-xs">{order.customer?.email}</p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            {order.items?.slice(0, 3).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=40&q=80'}
                                alt=""
                                className="inline-block h-7 w-7 rounded-lg ring-2 ring-slate-900 object-cover bg-slate-800"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-400">{itemCount} item{itemCount > 1 ? 's' : ''}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-white font-semibold text-sm">
                          ${order.pricing?.total?.toFixed(2) || '0.00'}
                        </span>
                        {order.pricing?.discountAmount > 0 && (
                          <span className="text-[10px] text-emerald-400 block">
                            Saved ${order.pricing.discountAmount.toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          {order.payment?.status || 'PAID'}
                        </span>
                        <span className="block text-[10px] text-slate-500 mt-0.5">{order.payment?.gateway || 'Razorpay'}</span>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${cfg.color}`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-violet-600/20 text-slate-300 hover:text-violet-400 border border-slate-700/40 text-xs font-medium transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-500">
                      No customer orders found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800/60 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold font-mono text-white tracking-tight">{selectedOrder.id}</h3>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold ${
                    statusConfig[selectedOrder.status]?.color || statusConfig.Processing.color
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Change Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-violet-400 font-semibold text-xs uppercase tracking-wider">
                  <User className="w-4 h-4" />
                  <span>Customer & Shipping Address</span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-white">
                    {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">{selectedOrder.customer?.email}</p>
                  <p className="text-slate-400 text-xs">{selectedOrder.customer?.phone || 'No phone recorded'}</p>
                  {selectedOrder.customer?.clerkUserId && (
                    <p className="text-[11px] font-mono text-violet-400 mt-1">
                      Clerk UID: {selectedOrder.customer.clerkUserId}
                    </p>
                  )}
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <p>{selectedOrder.customer?.address || 'Standard Delivery'}</p>
                      <p>{selectedOrder.customer?.city}, {selectedOrder.customer?.state} {selectedOrder.customer?.zip}</p>
                      <p className="font-medium text-slate-200">{selectedOrder.customer?.country || 'India'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  <span>Razorpay Payment Details</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Gateway:</span>
                    <span className="text-white font-medium">{selectedOrder.payment?.gateway || 'Razorpay Direct'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Status:</span>
                    <span className="text-emerald-400 font-bold">{selectedOrder.payment?.status || 'PAID'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="font-mono text-violet-400">{selectedOrder.payment?.paymentId || 'pay_live_verified'}</span>
                  </div>
                  {selectedOrder.payment?.orderId && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Razorpay Order ID:</span>
                      <span className="font-mono text-slate-300">{selectedOrder.payment.orderId}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Timestamp:</span>
                    <span className="text-slate-300">{new Date(selectedOrder.payment?.paidAt || selectedOrder.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Items Purchased ({selectedOrder.items?.length || 1})
              </h4>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-800/20">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=80&q=80'}
                        alt={item.title}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700 bg-slate-800"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-slate-400">Qty: {item.quantity} × ${Number(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white">
                      ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>${selectedOrder.pricing?.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              {selectedOrder.pricing?.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Coupon Discount ({selectedOrder.pricing?.couponCode || 'PROMO'})</span>
                  <span>-${selectedOrder.pricing.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span>{selectedOrder.pricing?.shipping === 0 ? 'FREE' : `$${selectedOrder.pricing?.shipping?.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Taxes (GST)</span>
                <span>${selectedOrder.pricing?.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-700 text-base font-bold text-white">
                <span>Total Amount</span>
                <span className="text-emerald-400 text-lg">${selectedOrder.pricing?.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold transition"
              >
                <Download className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-violet-600/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
