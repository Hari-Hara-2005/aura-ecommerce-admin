import React, { useState } from 'react';
import Header from '../components/Header';
import { Shield, CreditCard, Bell, CheckCircle2, Save, Sparkles, Sun, Moon } from 'lucide-react';
import { getAuthorizedAdminEmails, addAuthorizedAdminEmail } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();
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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#080C14] dark:text-slate-100 transition-colors duration-200">
      <Header title="Store Settings" subtitle="Configure theme, payment gateways, authentication, and store parameters." />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toast}</span>
        </div>
      )}

      <div className="p-8 max-w-4xl space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Theme & Appearance Switcher */}
          <div className="bg-white dark:bg-[#0D1322]/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-sm transition-colors duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Theme & Appearance Mode
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize the look and feel of the management console. Choose your preferred theme.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md pt-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Light Mode</div>
                  <div className="text-[11px] text-slate-500">Crisp, clean & bright</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 border border-slate-700">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Sleek luxury obsidian</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0D1322]/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-sm transition-colors duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Store Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Display Currency</label>
                <select
                  value={settings.currency}
                  onChange={e => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Tax / GST Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={e => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0D1322]/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-sm transition-colors duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Razorpay Gateway Credentials
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure your Razorpay API Key ID for instant UPI, Cards, and NetBanking checkout.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Razorpay Key ID</label>
                <input
                  type="text"
                  value={settings.razorpayKeyId}
                  onChange={e => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                  placeholder="rzp_test_..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Test / Sandbox Mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Enables simulated modal transactions without real money charges.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.razorpayTestMode}
                  onChange={e => setSettings({ ...settings, razorpayTestMode: e.target.checked })}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0D1322]/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-sm transition-colors duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Clerk Authentication & Admin Allowlist
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Strict gatekeeping: only manually authorized administrator emails can enter the console.</p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clerk Publishable Key</label>
              <input
                type="text"
                readOnly
                value={settings.clerkPublishableKey}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 font-mono"
              />
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 inline-block">Active and linked via environment (.env)</span>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Designated Administrator Emails</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Any Clerk user logging in with an email NOT on this list is blocked with 403 Forbidden.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="e.g. your-email@gmail.com"
                  value={adminEmailInput}
                  onChange={e => setAdminEmailInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddAdminEmail}
                  className="px-4 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                >
                  Add Admin
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {allowedAdmins.map(email => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-mono font-medium"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdminEmail(email)}
                      className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title="Remove Administrator"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {allowedAdmins.length === 0 && (
                  <p className="text-xs text-slate-500 italic">No emails configured yet. Add your admin email above or in Admin/.env</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0D1322]/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-sm transition-colors duration-200">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Inventory & Order Alerts
            </h3>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Low Stock Threshold Warning</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Triggers an alert on the Products dashboard when stock drops below this number.</p>
              </div>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={e => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                className="w-20 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-center text-slate-900 dark:text-white font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-bold transition cursor-pointer shadow-lg shadow-indigo-600/25"
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
