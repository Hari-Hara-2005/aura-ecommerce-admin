import React, { useState } from 'react';
import Header from '../components/Header';
import { Shield, CreditCard, Bell, CheckCircle2, Save, Sparkles } from 'lucide-react';
import { getAuthorizedAdminEmails, addAuthorizedAdminEmail } from '../context/AuthContext';

export default function Settings() {
  const [toast, setToast] = useState('');
  const [allowedAdmins, setAllowedAdmins] = useState(() => getAuthorizedAdminEmails());
  const [adminEmailInput, setAdminEmailInput] = useState('');

  const [settings, setSettings] = useState({
    storeName: 'AURA Luxe Commerce',
    supportEmail: 'support@aura-luxe.in',
    currency: 'INR (₹)',
    taxRate: 18.0,
    clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_...',
    razorpayKeyId: 'rzp_test_placeholder',
    razorpayTestMode: true,
    lowStockThreshold: 10,
    orderEmailAlerts: true,
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleAddAdminEmail = () => {
    if (!adminEmailInput || !adminEmailInput.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    const updated = addAuthorizedAdminEmail(adminEmailInput);
    setAllowedAdmins(updated || getAuthorizedAdminEmails());
    setAdminEmailInput('');
    showToast(`Added ${adminEmailInput} to authorized administrators`);
  };

  const handleRemoveAdminEmail = (email) => {
    const next = allowedAdmins.filter(e => e.toLowerCase() !== email.toLowerCase());
    localStorage.setItem('aura_authorized_admin_emails', JSON.stringify(next));
    setAllowedAdmins(next);
    showToast(`Removed ${email} from authorized administrators`);
  };

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('aura_store_settings', JSON.stringify(settings));
    } catch {}
    showToast('Admin configurations saved successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header title="Store Settings" subtitle="Configure payment gateways, Clerk authentication, and store parameters." />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toast}</span>
        </div>
      )}

      <div className="p-8 max-w-4xl space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              Store Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Display Currency</label>
                <select
                  value={settings.currency}
                  onChange={e => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-violet-500"
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Tax / GST Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={e => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-violet-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Razorpay Gateway Credentials
            </h3>
            <p className="text-xs text-slate-500">Configure your Razorpay API Key ID for instant UPI, Cards, and NetBanking checkout.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  value={settings.razorpayKeyId}
                  onChange={e => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                  placeholder="rzp_test_..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-violet-500"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Test / Sandbox Mode</p>
                  <p className="text-xs text-slate-500">Enables simulated modal transactions without real money charges.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.razorpayTestMode}
                  onChange={e => setSettings({ ...settings, razorpayTestMode: e.target.checked })}
                  className="w-5 h-5 accent-violet-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-600" />
              Clerk Authentication & Admin Allowlist
            </h3>
            <p className="text-xs text-slate-500">Strict gatekeeping: only manually authorized administrator emails can enter the console.</p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clerk Publishable Key</label>
              <input
                type="text"
                readOnly
                value={settings.clerkPublishableKey}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono"
              />
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Active and linked via environment (.env)</span>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Designated Administrator Emails</h4>
                  <p className="text-xs text-slate-500">Any Clerk user logging in with an email NOT on this list is blocked with 403 Forbidden.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="e.g. your-email@gmail.com"
                  value={adminEmailInput}
                  onChange={e => setAdminEmailInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={handleAddAdminEmail}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Add Admin
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {allowedAdmins.map(email => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-800 font-mono font-medium"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdminEmail(email)}
                      className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Remove Administrator"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {allowedAdmins.length === 0 && (
                  <p className="text-xs text-amber-700 italic">No emails configured yet. Add your admin email above or in Admin/.env</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              Inventory & Order Alerts
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-900">Low Stock Threshold Warning</p>
                <p className="text-xs text-slate-500">Triggers an alert on the Products dashboard when stock drops below this number.</p>
              </div>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={e => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                className="w-20 px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm text-center text-slate-900 font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/25 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
