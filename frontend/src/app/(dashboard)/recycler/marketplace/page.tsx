"use client";
import { useEffect, useState } from 'react';
import RecyclerListingCard from '@/components/RecyclerListingCard';
import { getListingsWithDistance } from '@/services/api';

export default function RecyclerMarketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage first
    const local: any[] = JSON.parse(localStorage.getItem('user_listings') || '[]');
    if (local.length) {
      setListings(local.filter(l => l.status === 'available'));
      setLoading(false);
      return;
    }
    // Only call API if token present
    const token = localStorage.getItem('access_token');
    if (token) {
      getListingsWithDistance(40.7128, -74.0060)
        .then(res => setListings(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-purple-900 rounded-3xl p-10 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <h1 className="text-4xl font-bold mb-3 relative z-10">Resource Procurement Network</h1>
        <p className="text-purple-200 text-lg relative z-10 max-w-2xl">Explore available structural streams dynamically filtered through PostGIS proximity sensors relative to your central facility.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6].map(key => (
            <div key={key} className="bg-gray-200 animate-pulse h-80 rounded-2xl"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map(listing => (
            <RecyclerListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
