import React, { useState } from 'react';
import Header from '../components/Header';
import { couponService } from '../services/api';
import { Tag, Plus, CheckCircle2, XCircle, Trash2, X, Calendar, DollarSign, Percent } from 'lucide-react';

export default function Coupons() {
  const [coupons, setCoupons] = useState(() => couponService.getCoupons());
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState('');

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: '',
    type: 'percentage',
    minSpend: 50,
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
    setNewCoupon({ code: '', discount: '', type: 'percentage', minSpend: 50, expiresAt: '2026-12-31' });
    showToast(`Coupon ${couponObj.code} created!`);
  };

  return (
    <div className="min-h-screen">
      <Header title="Promotions & Coupons" subtitle="Create discount codes, configure minimum spend limits, and monitor usage." />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/90 text-white px-5 py-3 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2 border border-emerald-400/30 text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toast}</span>
        </div>
      )}

      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">Manage promo codes redeemable during checkout on the Client storefront.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 transition cursor-pointer"
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
                className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700/60 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-extrabold text-white tracking-wider">{coupon.code}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {coupon.status}
                      </span>
                    </div>
                    <p className="text-2xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mt-2">
                      {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `$${coupon.discount} OFF`}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                    <Tag className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Minimum Purchase:</span>
                    <span className="text-slate-200 font-semibold">${coupon.minSpend}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Times Redeemed:</span>
                    <span className="text-slate-200 font-semibold">{coupon.usageCount} times</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expiry Date:</span>
                    <span className="text-slate-200 font-semibold">{coupon.expiresAt}</span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleToggleStatus(coupon.code)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      isActive
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    {isActive ? 'Mark Expired' : 'Reactivate'}
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.code)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Tag className="w-5 h-5 text-violet-400" />
              Create Promo Coupon
            </h3>
            <p className="text-xs text-slate-400 mb-6">Coupon codes are case-insensitive on checkout.</p>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. VIP25"
                  className="w-full px-3.5 py-2 bg-slate-800/70 border border-slate-700/60 rounded-xl text-sm text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discount}
                    onChange={e => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                    placeholder="25"
                    className="w-full px-3.5 py-2 bg-slate-800/70 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                  <select
                    value={newCoupon.type}
                    onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800/70 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="percentage">% Percentage</option>
                    <option value="fixed">$ Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Min. Order ($)</label>
                  <input
                    type="number"
                    value={newCoupon.minSpend}
                    onChange={e => setNewCoupon({ ...newCoupon, minSpend: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800/70 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newCoupon.expiresAt}
                    onChange={e => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800/70 border border-slate-700/60 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-violet-500/25 transition cursor-pointer"
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
