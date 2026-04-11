"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserCtx {
  role: string;
  email: string;
  setUser: (role: string, email: string) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserCtx>({ role: '', email: '', setUser: () => {}, clearUser: () => {} });

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Read once on mount — never overwrite from navigation
    setRole(localStorage.getItem('user_role') || '');
    setEmail(localStorage.getItem('user_email') || '');
  }, []);

  const setUser = (r: string, e: string) => {
    localStorage.setItem('user_role', r);
    localStorage.setItem('user_email', e);
    setRole(r);
    setEmail(e);
  };

  const clearUser = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
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
