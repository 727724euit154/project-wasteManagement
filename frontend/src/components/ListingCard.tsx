import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getStore, setStore } from '@/lib/storage';
import { Package, ArrowRight } from 'lucide-react';

const MATERIAL_IMAGES: Record<string, string> = {
  metal:      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400',
  glass:      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&q=80&w=400',
  wood:       'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&q=80&w=400',
  concrete:   'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400',
  brick:      'https://images.unsplash.com/photo-1590845947670-c009801ffa74?auto=format&fit=crop&q=80&w=400',
  plastic:    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=400',
  asphalt:    'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&q=80&w=400',
  ceramic:    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400',
};

function getImage(title: string) {
  const t = title.toLowerCase();
  const key = Object.keys(MATERIAL_IMAGES).find(k => t.includes(k));
  return key ? MATERIAL_IMAGES[key] : 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400';
}

const BUYER_ROLES = ['consumer', 'buyer', 'recycler'];

export default function ListingCard({ listing }: { listing: any }) {
  const [status, setStatus] = useState(listing.status);
  const [canBuy, setCanBuy] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('user_role') || '';
    setCanBuy(BUYER_ROLES.includes(role));
  }, []);

  const markSold = () => {
    const soldAt = new Date().toISOString();

    // Update global all_listings with sold_at timestamp
    const all: any[] = JSON.parse(localStorage.getItem('all_listings') || '[]');
    localStorage.setItem('all_listings', JSON.stringify(
      all.map(l => l.id === listing.id ? { ...l, status: 'sold', sold_at: soldAt } : l)
    ));

    // Update producer's scoped listings
    const userListings = getStore<any[]>('user_listings', []);
    setStore('user_listings', userListings.map(l => l.id === listing.id ? { ...l, status: 'sold' } : l));

    // Save to buyer's scoped purchased_listings
    const prev = getStore<any[]>('purchased_listings', []);
    prev.push({ ...listing, status: 'sold', purchased_at: soldAt, sold_at: soldAt });
    setStore('purchased_listings', prev);

    // Add to global logistics jobs
    const jobs: any[] = JSON.parse(localStorage.getItem('logistics_jobs') || '[]');
    if (!jobs.some(j => j.listing_id === listing.id)) {
      jobs.push({
        id: crypto.randomUUID(),
        listing_id: listing.id,
        listing_title: listing.title,
        material: listing.materials?.[0]?.type ?? 'Construction Waste',
        material_purity: listing.materials?.[0]?.percentage ?? null,
        weight_kg: listing.weight_kg ?? null,
        company_name: listing.company_name ?? null,
        contact_number: listing.contact_number ?? null,
        price: listing.price,
        status: 'AVAILABLE',
        payment_offered_usd: Math.round((parseFloat(listing.price) || 50) * 0.15),
        pickup: { lat: listing.latitude ?? 40.7128, lng: listing.longitude ?? -74.006 },
        delivery_address: null,
        purchased_at: soldAt,
      });
      localStorage.setItem('logistics_jobs', JSON.stringify(jobs));
    }

    setStatus('sold');
  };

  const isSold = status === 'sold';

  return (
    <div className={`cwi-card rounded-2xl overflow-hidden group transition-all ${isSold ? 'opacity-60' : ''}`}>
      {/* Image */}
      <div className="h-40 overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <img src={listing.image || getImage(listing.title)} alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80" />
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <span className="text-white font-black text-lg tracking-widest uppercase px-4 py-2 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.8)', border: '1px solid rgba(239,68,68,0.5)' }}>
              SOLD
            </span>
          </div>
        )}
        {listing.materials?.[0]?.percentage && !isSold && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
            {listing.materials[0].percentage}% pure
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white text-sm leading-tight truncate mb-1">{listing.title}</h3>
        <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{listing.description}</p>

        {listing.materials?.[0]?.type && (
          <div className="flex items-center gap-1.5 mb-3">
            <Package className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="text-xs text-zinc-400 capitalize">{listing.materials[0].type}</span>
            {listing.weight_kg && <span className="text-xs text-zinc-600">· {listing.weight_kg} kg</span>}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="text-lg font-black text-emerald-400">
            {listing.price ? `$${parseFloat(listing.price).toLocaleString()}` : '—'}
          </span>
          <div className="flex gap-2">
            <Link href={`/marketplace/${listing.id}`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              Details
            </Link>
            {!isSold && listing.price && canBuy && (
              <button onClick={markSold}
                className="cwi-btn-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                Buy <ArrowRight className="h-3 w-3" />
              </button>
            )}
            {!isSold && listing.price && !canBuy && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600"
                style={{ background: 'rgba(255,255,255,0.04)' }}>View Only</span>
            )}
            {isSold && (
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600"
                style={{ background: 'rgba(255,255,255,0.04)' }}>Sold</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
