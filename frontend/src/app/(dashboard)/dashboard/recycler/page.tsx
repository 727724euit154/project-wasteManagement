"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStore, setStore } from '@/lib/storage';
import { totalCarbonSavedKg, totalEnergySavedKwh, totalWeightKg, getWeightKg, detectMaterialKey, EMISSION_FACTORS } from '@/lib/carbonCalc';
import { ArrowRight, Package, TrendingUp, Leaf, Zap, Store, Settings, CheckCircle, Clock, BarChart3, Wind, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6'];

const DEFAULT_FACILITY = {
  name: '',
  capacity_tons: 100,
  accepted_materials: ['concrete', 'metal', 'wood', 'glass', 'plastic'],
  service_radius_km: 50,
};

export default function RecyclerDashboard() {
  const [purchased, setPurchased] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [facility, setFacility] = useState(DEFAULT_FACILITY);
  const [facilityForm, setFacilityForm] = useState(DEFAULT_FACILITY);

  useEffect(() => {
    const p = getStore<any[]>('purchased_listings', []);
    setPurchased(p);
    const all: any[] = JSON.parse(localStorage.getItem('all_listings') || '[]');
    setAvailable(all.filter(l => l.status === 'available'));
    const saved = getStore<typeof DEFAULT_FACILITY>('recycler_facility', DEFAULT_FACILITY);
    setFacility(saved);
    setFacilityForm(saved);
  }, []);

  // ── Calculated metrics ──────────────────────────────────
  const totalWeightReceived = totalWeightKg(purchased);
  const totalCO2 = totalCarbonSavedKg(purchased);
  const totalEnergy = totalEnergySavedKwh(purchased);
  const totalSpend = purchased.reduce((s, l) => s + (parseFloat(l.price) || 0), 0);
  const capacityUsedPct = facility.capacity_tons > 0
    ? Math.min((totalWeightReceived / 1000 / facility.capacity_tons) * 100, 100)
    : 0;

  // Material breakdown by weight
  const materialBreakdown: Record<string, number> = {};
  purchased.forEach(l => {
    const mat = l.materials?.[0]?.type ?? detectMaterialKey(l);
    const w = getWeightKg(l);
    if (w > 0) materialBreakdown[mat] = (materialBreakdown[mat] || 0) + w;
  });
  const breakdownChart = Object.entries(materialBreakdown)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);

  // CO2 saved per material
  const co2Chart = Object.entries(materialBreakdown).map(([mat, wKg]) => ({
    name: mat.charAt(0).toUpperCase() + mat.slice(1),
    co2: parseFloat((wKg * (EMISSION_FACTORS[mat] ?? 0.159)).toFixed(1)),
  })).sort((a, b) => b.co2 - a.co2);

  // Circularity score: based on variety of materials + weight processed
  const materialVariety = Object.keys(materialBreakdown).length;
  const circularityScore = Math.min(
    Math.round((materialVariety / 6) * 40 + Math.min(totalWeightReceived / 10000, 1) * 40 + (purchased.length > 0 ? 20 : 0)),
    100
  );

  // Listings matching accepted materials
  const matchingListings = available.filter(l => {
    const mat = l.materials?.[0]?.type?.toLowerCase() ?? detectMaterialKey(l);
    return facility.accepted_materials.some(m => mat.includes(m));
  });

  const saveFacility = () => {
    setFacility(facilityForm);
    setStore('recycler_facility', facilityForm);
    setShowSettings(false);
  };

  const toggleMaterial = (mat: string) => {
    const current = facilityForm.accepted_materials;
    setFacilityForm({
      ...facilityForm,
      accepted_materials: current.includes(mat) ? current.filter(m => m !== mat) : [...current, mat],
    });
  };

  const ALL_MATERIALS = ['concrete', 'metal', 'steel', 'wood', 'glass', 'plastic', 'brick', 'asphalt', 'gypsum', 'ceramic', 'rubber', 'insulation'];

  return (
    <div className="space-y-8 pb-12">

      {/* Facility Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="cwi-auth-card w-full max-w-lg rounded-3xl p-8 relative">
            <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button>
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2"><Settings className="h-5 w-5 text-purple-400" /> Facility Configuration</h2>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-1.5 block">Facility Name</label>
                <input value={facilityForm.name} onChange={e => setFacilityForm({ ...facilityForm, name: e.target.value })}
                  placeholder="e.g. Green Recycling Center" className="cwi-input w-full rounded-xl px-4 py-3 text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-1.5 block">Capacity (tonnes)</label>
                  <input type="number" value={facilityForm.capacity_tons}
                    onChange={e => setFacilityForm({ ...facilityForm, capacity_tons: parseFloat(e.target.value) || 0 })}
                    className="cwi-input w-full rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-400 mb-1.5 block">Service Radius (km)</label>
                  <input type="number" value={facilityForm.service_radius_km}
                    onChange={e => setFacilityForm({ ...facilityForm, service_radius_km: parseFloat(e.target.value) || 0 })}
                    className="cwi-input w-full rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-400 mb-2 block">Accepted Materials</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_MATERIALS.map(mat => (
                    <button key={mat} onClick={() => toggleMaterial(mat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${facilityForm.accepted_materials.includes(mat) ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-white/5 text-zinc-500 border border-white/10 hover:border-white/20'}`}>
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={saveFacility} className="cwi-btn-primary w-full py-3 rounded-xl font-bold mt-6">Save Configuration</button>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="rounded-3xl p-10 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2e1065 0%, #1a0533 100%)', border: '1px solid rgba(139,92,246,0.25)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              {facility.name || 'Recycler Hub'}
            </h1>
            <p className="text-purple-200 text-lg max-w-xl">
              Live metrics calculated from actual material weights received. Capacity: {facility.capacity_tons}t · Radius: {facility.service_radius_km}km
            </p>
          </div>
          <button onClick={() => setShowSettings(true)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-purple-300 hover:text-white transition"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <Settings className="h-4 w-4" /> Configure
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Weight Received', value: totalWeightReceived >= 1000 ? `${(totalWeightReceived / 1000).toFixed(2)} t` : `${totalWeightReceived.toFixed(0)} kg`, icon: <Package className="h-5 w-5" />, color: 'text-purple-400', bg: 'rgba(139,92,246,0.1)' },
          { label: 'Total Spend', value: `$${totalSpend.toLocaleString()}`, icon: <TrendingUp className="h-5 w-5" />, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
          { label: 'CO₂ Offset', value: `${(totalCO2 / 1000).toFixed(3)} t`, icon: <Wind className="h-5 w-5" />, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Energy Saved', value: `${(totalEnergy / 1000).toFixed(2)} MWh`, icon: <Zap className="h-5 w-5" />, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
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

      {/* Capacity + Circularity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="cwi-auth-card rounded-2xl p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Package className="h-4 w-4 text-purple-400" /> Capacity Utilisation</h3>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-4xl font-black text-white">{capacityUsedPct.toFixed(1)}%</span>
            <span className="text-zinc-500 text-sm mb-1">of {facility.capacity_tons}t capacity</span>
          </div>
          <div className="w-full rounded-full h-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${capacityUsedPct}%`, background: capacityUsedPct > 80 ? '#ef4444' : capacityUsedPct > 60 ? '#f59e0b' : '#10b981' }} />
          </div>
          <div className="flex justify-between text-xs text-zinc-600 mt-2">
            <span>{(totalWeightReceived / 1000).toFixed(2)}t received</span>
            <span>{(facility.capacity_tons - totalWeightReceived / 1000).toFixed(2)}t remaining</span>
          </div>
        </div>

        <div className="cwi-auth-card rounded-2xl p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Leaf className="h-4 w-4 text-emerald-400" /> Circularity Score</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={circularityScore > 70 ? '#10b981' : circularityScore > 40 ? '#f59e0b' : '#8b5cf6'}
                  strokeWidth="3" strokeDasharray={`${circularityScore} 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-white">{circularityScore}</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>{Object.keys(materialBreakdown).length} material types processed</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>{purchased.length} total orders received</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>{(totalCO2 / 1000).toFixed(3)}t CO₂ diverted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {breakdownChart.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="cwi-auth-card rounded-2xl p-6">
            <h3 className="font-bold text-white mb-1 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-400" /> Material Weight Received (kg)</h3>
            <p className="text-xs text-zinc-600 mb-5">Actual kg processed per material type</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownChart}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} unit="kg" />
                  <Tooltip contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', color: '#f0f0f5' }}
                    formatter={(v: any) => [`${v} kg`, 'Weight']} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {breakdownChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="cwi-auth-card rounded-2xl p-6">
            <h3 className="font-bold text-white mb-1 flex items-center gap-2"><Wind className="h-4 w-4 text-emerald-400" /> CO₂ Saved per Material (kg)</h3>
            <p className="text-xs text-zinc-600 mb-5">Based on IPCC emission factors × weight received</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={co2Chart}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} unit="kg" />
                  <Tooltip contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', color: '#f0f0f5' }}
                    formatter={(v: any) => [`${v} kg CO₂`, 'Saved']} />
                  <Bar dataKey="co2" radius={[6, 6, 0, 0]}>
                    {co2Chart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/recycler/marketplace" className="group cwi-card rounded-2xl p-6 relative overflow-hidden"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <Store className="h-6 w-6 mb-3 text-purple-400" />
          <h3 className="font-bold text-lg text-white flex justify-between items-center">
            Browse Procurement
            <ArrowRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-zinc-500 text-sm mt-1">
            {matchingListings.length} listings match your accepted materials
          </p>
        </Link>
        <button onClick={() => setShowSettings(true)} className="group cwi-card rounded-2xl p-6 text-left"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <Settings className="h-6 w-6 mb-3 text-zinc-400" />
          <h3 className="font-bold text-lg text-white flex justify-between items-center">
            Facility Configuration
            <Settings className="h-5 w-5 text-zinc-500 group-hover:rotate-45 transition-transform" />
          </h3>
          <p className="text-zinc-500 text-sm mt-1">Set capacity, accepted materials, service radius</p>
        </button>
      </div>

      {/* Recent Purchases */}
      {purchased.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recent Received Materials</h2>
          <div className="space-y-2">
            {purchased.slice(-5).reverse().map((l, i) => (
              <div key={i} className="cwi-auth-card rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(139,92,246,0.15)' }}>
                    <Package className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{l.title}</p>
                    <p className="text-xs text-zinc-500">
                      {l.weight_kg ? `${l.weight_kg} kg` : '—'} ·{' '}
                      {l.materials?.[0]?.type ?? detectMaterialKey(l)} ·{' '}
                      {new Date(l.purchased_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-emerald-400">${parseFloat(l.price || 0).toLocaleString()}</div>
                  <div className="text-xs text-zinc-600">{(getWeightKg(l) * (EMISSION_FACTORS[detectMaterialKey(l)] ?? 0.159)).toFixed(1)} kg CO₂ saved</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {purchased.length === 0 && (
        <div className="cwi-auth-card rounded-2xl border-dashed p-12 text-center">
          <Package className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">No materials received yet.</p>
          <Link href="/recycler/marketplace" className="text-purple-400 text-sm font-semibold hover:text-purple-300 mt-2 inline-block">Browse available materials →</Link>
        </div>
      )}
    </div>
  );
}
