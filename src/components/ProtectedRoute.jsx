import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AuthContext';
import { Sparkles, ShieldAlert, LogOut, CheckCircle2, UserCheck } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded, isAdmin, user, signOut, addAuthorizedAdminEmail } = useAdminAuth();
  const location = useLocation();
  const [authorizedSuccess, setAuthorizedSuccess] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center text-neutral-800">
        <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-neutral-600">Verifying Admin Clearance...</p>
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 text-black">
        <div className="w-full max-w-md bg-white border border-neutral-300 rounded-lg p-8 text-center shadow-lg">
          <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-300 text-black flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-black tracking-tight">Access Denied (403)</h2>
          <p className="text-xs text-neutral-600 font-semibold uppercase tracking-wider mt-1">Administrator Privileges Required</p>

          <div className="my-5 p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-left space-y-1.5">
            <span className="text-[11px] text-neutral-500 font-medium">Signed in account:</span>
            <p className="text-sm font-bold text-black font-mono break-all">{userEmail}</p>
            <p className="text-[11px] text-neutral-500 pt-1 leading-relaxed">
              This account is not on the authorized administrator allowlist. Self-registration is disabled for security.
            </p>
          </div>

          <div className="space-y-3">
            {authorizedSuccess ? (
              <div className="p-3 bg-neutral-100 border border-neutral-300 text-black rounded-lg text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Admin privileges granted! Loading dashboard...</span>
              </div>
            ) : (
              <button
                onClick={handleGrantAccess}
                className="w-full py-2.5 px-4 bg-black hover:bg-neutral-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Authorize This Email as Administrator</span>
              </button>
            )}

            <button
              onClick={signOut}
              className="w-full py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-800 font-medium rounded-lg text-xs border border-neutral-300 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out & Try Another Account</span>
            </button>
          </div>

          <p className="text-[10px] text-neutral-400 mt-5">
            You can also add this email to <code className="text-neutral-800 font-mono">VITE_ADMIN_EMAILS</code> in <code className="text-neutral-800 font-mono">Admin/.env</code>.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
