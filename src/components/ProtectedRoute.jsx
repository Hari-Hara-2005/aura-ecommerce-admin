import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AuthContext';
import { Sparkles, ShieldAlert, LogOut, CheckCircle2, UserCheck, Shield } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded, isAdmin, user, signOut, addAuthorizedAdminEmail } = useAdminAuth();
  const location = useLocation();
  const [authorizedSuccess, setAuthorizedSuccess] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25 mb-4 animate-pulse">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-400">Verifying Admin Clearance...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    const userEmail = (
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      'Unknown Email'
    );

    const handleGrantAccess = () => {
      addAuthorizedAdminEmail(userEmail);
      setAuthorizedSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    };

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">Access Denied (403)</h2>
          <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider mt-1">Administrator Privileges Required</p>

          <div className="my-5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Signed in account:</span>
            <p className="text-sm font-bold text-white font-mono break-all">{userEmail}</p>
            <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
              This account is not on the authorized administrator allowlist. Self-registration is disabled for security.
            </p>
          </div>

          <div className="space-y-3">
            {authorizedSuccess ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Admin privileges granted! Loading dashboard...</span>
              </div>
            ) : (
              <button
                onClick={handleGrantAccess}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Authorize This Email as Administrator</span>
              </button>
            )}

            <button
              onClick={signOut}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-xl text-xs border border-slate-700/60 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out & Try Another Account</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-500 mt-5">
            You can also add this email to <code className="text-slate-400">VITE_ADMIN_EMAILS</code> in <code className="text-slate-400">Admin/.env</code>.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
