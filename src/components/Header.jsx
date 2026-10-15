import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut, User } from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

export default function Header({ title, subtitle }) {
  const { user, isSignedIn, signOut, loginDemo } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search everything…"
              className="w-64 pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition"
            />
          </div>

          <NotificationDropdown />

          {isSignedIn ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <img
                src={user?.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=40&q=80'}
                alt="Admin"
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-violet-500/30"
              />
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {user?.firstName || 'Admin'} {user?.lastName || ''}
                </p>
                <p className="text-[11px] text-slate-500">
                  {user?.primaryEmailAddress?.emailAddress || 'admin@aura-luxe.com'}
                </p>
              </div>
              <button onClick={handleSignOut} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={loginDemo}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-violet-500/25 transition cursor-pointer"
            >
              <User className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
