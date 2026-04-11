"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Truck, Box, Navigation } from 'lucide-react';

export default function LogisticsDashboard() {
  const [available, setAvailable] = useState(0);
  const [active, setActive] = useState(0);
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    const jobs: any[] = JSON.parse(localStorage.getItem('logistics_jobs') || '[]');
    setAvailable(jobs.filter(j => j.status === 'AVAILABLE').length);
    setActive(jobs.filter(j => j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS').length);
    setEarned(
      jobs
        .filter(j => j.status === 'DELIVERED')
        .reduce((sum, j) => sum + (parseFloat(j.payment_offered_usd) || 0), 0)
    );
  }, []);

  const activeJob = (() => {
    const jobs: any[] = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('logistics_jobs') || '[]')
      : [];
    return jobs.find(j => j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS');
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Driver Dashboard</h1>
        <p className="text-gray-500 mt-1">Claim routes, haul materials, and collect bounties.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-center flex gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Box className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Available Dispatch</p>
            <h3 className="text-2xl font-bold text-gray-900">{available}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-center flex gap-4">
          <div className="bg-amber-100 p-4 rounded-full text-amber-600"><Navigation className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Routes</p>
            <h3 className="text-2xl font-bold text-gray-900">{active}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-center flex gap-4">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><Truck className="h-6 w-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Bounties Earned</p>
            <h3 className="text-2xl font-bold text-gray-900">${earned.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/logistics/jobs" className="block group">
          <div className="bg-blue-600 h-full p-8 text-white rounded-2xl shadow-md hover:shadow-lg transition relative overflow-hidden">
            <h3 className="text-2xl font-bold mb-2 flex justify-between items-center z-10 relative">
              View Dispatch Board
              <ArrowRight className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-blue-100 text-sm z-10 relative">
              {available > 0 ? `${available} job${available > 1 ? 's' : ''} waiting for a driver.` : 'No jobs available right now.'}
            </p>
          </div>
        </Link>
        <Link href={activeJob ? `/logistics/routes/${activeJob.id}` : '#'} className="block group">
          <div className={`bg-white border-2 h-full p-8 rounded-2xl transition ${activeJob ? 'border-amber-400 hover:border-amber-500' : 'border-gray-200 hover:border-blue-500'}`}>
            <h3 className="text-2xl font-bold mb-2 text-gray-800 flex justify-between items-center">
              My Active Route
              <ArrowRight className={`h-6 w-6 transform group-hover:translate-x-1 transition-transform ${activeJob ? 'text-amber-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
            </h3>
            <p className="text-gray-500 text-sm">
              {activeJob ? `En route: ${activeJob.listing_title}` : 'No active route. Accept a job to begin.'}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
