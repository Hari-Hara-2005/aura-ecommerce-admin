import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LogOut, User } from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';

export default function Header({ title, subtitle }) {
  const { user, isSignedIn, signOut, loginDemo } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#080C14]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 px-8 py-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search console…"
              className="w-64 pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <ThemeToggle />

          <NotificationDropdown />

          {isSignedIn ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <img
                src={user?.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=40&q=80'}
                alt="Admin"
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                  {user?.firstName || 'Admin'} {user?.lastName || ''}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {user?.primaryEmailAddress?.emailAddress || 'admin@aura-luxe.com'}
                </p>
              </div>
              <button 
                onClick={handleSignOut} 
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition cursor-pointer" 
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={loginDemo}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-sm font-medium text-white hover:from-indigo-500 hover:to-violet-500 transition cursor-pointer shadow-md shadow-indigo-600/25"
            >
              <User className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
