import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAdminAuth, isClerkValid } from '../context/AuthContext';
import { SignIn } from '@clerk/clerk-react';
import { ShieldCheck, Lock, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const { isSignedIn, isAdmin } = useAdminAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (isSignedIn && isAdmin) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080C14] flex flex-col items-center justify-center p-4 text-slate-900 dark:text-slate-100 transition-colors duration-200 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white mb-4 shadow-xl shadow-violet-500/25">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            AURA <span className="font-light text-violet-600 dark:text-violet-400">Admin</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Enterprise Security • Authorized Administrators Only</span>
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl transition-all">
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
                    card: "bg-transparent shadow-none p-0 border-0 text-slate-900 dark:text-white w-full",
                    headerTitle: "text-slate-900 dark:text-white text-lg font-bold text-center",
                    headerSubtitle: "text-slate-500 dark:text-slate-400 text-xs text-center",
                    socialButtonsRoot: "hidden",
                    socialButtons: "hidden",
                    socialButtonsBlockButton: "hidden",
                    socialButtonsIconButton: "hidden",
                    dividerRow: "hidden",
                    dividerText: "hidden",
                    dividerLine: "hidden",
                    formButtonPrimary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold py-3 rounded-xl shadow-lg shadow-violet-500/25 transition",
                    formFieldInput: "bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl focus:ring-2 focus:ring-violet-500 py-2.5",
                    formFieldLabel: "text-slate-700 dark:text-slate-300 text-xs font-semibold",
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
              <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Clerk Configuration Required</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Please set your <code className="text-violet-600 dark:text-violet-400 font-mono">VITE_CLERK_PUBLISHABLE_KEY</code> in the <code className="text-slate-700 dark:text-slate-300">Admin/.env</code> file.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition inline-flex items-center gap-1.5"
          >
            <span>Return to Client Storefront</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
