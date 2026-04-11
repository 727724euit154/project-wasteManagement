"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getListingDetail, purchaseListing } from '@/services/api';
import { Truck, CheckCircle, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DeepInspectListing() {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!id) return;
    // Check localStorage first
    const local: any[] = JSON.parse(localStorage.getItem('user_listings') || '[]');
    const found = local.find((l: any) => l.id === id);
    if (found) { setListing(found); return; }
    // Only call API if token present
    const token = localStorage.getItem('access_token');
    if (token) {
      getListingDetail(id as string).then(res => setListing(res.data)).catch(() => {});
    }
  }, [id]);

  const handlePurchase = async () => {
    if (!listing || listing.status !== 'available') return;
    setPurchasing(true);
    try {
      const token = localStorage.getItem('access_token');
      if (token) await purchaseListing(listing.id, 500).catch(() => {});
      // Update localStorage
      const all: any[] = JSON.parse(localStorage.getItem('user_listings') || '[]');
      localStorage.setItem('user_listings', JSON.stringify(
        all.map((l: any) => l.id === listing.id ? { ...l, status: 'sold' } : l)
      ));
      const prev: any[] = JSON.parse(localStorage.getItem('purchased_listings') || '[]');
      prev.push({ ...listing, status: 'sold', purchased_at: new Date().toISOString() });
      localStorage.setItem('purchased_listings', JSON.stringify(prev));
      setListing({ ...listing, status: 'sold' });
      router.push('/dashboard/recycler');
    } finally {
      setPurchasing(false);
    }
  };

  if (!listing) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-3xl m-8"></div>;
  }

  // Pre-calculate bar chart colors for the YOLO distribution
  const colors = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <Link href="/recycler/marketplace" className="inline-flex items-center text-gray-500 hover:text-purple-600 font-medium transition mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Marketplace
      </Link>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Dynamic header / image visual */}
        <div className="h-64 bg-gray-100 relative">
          <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
          <div className="absolute bottom-6 left-8 text-white">
            <div className="flex gap-2 items-center mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${listing.status === 'available' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                {listing.status}
              </span>
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase">
                {new Date(listing.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-4xl font-bold">{listing.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Main Inspection Layout */}
          <div className="lg:col-span-2 p-8 border-r border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Composition Analysis</h2>
            <div className="space-y-6">
              
              {/* Proportional Material Breakdown Chart Simulator */}
              {listing.analysis?.materials?.length > 0 ? (
                <div className="space-y-3 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex w-full h-4 rounded-full overflow-hidden shadow-inner">
                    {listing.analysis.materials.map((mat:any, i:number) => (
                      <div key={i} className={`h-full ${colors[i % colors.length]}`} style={{ width: `${mat.confidence * 100}%` }}></div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200">
                     {listing.analysis.materials.map((mat:any, i:number) => (
                      <div key={i}>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                          <span className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`}></span>
                          {mat.material_type}
                        </div>
                        <div className="text-xs text-gray-500 ml-5 font-mono">{(mat.confidence * 100).toFixed(0)}% Vol</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl border border-red-100 text-sm font-medium">
                  YOLOv8 Analysis data holds no detection fragments for this payload.
                </div>
              )}

              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Description / Carrier Notes</h2>
                <p className="text-gray-600 leading-relaxed bg-white p-6 rounded-xl border border-gray-100 shadow-sm">{listing.description}</p>
              </div>

            </div>
          </div>

          {/* Action sidebar */}
          <div className="p-8 bg-gray-50/50">
            <div className="sticky top-24 space-y-6">
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Acquisition Logistics</h3>
                 <div className="text-4xl font-extrabold text-gray-900 mb-6">$500 <span className="text-lg text-gray-500 font-medium">/ bulk</span></div>
                 
                 <button 
                  onClick={handlePurchase}
                  disabled={purchasing || listing.status !== 'available'}
                  className={`w-full py-4 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2
                    ${listing.status === 'available' ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                  `}>
                  <Package className="w-5 h-5" /> 
                  {purchasing ? 'Executing Socket...' : listing.status === 'available' ? 'Purchase Assets' : 'Already Distributed'}
                 </button>

                 <button disabled={listing.status !== 'available'} className="w-full mt-3 py-3 rounded-xl font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all flex items-center justify-center gap-2 border border-purple-100">
                  <Truck className="w-5 h-5" /> Request Transport Hook
                 </button>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
