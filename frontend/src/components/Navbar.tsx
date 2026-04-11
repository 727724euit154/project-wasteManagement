"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Recycle } from 'lucide-react';

const ROLE_HOME: Record<string, string> = {
  producer: '/producer', contractor: '/producer',
  consumer: '/consumer', buyer: '/consumer',
  driver: '/driver', logistics: '/driver',
  recycler: '/dashboard/recycler',
};
const ROLE_LABEL: Record<string, string> = {
  producer: 'Producer', contractor: 'Producer',
  consumer: 'Consumer', buyer: 'Consumer',
  driver: 'Driver', logistics: 'Driver',
  recycler: 'Recycler',
};

export default function Navbar() {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setRole(localStorage.getItem('user_role') || '');
    setEmail(localStorage.getItem('user_email') || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    router.push('/');
  };

  const home = ROLE_HOME[role] ?? '/dashboard';

  return (
    <nav className="cwi-nav fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4">
      <Link href={home} className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Recycle className="h-4 w-4 text-white" />
        </div>
        <span className="font-black text-lg text-white tracking-tight">CWI</span>
        {role && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
            {ROLE_LABEL[role] ?? role}
          </span>
        )}
      </Link>

      <div className="flex items-center gap-5">
        <Link href="/marketplace" className="text-sm font-medium text-zinc-400 hover:text-white transition">Marketplace</Link>
        {(role === 'producer' || role === 'contractor') && (
          <>
            <Link href="/create-listing" className="text-sm font-medium text-zinc-400 hover:text-white transition">New Listing</Link>
            <Link href="/dashboard/impact" className="text-sm font-medium text-zinc-400 hover:text-white transition">ESG</Link>
          </>
        )}
        {(role === 'consumer' || role === 'buyer') && (
          <Link href="/consumer" className="text-sm font-medium text-zinc-400 hover:text-white transition">My Purchases</Link>
        )}
        {(role === 'driver' || role === 'logistics') && (
          <Link href="/driver" className="text-sm font-medium text-zinc-400 hover:text-white transition">My Jobs</Link>
        )}
        {email && <span className="text-xs text-zinc-600 hidden md:block">{email}</span>}
        <button onClick={handleLogout}
          className="cwi-btn-primary px-4 py-2 rounded-full text-sm font-semibold">
          Log Out
        </button>
      </div>
    </nav>
  );
}
