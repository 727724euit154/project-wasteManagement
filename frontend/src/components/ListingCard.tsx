import { useState } from 'react';
import { purchaseListing } from '@/services/api';
import Link from 'next/link';

const getMaterialImage = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('metal waste') || lowerTitle.includes('metal')) {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400&h=300&ixlib=rb-4.0.3';
  } else if (lowerTitle.includes('glass waste') || lowerTitle.includes('glass')) {
    return 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&q=80&w=400&h=300&ixlib=rb-4.0.3';
  } else if (lowerTitle.includes('wood waste') || lowerTitle.includes('wood')) {
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&q=80&w=400&h=300&ixlib=rb-4.0.3';
  } else if (lowerTitle.includes('concrete waste') || lowerTitle.includes('concrete')) {
    return 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400&h=300&ixlib=rb-4.0.3';
  } else if (lowerTitle.includes('brick waste') || lowerTitle.includes('brick')) {
    return 'https://images.unsplash.com/photo-1590845947670-c009801ffa74?auto=format&fit=crop&q=80&w=400&h=300&ixlib=rb-4.0.3';
  } else if (lowerTitle.includes('plastic waste') || lowerTitle.includes('plastic')) {
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=400&h=300&ixlib=rb-4.0.3';
  } else if (lowerTitle.includes('asphalt waste') || lowerTitle.includes('asphalt')) {
    return 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&q=80&w=400&h=300&ixlib=rb-4.0.3';
  } else if (lowerTitle.includes('gypsum waste') || lowerTitle.includes('gypsum') || lowerTitle.includes('drywall')) {
    return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400&h=300&ixlib=rb-4.0.3';
  } else if (lowerTitle.includes('insulation waste') || lowerTitle.includes('insulation')) {
    return 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=400&h=300&ixlib=rb-4.0.3';
  } else if (lowerTitle.includes('ceramic waste') || lowerTitle.includes('ceramic')) {
    return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=400&h=300&ixlib=rb-4.0.3';
  } else if (lowerTitle.includes('rubber waste') || lowerTitle.includes('rubber')) {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400&h=300&ixlib=rb-4.0.3';
  } else {
    return 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400&h=300&ixlib=rb-4.0.3';
  }
};

export default function ListingCard({ listing }: { listing: any }) {
  const [status, setStatus] = useState(listing.status);

  const handleBuy = async () => {
    if (status === 'sold') return;
    try {
      await purchaseListing(listing.id, listing.price).catch(() => {});
      // Mark sold in user_listings
      const all: any[] = JSON.parse(localStorage.getItem('user_listings') || '[]');
      const updated = all.map(l => l.id === listing.id ? { ...l, status: 'sold' } : l);
      localStorage.setItem('user_listings', JSON.stringify(updated));
      // Track in purchased_listings
      const purchased: any[] = JSON.parse(localStorage.getItem('purchased_listings') || '[]');
      purchased.push({ ...listing, status: 'sold', purchased_at: new Date().toISOString() });
      localStorage.setItem('purchased_listings', JSON.stringify(purchased));
      setStatus('sold');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="border rounded-2xl p-4 shadow-sm hover:shadow-lg transition bg-white group cursor-pointer">
      <div className="w-full h-40 bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
        {/* Using standard img tag without external Next.js domains to prevent errors out of box */}
        <img 
          src={listing.image || getMaterialImage(listing.title)} 
          alt="Waste Resource" 
          className="object-cover w-full h-full group-hover:scale-105 transition duration-700" 
        />
      </div>
      <h3 className="font-semibold text-lg line-clamp-1">{listing.title}</h3>
      <p className="text-gray-500 text-sm mt-1 mb-4 line-clamp-2 min-h-[40px]">{listing.description}</p>
      
      {listing.price && (
        <div className="mb-3">
          <span className="text-2xl font-bold text-emerald-600">${listing.price}</span>
        </div>
      )}
      
      {listing.materials && listing.materials.length > 0 && (
        <div className="mb-3">
          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
            {listing.materials[0].type} • {listing.materials[0].percentage}% Pure
          </span>
        </div>
      )}
      
      <div className="flex border-t pt-3 justify-between items-center text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Status</span>
          <span className={`font-semibold uppercase tracking-wider text-[11px] ${
            status === 'sold' ? 'text-gray-400' : 'text-emerald-600'
          }`}>{status}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/marketplace/${listing.id}`}>
            <button className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-100 transition text-xs">
              Details
            </button>
          </Link>
          {listing.price && status !== 'sold' && (
            <button 
              onClick={handleBuy}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700 transition text-xs"
            >
              Buy Now
            </button>
          )}
          {status === 'sold' && (
            <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium">Sold</span>
          )}
        </div>
      </div>
    </div>
  );
}
