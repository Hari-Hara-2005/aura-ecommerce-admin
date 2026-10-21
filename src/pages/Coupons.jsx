import React, { useState } from 'react';
import Header from '../components/Header';
import { couponService } from '../services/api';
import { Tag, Plus, CheckCircle2, Trash2, X } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState(() => couponService.getCoupons());
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState('');

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: '',
    type: 'percentage',
    minSpend: 999,
    expiresAt: '2026-12-31',
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleToggleStatus = (code) => {
    const updated = couponService.toggleCouponStatus(code);
    setCoupons(updated);
    showToast(`Coupon status changed`);
  };

  const handleDelete = (code) => {
    if (window.confirm(`Delete coupon "${code}"?`)) {
      const updated = couponService.deleteCoupon(code);
      setCoupons(updated);
      showToast(`Coupon ${code} removed`);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) return;

    const couponObj = {
      code: newCoupon.code.toUpperCase().trim(),
      discount: parseFloat(newCoupon.discount),
      type: newCoupon.type,
      minSpend: parseFloat(newCoupon.minSpend) || 0,
      usageCount: 0,
      status: 'active',
      expiresAt: newCoupon.expiresAt,
    };

    const updated = couponService.addCoupon(couponObj);
    setCoupons(updated);
    setShowAddModal(false);
    setNewCoupon({ code: '', discount: '', type: 'percentage', minSpend: 999, expiresAt: '2026-12-31' });
    showToast(`Coupon ${couponObj.code} created!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080C14] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header title="Promotions & Coupons" subtitle="Create discount codes, configure minimum spend limits, and monitor usage." />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium backdrop-blur-md animate-fade-in border border-slate-700/50 dark:border-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage promo codes redeemable during checkout on the Client storefront.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Coupon</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map(coupon => {
            const isActive = coupon.status === 'active';
            return (
              <div
                key={coupon.code}
                className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-violet-500/50 dark:hover:border-violet-500/50 transition-all shadow-xs hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-slate-900 dark:text-white tracking-wider">{coupon.code}</span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}>
                        {coupon.status}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                      {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/40">
                    <Tag className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Minimum Purchase:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">₹{coupon.minSpend}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Times Redeemed:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{coupon.usageCount} times</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expiry Date:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{coupon.expiresAt}</span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                  <button
                    onClick={() => handleToggleStatus(coupon.code)}
                    className="flex-1 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                  >
                    {isActive ? 'Mark Expired' : 'Reactivate'}
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.code)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl relative transition-colors duration-200">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Tag className="w-4 h-4" />
              </div>
              Create Promo Coupon
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Coupon codes are case-insensitive on checkout.</p>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. VIP25"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discount}
                    onChange={e => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                    placeholder="25"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={newCoupon.type}
                    onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="percentage">% Percentage</option>
                    <option value="fixed">₹ Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Min. Order (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.minSpend}
                    onChange={e => setNewCoupon({ ...newCoupon, minSpend: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newCoupon.expiresAt}
                    onChange={e => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/20 transition cursor-pointer"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
