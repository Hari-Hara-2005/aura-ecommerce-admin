import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClerkProvider, useUser, useClerk, SignedIn, SignedOut, UserButton, SignIn } from '@clerk/clerk-react';

const AuthContext = createContext(null);

let rawKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
const match = rawKey.match(/(pk_(?:test|live)_[a-zA-Z0-9$_\-]+)/);
const CLERK_KEY = match ? match[1] : (rawKey.trim().startsWith('pk_') ? rawKey.trim() : '');
const isClerkValid = Boolean(CLERK_KEY);

// Helper to get authorized admin emails
export function getAuthorizedAdminEmails() {
  const envEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  let localEmails = [];
  try {
    const stored = localStorage.getItem('aura_authorized_admin_emails');
    if (stored) {
      localEmails = JSON.parse(stored).map(e => e.trim().toLowerCase());
    }
  } catch {}

  // Combine and deduplicate
  const all = Array.from(new Set([...envEmails, ...localEmails]));
  return all;
}

export function addAuthorizedAdminEmail(email) {
  if (!email || !email.trim()) return;
  const current = getAuthorizedAdminEmails();
  const next = Array.from(new Set([...current, email.trim().toLowerCase()]));
  localStorage.setItem('aura_authorized_admin_emails', JSON.stringify(next));
  return next;
}

export function isUserAdmin(user) {
  if (!user) return false;
  const allowed = getAuthorizedAdminEmails();

  // If no specific admin emails are defined yet, the first logged-in user is treated as admin owner
  if (allowed.length === 0) {
    return true;
  }

  const userEmail = (
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    user.email ||
    ''
  ).toLowerCase().trim();

  return allowed.includes(userEmail);
}

function ClerkBridge({ children }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  const isAdmin = isLoaded && isSignedIn ? isUserAdmin(user) : false;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        isClerkEnabled: true,
        user,
        isSignedIn: Boolean(isSignedIn),
        isAdmin,
        isLoaded,
        signOut: handleSignOut,
        getAuthorizedAdminEmails,
        addAuthorizedAdminEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Fallback provider if no Clerk key is present in environment
function UnconfiguredClerkProvider({ children }) {
  return (
    <AuthContext.Provider
      value={{
        isClerkEnabled: false,
        user: null,
        isSignedIn: false,
        isAdmin: false,
        isLoaded: true,
        signOut: () => {},
        getAuthorizedAdminEmails,
        addAuthorizedAdminEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AdminAuthProvider({ children }) {
  if (isClerkValid) {
    return (
      <ClerkProvider publishableKey={CLERK_KEY}>
        <ClerkBridge>{children}</ClerkBridge>
      </ClerkProvider>
    );
  }
  return <UnconfiguredClerkProvider>{children}</UnconfiguredClerkProvider>;
}

export function useAdminAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return c;
}

export { SignedIn, SignedOut, UserButton, SignIn, isClerkValid, CLERK_KEY };
