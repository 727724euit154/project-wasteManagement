"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ListingCard from '@/components/ListingCard';
import { getListings } from '@/services/api';

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from global all_listings (all producers' listings)
    const allListings: any[] = JSON.parse(localStorage.getItem('all_listings') || '[]');
    setListings(allListings.filter((l: any) => l.status === 'available'));
    setLoading(false);
  }, []);

  const clearMarketplace = () => {
    if (confirm('Are you sure you want to clear all user-created listings from the marketplace?')) {
      localStorage.removeItem('user_listings');
      // Reload the page to refresh the listings
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Header */}
      <div className="bg-emerald-900 text-white pt-32 pb-20 px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent"></div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 relative z-10">Circular Economy Marketplace</h1>
        <p className="text-emerald-100 max-w-2xl mx-auto text-lg relative z-10">Discover, intercept, and reclaim structural waste streams globally.</p>
        
        {/* Simple inline filter layout mock */}
        <div className="mt-8 relative z-10 max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl flex gap-2 overflow-x-auto hide-scrollbar border border-white/20">
            <input type="text" placeholder="Search concrete, wood, metal..." className="flex-1 bg-white rounded-xl px-4 py-3 outline-none text-gray-800 placeholder-gray-400 font-medium"/>
            <button className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition shadow">Search</button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Available Resources</h2>
          <div className="flex gap-4 items-center">
            <button 
              onClick={clearMarketplace}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition text-sm"
            >
              Clear Marketplace
            </button>
            <select className="bg-white border rounded-lg px-4 py-2 outline-none text-sm text-gray-600 font-medium">
              <option>Latest First</option>
              <option>Radius (Nearest)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(key => (
              <div key={key} className="bg-gray-200 animate-pulse h-72 rounded-2xl"></div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <h3 className="text-xl font-bold text-gray-400">No resources matched your criteria.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
