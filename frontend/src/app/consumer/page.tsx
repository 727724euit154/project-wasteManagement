"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { getStore } from '@/lib/storage';
import { totalCarbonSavedKg, totalEnergySavedKwh, totalWeightKg } from '@/lib/carbonCalc';
import { ShoppingBag, Wind, Zap, Store, ArrowRight, MapPin, Leaf } from 'lucide-react';

export default function ConsumerDashboard() {
  const [purchased, setPurchased] = useState<any[]>([]);

  useEffect(() => {
    setPurchased(getStore<any[]>('purchased_listings', []));
  }, []);

  const weightKg = totalWeightKg(purchased);
  const carbonKg = totalCarbonSavedKg(purchased);
  const energyKwh = totalEnergySavedKwh(purchased);
  const totalSpend = purchased.reduce((s, l) => s + (parseFloat(l.price) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">

        <div className="rounded-3xl p-10 text-white mb-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2040 100%)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <h1 className="text-4xl font-black tracking-tight mb-2 relative z-10">Consumer Dashboard</h1>
          <p className="text-blue-200 text-lg relative z-10">Track your purchases and environmental contributions.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Purchases', value: purchased.length, icon: <ShoppingBag className="h-5 w-5" />, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Total Spend', value: `$${totalSpend.toLocaleString()}`, icon: <Store className="h-5 w-5" />, color: 'text-purple-400', bg: 'rgba(139,92,246,0.1)' },
            { label: 'CO₂ Offset', value: `${(carbonKg / 1000).toFixed(3)} t`, icon: <Wind className="h-5 w-5" />, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Energy Saved', value: `${(energyKwh / 1000).toFixed(2)} MWh`, icon: <Zap className="h-5 w-5" />, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
          ].map(s => (
            <div key={s.label} className="cwi-auth-card rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 rounded-full" style={{ background: s.bg }}><span className={s.color}>{s.icon}</span></div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ESG Impact */}
        {purchased.length > 0 && (
          <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="h-5 w-5 text-emerald-400" />
              <h2 className="font-bold text-white">Your ESG Impact</h2>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-black text-emerald-400">{(weightKg / 1000).toFixed(3)}</div>
                <div className="text-sm text-zinc-500 mt-1">Tonnes from landfill</div>
              </div>
              <div>
                <div className="text-3xl font-black text-blue-400">{carbonKg.toFixed(1)}</div>
                <div className="text-sm text-zinc-500 mt-1">kg CO₂ offset</div>
              </div>
              <div>
                <div className="text-3xl font-black text-amber-400">{energyKwh.toFixed(1)}</div>
                <div className="text-sm text-zinc-500 mt-1">kWh energy saved</div>
              </div>
            </div>
          </div>
        )}

        {/* Browse CTA */}
        <div className="mb-8">
          <Link href="/marketplace" className="cwi-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold group">
            <Store className="h-5 w-5" /> Browse Marketplace
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Purchase History */}
        <h2 className="text-xl font-bold text-white mb-4">Purchase History</h2>
        {purchased.length === 0 ? (
          <div className="cwi-auth-card rounded-2xl border-dashed p-12 text-center">
            <ShoppingBag className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">No purchases yet.</p>
            <Link href="/marketplace" className="text-emerald-400 text-sm font-semibold hover:text-emerald-300 mt-2 inline-block">
              Browse the marketplace →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {purchased.map((l, i) => (
              <div key={i} className="cwi-auth-card rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{l.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500 flex-wrap">
                    {l.weight_kg && <span>{l.weight_kg} kg</span>}
                    {l.materials?.[0]?.type && (
                      <span className="capitalize">{l.materials[0].type}</span>
                    )}
                    {l.delivery_address && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />{l.delivery_address}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-600 mt-1">
                    {new Date(l.purchased_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-emerald-400 text-lg">${parseFloat(l.price || 0).toLocaleString()}</div>
                  <div className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                    purchased
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
