"use client";
import { useState } from 'react';
import { OS_MARKETPLACE_ITEMS } from '@/lib/osDummyData';
import { Search, SlidersHorizontal, MapPin, Package, ArrowUpRight } from 'lucide-react';

const MATERIAL_COLORS: Record<string, string> = {
  'Metal Waste':    'bg-slate-100 text-slate-700',
  'Concrete Waste': 'bg-gray-100 text-gray-700',
  'Wood Waste':     'bg-amber-100 text-amber-700',
  'Glass Waste':    'bg-cyan-100 text-cyan-700',
  'Brick Waste':    'bg-red-100 text-red-700',
};

const FILTERS = ['All', 'Metal Waste', 'Concrete Waste', 'Wood Waste', 'Glass Waste', 'Brick Waste'];

export default function OSMarketplacePage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [purchased, setPurchased] = useState<Set<string>>(new Set());

  const items = OS_MARKETPLACE_ITEMS.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.material.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || item.material === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Marketplace</h1>
        <p className="text-sm text-gray-500 mt-1">Browse and purchase verified construction waste streams.</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search materials…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition border
                ${filter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(item => {
          const isBought = purchased.has(item.id) || item.status === 'sold';
          return (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col overflow-hidden">
              {/* Colour band */}
              <div className={`h-2 w-full ${MATERIAL_COLORS[item.material]?.split(' ')[0] ?? 'bg-gray-100'}`} />

              <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-snug">{item.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${MATERIAL_COLORS[item.material] ?? 'bg-gray-100 text-gray-600'}`}>
                    {item.material.replace(' Waste', '')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3 h-3 shrink-0" /> {item.location}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { label: 'Weight', value: item.weight },
                    { label: 'Purity', value: `${item.purity}%` },
                    { label: 'Price',  value: `$${item.price.toLocaleString()}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-black text-gray-800 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-auto pt-2">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Package className="w-3 h-3" /> {item.seller}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5">
                <button
                  disabled={isBought}
                  onClick={() => setPurchased(prev => new Set([...prev, item.id]))}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2
                    ${isBought
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
                    }`}
                >
                  {isBought ? 'Purchased' : <><ArrowUpRight className="w-3.5 h-3.5" /> Purchase</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-gray-400 font-medium">No listings match your search.</p>
        </div>
      )}
    </div>
  );
}
