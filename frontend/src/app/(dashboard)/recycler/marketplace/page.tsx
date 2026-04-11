"use client";
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getStore } from '@/lib/storage';
import { detectMaterialKey, EMISSION_FACTORS } from '@/lib/carbonCalc';
import { Search, Package, MapPin, Filter, ArrowRight, Leaf } from 'lucide-react';

const MATERIAL_OPTIONS = ['All', 'Concrete', 'Metal', 'Steel', 'Wood', 'Glass', 'Plastic', 'Brick', 'Asphalt', 'Gypsum', 'Ceramic', 'Rubber'];

export default function RecyclerMarketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [materialFilter, setMaterialFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'weight'>('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const all: any[] = JSON.parse(localStorage.getItem('all_listings') || '[]');
    setListings(all.filter(l => l.status === 'available'));
    setLoading(false);
  }, []);

  const filtered = useMemo(() => {
    let result = [...listings];
    if (search) result = result.filter(l => l.title?.toLowerCase().includes(search.toLowerCase()) || l.description?.toLowerCase().includes(search.toLowerCase()));
    if (materialFilter !== 'All') result = result.filter(l => {
      const mat = (l.materials?.[0]?.type ?? detectMaterialKey(l)).toLowerCase();
      return mat.includes(materialFilter.toLowerCase());
    });
    if (sortBy === 'price_asc') result.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    else if (sortBy === 'price_desc') result.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    else if (sortBy === 'weight') result.sort((a, b) => (parseFloat(b.weight_kg) || 0) - (parseFloat(a.weight_kg) || 0));
    return result;
  }, [listings, search, materialFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-3xl p-10 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2e1065 0%, #1a0533 100%)', border: '1px solid rgba(139,92,246,0.25)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <h1 className="text-4xl font-black mb-2 relative z-10">Procurement Network</h1>
        <p className="text-purple-200 text-lg relative z-10 max-w-2xl">
          {listings.length} available material streams · Browse, filter, and purchase directly.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="cwi-auth-card rounded-2xl p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search concrete, wood, metal..."
              className="cwi-input w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-500 shrink-0" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="cwi-input rounded-xl px-3 py-3 text-sm outline-none">
              <option value="newest">Newest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="weight">Heaviest</option>
            </select>
          </div>
        </div>
        {/* Material pills */}
        <div className="flex gap-2 flex-wrap">
          {MATERIAL_OPTIONS.map(m => (
            <button key={m} onClick={() => setMaterialFilter(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${materialFilter === m ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40' : 'bg-white/5 text-zinc-500 border border-white/8 hover:border-white/15'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{filtered.length} listing{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(k => <div key={k} className="animate-pulse rounded-2xl h-64" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="cwi-auth-card rounded-2xl border-dashed p-16 text-center">
          <Package className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">No listings match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(l => {
            const matKey = detectMaterialKey(l);
            const weightKg = parseFloat(l.weight_kg) || 0;
            const co2Saved = weightKg * (EMISSION_FACTORS[matKey] ?? 0.159);
            const purity = l.materials?.[0]?.percentage;
            return (
              <Link key={l.id} href={`/marketplace/${l.id}`} className="group cwi-card rounded-2xl overflow-hidden block">
                {/* Image */}
                <div className="h-40 overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <img src={l.image || 'https://images.unsplash.com/photo-1595822363143-6df79ceb6d5c?auto=format&fit=crop&q=80&w=400'}
                    alt={l.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition duration-500" />
                  {purity && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                      {purity}% pure
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white text-sm leading-tight mb-1 truncate">{l.title}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{l.description}</p>

                  <div className="space-y-1.5 mb-4">
                    {weightKg > 0 && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Package className="h-3 w-3 text-purple-400 shrink-0" />
                        <span>{weightKg >= 1000 ? `${(weightKg / 1000).toFixed(2)} t` : `${weightKg} kg`}</span>
                      </div>
                    )}
                    {co2Saved > 0 && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Leaf className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span>{co2Saved.toFixed(1)} kg CO₂ offset if purchased</span>
                      </div>
                    )}
                    {l.company_name && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <MapPin className="h-3 w-3 text-blue-400 shrink-0" />
                        <span className="truncate">{l.company_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <span className="text-lg font-black text-emerald-400">${parseFloat(l.price || 0).toLocaleString()}</span>
                    <span className="text-xs font-bold flex items-center gap-1 text-purple-400 group-hover:translate-x-0.5 transition-transform">
                      Evaluate <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
