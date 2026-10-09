import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User } from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';

export default function Header({ title, subtitle }) {
  const { user, isSignedIn, signOut, loginDemo, isClerkEnabled } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/60 backdrop-blur-xl border-b border-slate-800/40 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search everything…"
              className="w-64 pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/40 rounded-xl text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition"
            />
          </div>

          <button className="relative p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 hover:bg-slate-700/60 transition">
            <Bell className="w-4 h-4 text-slate-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-slate-950"></span>
          </button>

          {isSignedIn ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800/60">
              <img
                src={user?.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=40&q=80'}
                alt="Admin"
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-violet-500/30"
              />
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-white leading-tight">
                  {user?.firstName || 'Admin'} {user?.lastName || ''}
                </p>
                <p className="text-[11px] text-slate-500">
                  {user?.primaryEmailAddress?.emailAddress || 'admin@aura-luxe.com'}
                </p>
              </div>
              <button onClick={handleSignOut} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition cursor-pointer" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={loginDemo}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-violet-500/25 transition"
            >
              <User className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
