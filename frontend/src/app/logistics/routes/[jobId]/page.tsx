"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getStore, setStore } from '@/lib/storage';
import { CheckCircle, Navigation, MapPin, Package, Building2, ArrowLeft } from 'lucide-react';

export default function ActiveRoutePage() {
  const { jobId } = useParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    if (!jobId) return;
    const driverJobs = getStore<any[]>('driver_jobs', []);
    const found = driverJobs.find(j => j.id === jobId);
    if (found) setJob(found);
  }, [jobId]);

  const persist = (updated: any) => {
    const driverJobs = getStore<any[]>('driver_jobs', []);
    setStore('driver_jobs', driverJobs.map(j => j.id === updated.id ? updated : j));
    // Also update global pool
    const globalJobs: any[] = JSON.parse(localStorage.getItem('logistics_jobs') || '[]');
    localStorage.setItem('logistics_jobs', JSON.stringify(
      globalJobs.map(j => j.id === updated.id ? { ...j, status: updated.status } : j)
    ));
    setJob(updated);
  };

  const handleStart = () => persist({ ...job, status: 'IN_PROGRESS' });

  const handleComplete = () => {
    persist({ ...job, status: 'DELIVERED' });
    router.push('/driver');
  };

  if (!job) return (
    <div className="min-h-screen cwi-bg flex items-center justify-center">
      <div className="animate-pulse cwi-auth-card h-64 w-full max-w-lg rounded-2xl" />
    </div>
  );

  const isLive = job.status === 'IN_PROGRESS';

  return (
    <div className="min-h-screen cwi-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-12">

        <button onClick={() => router.push('/driver')} className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-6 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <div className="cwi-auth-card rounded-3xl overflow-hidden">

          {/* Status bar */}
          <div className={`px-6 py-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${isLive ? 'bg-blue-600' : 'bg-emerald-600/20'}`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-emerald-400'}`} />
            <span className={isLive ? 'text-white' : 'text-emerald-400'}>
              {job.status === 'ACCEPTED' ? 'Ready to Start' : job.status === 'IN_PROGRESS' ? 'In Progress' : 'Delivered'}
            </span>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white leading-tight">{job.listing_title}</h1>
              <p className="text-xs text-zinc-600 font-mono mt-1">#{job.id?.substring(0, 8)}</p>
            </div>

            {/* Bounty */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Contract Bounty</p>
              <p className="text-4xl font-black text-blue-400">${job.payment_offered_usd} <span className="text-base text-zinc-500 font-medium">USD</span></p>
            </div>

            {/* Material */}
            {job.material && (
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <Package className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Material</p>
                  <p className="font-bold text-white text-sm">
                    {job.material}
                    {job.material_purity && <span className="text-emerald-400 ml-1">· {job.material_purity}% pure</span>}
                    {job.weight_kg && <span className="text-zinc-500 ml-1">· {job.weight_kg} kg</span>}
                  </p>
                </div>
              </div>
            )}

            {/* Seller */}
            {job.company_name && (
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Building2 className="h-5 w-5 text-zinc-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Seller</p>
                  <p className="font-bold text-white text-sm">{job.company_name}</p>
                  {job.contact_number && <p className="text-xs text-zinc-500 mt-0.5">{job.contact_number}</p>}
                </div>
              </div>
            )}

            {/* Route */}
            <div className="relative pl-2">
              <div className="absolute left-[18px] top-6 bottom-6 w-0.5" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="flex gap-4 mb-6 relative">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 z-10">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="pt-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Pickup</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {job.pickup ? `${job.pickup.lat?.toFixed(4)}, ${job.pickup.lng?.toFixed(4)}` : '—'}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 relative">
                <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center shrink-0 z-10">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="pt-1 min-w-0">
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Deliver To</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{job.delivery_address || 'Address not provided'}</p>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              {job.status === 'ACCEPTED' && (
                <button onClick={handleStart}
                  className="w-full py-4 rounded-2xl font-black text-base flex justify-center items-center gap-2 transition"
                  style={{ background: 'rgba(59,130,246,0.9)', color: 'white' }}
                  onMouseOver={e => (e.currentTarget.style.background = 'rgba(59,130,246,1)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.9)')}>
                  <Navigation className="h-5 w-5" /> Start Job
                </button>
              )}
              {job.status === 'IN_PROGRESS' && (
                <button onClick={handleComplete} className="cwi-btn-primary w-full py-4 rounded-2xl font-black text-base flex justify-center items-center gap-2">
                  <CheckCircle className="h-5 w-5" /> Mark Delivered
                </button>
              )}
              {job.status === 'DELIVERED' && (
                <div className="text-center font-bold text-zinc-500 py-4 rounded-2xl border border-dashed" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  ✓ Bounty Resolved
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
