"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getListings } from '@/services/api';
import { getStore, setStore } from '@/lib/storage';
import { MapPin, X } from 'lucide-react';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '' });
  const [role, setRole] = useState('');

  useEffect(() => {
    setRole(localStorage.getItem('user_role') || '');
  }, []);

  const canBuy = ['consumer', 'buyer', 'recycler'].includes(role);

  useEffect(() => {
    // Check user's own listings first, then global listings
    const userListings = getStore<any[]>('user_listings', []);
    const globalListings: any[] = JSON.parse(localStorage.getItem('all_listings') || '[]');
    const all = [...userListings, ...globalListings];
    const found = all.find((l: any) => l.id === params.id);
    if (found) {
      setListing(found);
      // Check if THIS user already purchased it
      const myPurchases = getStore<any[]>('purchased_listings', []);
      setPurchased(myPurchases.some((p: any) => p.id === found.id));
      setLoading(false);
    } else {
      getListings().then(res => {
        const apiListing = res.data.find((l: any) => l.id === params.id);
        if (apiListing) {
          setListing(apiListing);
          const myPurchases = getStore<any[]>('purchased_listings', []);
          setPurchased(myPurchases.some((p: any) => p.id === apiListing.id));
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [params.id]);

  const confirmPurchase = () => {
    if (!address.street || !address.city || !address.state || !address.zip) return;
    const deliveryAddress = `${address.street}, ${address.city}, ${address.state} ${address.zip}`;

    // Mark listing sold in global listings store
    const allListings: any[] = JSON.parse(localStorage.getItem('all_listings') || '[]');
    localStorage.setItem('all_listings', JSON.stringify(
      allListings.map((l: any) => l.id === listing.id ? { ...l, status: 'sold' } : l)
    ));
    // Also mark in user's own listings if they own it
    const userListings = getStore<any[]>('user_listings', []);
    setStore('user_listings', userListings.map((l: any) => l.id === listing.id ? { ...l, status: 'sold' } : l));

    // Save to THIS user's purchased_listings
    const prev = getStore<any[]>('purchased_listings', []);
    prev.push({ ...listing, status: 'sold', purchased_at: new Date().toISOString(), delivery_address: deliveryAddress });
    setStore('purchased_listings', prev);

    // Add to global logistics jobs pool (shared across drivers)
    const jobs: any[] = JSON.parse(localStorage.getItem('logistics_jobs') || '[]');
    const alreadyExists = jobs.some(j => j.listing_id === listing.id);
    if (!alreadyExists) {
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
        delivery_address: deliveryAddress,
        purchased_at: new Date().toISOString(),
      });
      localStorage.setItem('logistics_jobs', JSON.stringify(jobs));
    }

    setShowAddressModal(false);
    setPurchased(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-64 bg-gray-200 rounded mb-6" />
      </div>
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
        <button onClick={() => router.push('/marketplace')} className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700">Back to Marketplace</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="cwi-auth-card rounded-2xl w-full max-w-md p-8 relative">
            <button onClick={() => setShowAddressModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/20 p-3 rounded-full"><MapPin className="h-5 w-5 text-emerald-400" /></div>
              <div>
                <h2 className="text-xl font-bold text-white">Delivery Address</h2>
                <p className="text-sm text-zinc-500">Where should this material be delivered?</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Street Address</label>
                <input type="text" placeholder="123 Main St" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} className="cwi-input w-full rounded-xl px-3 py-2.5 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">City</label>
                  <input type="text" placeholder="New York" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className="cwi-input w-full rounded-xl px-3 py-2.5 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">State</label>
                  <input type="text" placeholder="NY" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} className="cwi-input w-full rounded-xl px-3 py-2.5 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">ZIP Code</label>
                <input type="text" placeholder="10001" value={address.zip} onChange={e => setAddress({ ...address, zip: e.target.value })} className="cwi-input w-full rounded-xl px-3 py-2.5 outline-none" />
              </div>
            </div>
            <button onClick={confirmPurchase} disabled={!address.street || !address.city || !address.state || !address.zip}
              className="cwi-btn-primary w-full mt-6 py-3 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed">
              Confirm Purchase & Schedule Delivery
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="cwi-auth-card rounded-2xl overflow-hidden">
          <div className="h-72 bg-gray-200 overflow-hidden">
            <img src={listing.image || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800'} alt={listing.title} className="w-full h-full object-cover opacity-80" />
          </div>
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{listing.title}</h1>
                <p className="text-zinc-400 text-lg">{listing.description}</p>
              </div>
              {listing.price && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-400">${listing.price}</div>
                  <div className="text-sm text-zinc-500">Price</div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${listing.status === 'available' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-white/5 text-zinc-400 border border-white/10'}`}>
                {listing.status}
              </span>
            </div>

            {listing.materials?.length > 0 && (
              <div className="mb-6 p-5 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <h2 className="text-lg font-semibold text-white mb-3">Primary Material</h2>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-emerald-400">{listing.materials[0].type}</h3>
                    <p className="text-zinc-500 text-sm mt-0.5">High-purity construction waste</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-400">{listing.materials[0].percentage}%</div>
                    <div className="text-xs text-zinc-500">Purity</div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full rounded-full" style={{ width: `${listing.materials[0].percentage}%` }} />
                </div>
              </div>
            )}

            <div className="mb-6 p-5 rounded-xl" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <h2 className="text-lg font-semibold text-white mb-3">Producer Information</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><div className="text-xs text-blue-400 mb-1">Company</div><div className="font-bold text-white text-sm">{listing.company_name || '—'}</div></div>
                <div><div className="text-xs text-blue-400 mb-1">Contact</div><div className="font-bold text-white text-sm">{listing.contact_number || '—'}</div></div>
                <div><div className="text-xs text-blue-400 mb-1">Weight</div><div className="font-bold text-emerald-400 text-sm">{listing.weight_kg ? `${listing.weight_kg} kg` : '—'}</div></div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-white/5">
              <button onClick={() => router.push('/marketplace')} className="flex-1 cwi-btn-ghost py-3 rounded-xl font-medium">
                Back to Marketplace
              </button>
              {listing.price && !purchased && canBuy && (
                <button onClick={() => setShowAddressModal(true)} className="flex-1 cwi-btn-primary py-3 rounded-xl font-bold">
                  Purchase Now
                </button>
              )}
              {listing.price && !purchased && !canBuy && (
                <div className="flex-1 text-center py-3 rounded-xl font-medium text-zinc-500 text-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Only consumers can purchase listings
                </div>
              )}
              {purchased && (
                <span className="flex-1 text-center py-3 rounded-xl font-medium text-zinc-500" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  ✓ Purchased
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
