"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/UserContext';
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

const ROLE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  producer:   { bg: 'rgba(16,185,129,0.12)',  color: '#34d399', border: 'rgba(16,185,129,0.25)' },
  contractor: { bg: 'rgba(16,185,129,0.12)',  color: '#34d399', border: 'rgba(16,185,129,0.25)' },
  consumer:   { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  buyer:      { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  driver:     { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  logistics:  { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  recycler:   { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
};

export default function Navbar() {
  const router = useRouter();
  const { role, email, clearUser } = useUser();

  const handleLogout = () => {
    clearUser();
    router.push('/');
  };

  const home = ROLE_HOME[role] ?? '/';
  const badge = ROLE_COLORS[role];
  const isProducer = role === 'producer' || role === 'contractor';
  const isConsumer = role === 'consumer' || role === 'buyer';
  const isDriver   = role === 'driver'   || role === 'logistics';
  const isRecycler = role === 'recycler';

  return (
    <nav className="cwi-nav fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4">
      <Link href={home} className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Recycle className="h-4 w-4 text-white" />
        </div>
        <span className="font-black text-lg text-white tracking-tight">CWI</span>
        {role && badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
            style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
            {ROLE_LABEL[role] ?? role}
          </span>
        )}
      </Link>

      <div className="flex items-center gap-5">
        <Link href="/marketplace" className="text-sm font-medium text-zinc-400 hover:text-white transition">
          Marketplace
        </Link>
        {isProducer && (
          <>
            <Link href="/create-listing" className="text-sm font-medium text-zinc-400 hover:text-white transition">New Listing</Link>
            <Link href="/dashboard/impact" className="text-sm font-medium text-zinc-400 hover:text-white transition">ESG</Link>
          </>
        )}
        {isConsumer && (
          <Link href="/consumer" className="text-sm font-medium text-zinc-400 hover:text-white transition">My Purchases</Link>
        )}
        {isDriver && (
          <Link href="/driver" className="text-sm font-medium text-zinc-400 hover:text-white transition">My Jobs</Link>
        )}
        {isRecycler && (
          <Link href="/recycler/marketplace" className="text-sm font-medium text-zinc-400 hover:text-white transition">Procurement</Link>
        )}
        {email && <span className="text-xs text-zinc-600 hidden md:block">{email}</span>}
        <button onClick={handleLogout} className="cwi-btn-primary px-4 py-2 rounded-full text-sm font-semibold">
          Log Out
        </button>
      </div>
    </nav>
  );
}
