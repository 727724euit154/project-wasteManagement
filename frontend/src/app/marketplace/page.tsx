"use client";
import { useEffect, useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ListingCard from '@/components/ListingCard';
import { Search, SlidersHorizontal } from 'lucide-react';

const SORT_OPTIONS = ['Latest First', 'Price: Low to High', 'Price: High to Low', 'Heaviest First'];

export default function MarketplacePage() {
  const [allListings, setAllListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Latest First');

  const loadListings = () => {
    const raw: any[] = JSON.parse(localStorage.getItem('all_listings') || '[]');
    setAllListings(raw);
    setLoading(false);
  };

  useEffect(() => {
    loadListings();

    // Auto-remove sold listings after 30 seconds
    const interval = setInterval(() => {
      const raw: any[] = JSON.parse(localStorage.getItem('all_listings') || '[]');
      const now = Date.now();
      const cleaned = raw.filter(l => {
        if (l.status !== 'sold') return true;
        const soldAt = l.sold_at ? new Date(l.sold_at).getTime() : 0;
        return soldAt && now - soldAt < 30000; // keep for 30s then remove
      });
      if (cleaned.length !== raw.length) {
        localStorage.setItem('all_listings', JSON.stringify(cleaned));
        setAllListings(cleaned);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const clearMarketplace = () => {
    if (!confirm('Clear all listings from the marketplace?')) return;
    localStorage.setItem('all_listings', JSON.stringify([]));
    setAllListings([]);
  };

  const filtered = useMemo(() => {
    let result = [...allListings];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.materials?.[0]?.type?.toLowerCase().includes(q) ||
        l.company_name?.toLowerCase().includes(q)
      );
    }
    if (sort === 'Price: Low to High') result.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    else if (sort === 'Price: High to Low') result.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    else if (sort === 'Heaviest First') result.sort((a, b) => (parseFloat(b.weight_kg) || 0) - (parseFloat(a.weight_kg) || 0));
    else result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result;
  }, [allListings, search, sort]);

  const available = filtered.filter(l => l.status === 'available');
  const sold = filtered.filter(l => l.status === 'sold');

  return (
    <div className="min-h-screen cwi-bg">
      <Navbar />

      {/* Hero */}
      <div className="pt-32 pb-16 px-8 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0a0a0f 60%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.15) 0%, transparent 70%)' }} />
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3 relative z-10 tracking-tight">
          Circular Economy Marketplace
        </h1>
        <p className="text-zinc-400 max-w-xl mx-auto text-lg relative z-10 mb-8">
          Discover, intercept, and reclaim structural waste streams.
        </p>
        <div className="relative z-10 max-w-2xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search concrete, wood, metal, company..."
              className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none font-medium"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f5' }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">
              Available Resources
              <span className="ml-2 text-sm font-normal text-zinc-500">({available.length} listings)</span>
            </h2>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="cwi-input rounded-xl px-3 py-2 text-sm outline-none">
                {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <button onClick={clearMarketplace}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 transition"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              Clear All
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1,2,3,4,5,6,7,8].map(k => (
              <div key={k} className="animate-pulse rounded-2xl h-72" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : available.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {available.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <div className="cwi-auth-card rounded-3xl border-dashed p-20 text-center">
            <h3 className="text-xl font-bold text-zinc-500">No listings available.</h3>
            <p className="text-zinc-600 text-sm mt-2">Producers can create listings from their dashboard.</p>
          </div>
        )}

        {/* Sold section — shows briefly then disappears */}
        {sold.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-zinc-500 mb-4">Recently Sold</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 opacity-50">
              {sold.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
