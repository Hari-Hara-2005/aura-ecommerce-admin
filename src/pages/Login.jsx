import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAdminAuth, isClerkValid } from '../context/AuthContext';
import { SignIn } from '@clerk/clerk-react';
import { ShieldCheck, Lock, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export default function Login() {
  const { isSignedIn, isAdmin } = useAdminAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (isSignedIn && isAdmin) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-violet-600/20 to-fuchsia-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-xl shadow-violet-500/25 mb-4 ring-4 ring-slate-900">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            AURA <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Admin Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authorized Administrators Only • Sign In</span>
          </p>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/70 relative">
          {isClerkValid ? (
            <div className="flex flex-col items-center justify-center py-1">
              <SignIn
                signUpUrl={null}
                appearance={{
                  layout: {
                    showOptionalFields: false,
                    socialButtonsPlacement: 'bottom',
                    socialButtonsVariant: 'iconButton',
                  },
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none p-0 border-0 text-white w-full",
                    headerTitle: "text-white text-lg font-bold text-center",
                    headerSubtitle: "text-slate-400 text-xs text-center",
                    socialButtonsRoot: "hidden",
                    socialButtons: "hidden",
                    socialButtonsBlockButton: "hidden",
                    socialButtonsIconButton: "hidden",
                    dividerRow: "hidden",
                    dividerText: "hidden",
                    dividerLine: "hidden",
                    formButtonPrimary: "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-violet-500/25 transition",
                    formFieldInput: "bg-slate-800/80 border border-slate-700/60 text-white text-xs rounded-xl focus:border-violet-500 py-2.5",
                    formFieldLabel: "text-slate-300 text-xs font-medium",
                    footerAction: "hidden",
                    footerActionText: "hidden",
                    footerActionLink: "hidden",
                    footer: "hidden",
                  }
                }}
                fallbackRedirectUrl={from}
              />
            </div>
          ) : (
            <div className="text-center py-6">
              <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">Clerk Configuration Required</h3>
              <p className="text-xs text-slate-400 mt-2">
                Please set your <code className="text-violet-400">VITE_CLERK_PUBLISHABLE_KEY</code> in the <code className="text-slate-300">Admin/.env</code> file.
              </p>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 256-bit Encrypted</span>
            </span>
            <span className="font-mono text-slate-400">AURA-ADMIN-GATE</span>
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1.5"
          >
            <span>Return to Storefront</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
