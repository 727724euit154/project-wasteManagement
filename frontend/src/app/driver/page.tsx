"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { getStore, setStore, currentEmail } from '@/lib/storage';
import { useUser } from '@/lib/UserContext';
import { Truck, Package, MapPin, CheckCircle, DollarSign, Clock, ArrowRight, Building2 } from 'lucide-react';

export default function DriverDashboard() {
  const router = useRouter();
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);

  useEffect(() => {
    // Global pool — all unaccepted jobs
    const globalJobs: any[] = JSON.parse(localStorage.getItem('logistics_jobs') || '[]');
    setAvailableJobs(globalJobs.filter(j => j.status === 'AVAILABLE'));

    // This driver's own accepted/completed history
    setMyJobs(getStore<any[]>('driver_jobs', []));
  }, []);

  const active = myJobs.filter(j => j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS');
  const completed = myJobs.filter(j => j.status === 'DELIVERED');
  const totalEarned = completed.reduce((s, j) => s + (j.payment_offered_usd || 0), 0);

  const handleAccept = (job: any) => {
    // Remove from global available pool
    const globalJobs: any[] = JSON.parse(localStorage.getItem('logistics_jobs') || '[]');
    localStorage.setItem('logistics_jobs', JSON.stringify(
      globalJobs.map(j => j.id === job.id ? { ...j, status: 'ACCEPTED', accepted_by: currentEmail() } : j)
    ));

    // Add to this driver's scoped jobs
    const driverJobs = getStore<any[]>('driver_jobs', []);
    setStore('driver_jobs', [...driverJobs, { ...job, status: 'ACCEPTED' }]);

    setAvailableJobs(prev => prev.filter(j => j.id !== job.id));
    setMyJobs(prev => [...prev, { ...job, status: 'ACCEPTED' }]);

    router.push(`/logistics/routes/${job.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">

        <div className="rounded-3xl p-10 text-white mb-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/3 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <h1 className="text-4xl font-black tracking-tight mb-2 relative z-10">Driver Dashboard</h1>
          <p className="text-zinc-400 text-lg relative z-10">Your personal job history and available pickups.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Available', value: availableJobs.length, icon: <Package className="h-5 w-5" />, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Active', value: active.length, icon: <Truck className="h-5 w-5" />, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Completed', value: completed.length, icon: <CheckCircle className="h-5 w-5" />, color: 'text-zinc-400', bg: 'rgba(255,255,255,0.06)' },
            { label: 'Total Earned', value: `$${totalEarned}`, icon: <DollarSign className="h-5 w-5" />, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
          ].map(s => (
            <div key={s.label} className="cwi-auth-card rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 rounded-full" style={{ background: s.bg }}>
                <span className={s.color}>{s.icon}</span>
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Active jobs */}
        {active.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-white mb-4">Active Jobs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {active.map(job => (
                <button key={job.id} onClick={() => router.push(`/logistics/routes/${job.id}`)}
                  className="cwi-card rounded-2xl p-5 text-left group w-full"
                  style={{ border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.05)' }}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-white">{job.listing_title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">{job.material}</span>
                    <span className="font-bold text-blue-400 flex items-center gap-1">
                      ${job.payment_offered_usd} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Available jobs */}
        <h2 className="text-xl font-bold text-white mb-4">Available Jobs</h2>
        {availableJobs.length === 0 ? (
          <div className="cwi-auth-card rounded-2xl border-dashed p-12 text-center mb-8">
            <Truck className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">No available jobs right now.</p>
            <p className="text-zinc-600 text-sm mt-1">Jobs appear when materials are purchased on the marketplace.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {availableJobs.map(job => (
              <div key={job.id} className="cwi-card rounded-2xl p-5 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-white text-sm leading-tight">{job.listing_title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    ${job.payment_offered_usd}
                  </span>
                </div>
                <div className="space-y-2 flex-1 mb-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Package className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>{job.material}{job.weight_kg ? ` · ${job.weight_kg} kg` : ''}</span>
                  </div>
                  {job.company_name && (
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Building2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{job.company_name}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm text-zinc-500">
                    <MapPin className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span className="truncate">{job.delivery_address || 'Address TBD'}</span>
                  </div>
                  {job.purchased_at && (
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{new Date(job.purchased_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => handleAccept(job)}
                  className="cwi-btn-primary w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <Truck className="h-4 w-4" /> Accept Job
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-white mb-4">Completed Deliveries</h2>
            <div className="space-y-2">
              {completed.map(job => (
                <div key={job.id} className="cwi-auth-card rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-white text-sm">{job.listing_title}</p>
                      <p className="text-xs text-zinc-500">{job.delivery_address || '—'}</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400">${job.payment_offered_usd}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
