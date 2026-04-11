"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserCtx {
  role: string;
  email: string;
  setUser: (role: string, email: string) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserCtx>({
  role: '', email: '', setUser: () => {}, clearUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // sessionStorage is tab-isolated — each tab has its own session
    // Falls back to localStorage for backward compat with existing sessions
    const r = sessionStorage.getItem('cwi_role') || localStorage.getItem('user_role') || '';
    const e = sessionStorage.getItem('cwi_email') || localStorage.getItem('user_email') || '';
    if (r) {
      setRole(r);
      // Migrate to sessionStorage so this tab owns its identity
      sessionStorage.setItem('cwi_role', r);
    }
    if (e) {
      setEmail(e);
      sessionStorage.setItem('cwi_email', e);
    }
  }, []);

  const setUser = (r: string, e: string) => {
    // Write to sessionStorage (tab-scoped) only
    sessionStorage.setItem('cwi_role', r);
    sessionStorage.setItem('cwi_email', e);
    // Also write to localStorage so storage.ts scoped keys work correctly
    localStorage.setItem('user_role', r);
    localStorage.setItem('user_email', e);
    setRole(r);
    setEmail(e);
  };

  const clearUser = () => {
    sessionStorage.removeItem('cwi_role');
    sessionStorage.removeItem('cwi_email');
    sessionStorage.removeItem('cwi_token');
    localStorage.removeItem('access_token');
    setRole('');
    setEmail('');
  };

  return (
    <UserContext.Provider value={{ role, email, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
