"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { getStore } from '@/lib/storage';
import { totalCarbonSavedKg, totalWeightKg } from '@/lib/carbonCalc';
import { Box, TrendingUp, Leaf, PlusCircle, Store, Camera, ArrowRight, Package } from 'lucide-react';

export default function ProducerDashboard() {
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    setListings(getStore<any[]>('user_listings', []));
  }, []);

  const sold = listings.filter(l => l.status === 'sold');
  const available = listings.filter(l => l.status === 'available');
  const totalRevenue = sold.reduce((s, l) => s + (parseFloat(l.price) || 0), 0);
  const weightSoldKg = totalWeightKg(sold);
  const carbonSavedKg = totalCarbonSavedKg(sold);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">

        <div className="rounded-3xl p-10 text-white mb-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <h1 className="text-4xl font-black tracking-tight mb-2 relative z-10">Producer Dashboard</h1>
          <p className="text-emerald-200 text-lg relative z-10">Manage your waste listings and track environmental impact.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Listings', value: available.length, icon: <Box className="h-5 w-5" />, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: <TrendingUp className="h-5 w-5" />, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Weight Sold', value: `${(weightSoldKg / 1000).toFixed(2)} t`, icon: <Package className="h-5 w-5" />, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
            { label: 'CO₂ Saved', value: `${(carbonSavedKg / 1000).toFixed(2)} t`, icon: <Leaf className="h-5 w-5" />, color: 'text-teal-400', bg: 'rgba(20,184,166,0.1)' },
          ].map(s => (
            <div key={s.label} className="cwi-auth-card rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 rounded-full" style={{ background: s.bg }}>
                <span className={s.color}>{s.icon}</span>
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link href="/scan-waste" className="group cwi-card p-6 rounded-2xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Camera className="h-6 w-6 mb-3 text-emerald-400" />
            <h3 className="font-bold text-lg text-white flex justify-between items-center">Scan Waste <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition-transform" /></h3>
            <p className="text-zinc-500 text-sm mt-1">AI-classify materials from site photos.</p>
          </Link>
          <Link href="/create-listing" className="group cwi-card p-6 rounded-2xl">
            <PlusCircle className="h-6 w-6 mb-3 text-zinc-400" />
            <h3 className="font-bold text-lg text-white flex justify-between items-center">New Listing <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform" /></h3>
            <p className="text-zinc-500 text-sm mt-1">Post materials to the marketplace.</p>
          </Link>
          <Link href="/marketplace" className="group cwi-card p-6 rounded-2xl">
            <Store className="h-6 w-6 mb-3 text-zinc-400" />
            <h3 className="font-bold text-lg text-white flex justify-between items-center">Marketplace <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:translate-x-1 transition-transform" /></h3>
            <p className="text-zinc-500 text-sm mt-1">View all available resources.</p>
          </Link>
        </div>

        <h2 className="text-xl font-bold text-white mb-4">My Listings</h2>
        {listings.length === 0 ? (
          <div className="cwi-auth-card rounded-2xl border-dashed p-12 text-center">
            <Box className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">No listings yet. Create your first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(l => (
              <div key={l.id} className="cwi-card rounded-2xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-sm leading-tight">{l.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.status === 'available' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-zinc-500'}`}>{l.status}</span>
                </div>
                <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{l.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-emerald-400">${parseFloat(l.price || 0).toLocaleString()}</span>
                  <span className="text-zinc-600">{l.weight_kg ? `${l.weight_kg} kg` : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
