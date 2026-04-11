"use client";
import Link from 'next/link';
import { useUser } from '@/lib/UserContext';
import { Package } from 'lucide-react';

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
  const { role } = useUser();
  const canBuy = BUYER_ROLES.includes(role);
  const isSold = listing.status === 'sold';

  return (
    <div className={`cwi-card rounded-2xl overflow-hidden group transition-all ${isSold ? 'opacity-60' : ''}`}>
      {/* Image */}
      <div className="h-40 overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <img
          src={listing.image || getImage(listing.title)}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
        />
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
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
            {!isSold && canBuy ? (
              /* Consumer/Recycler: go to detail page where address modal + Purchase Now lives */
              <Link href={`/marketplace/${listing.id}`}
                className="cwi-btn-primary px-3 py-1.5 rounded-lg text-xs font-bold">
                Purchase Now
              </Link>
            ) : !isSold ? (
              /* Producer/Driver: view only */
              <Link href={`/marketplace/${listing.id}`}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                View Details
              </Link>
            ) : (
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600"
                style={{ background: 'rgba(255,255,255,0.04)' }}>Sold</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
