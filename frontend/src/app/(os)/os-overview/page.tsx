"use client";
import { OS_STATS, OS_RECENT_UPLOADS } from '@/lib/osDummyData';
import { TrendingUp, ArrowUpRight, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  blue:    'bg-blue-50 text-blue-600 border-blue-100',
  teal:    'bg-teal-50 text-teal-600 border-teal-100',
  violet:  'bg-violet-50 text-violet-600 border-violet-100',
};

const STATUS_MAP: Record<string, { label: string; icon: any; cls: string }> = {
  listed:  { label: 'Listed',  icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50' },
  pending: { label: 'Pending', icon: Loader2,      cls: 'text-amber-600 bg-amber-50' },
  sold:    { label: 'Sold',    icon: ArrowUpRight,  cls: 'text-blue-600 bg-blue-50' },
};

export default function OSOverviewPage() {
  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Your circular economy performance at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {OS_STATS.map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${COLOR_MAP[stat.color]}`}>
                {stat.delta}
              </span>
            </div>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.unit}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/os-upload',      label: 'Upload Waste Photo',  desc: 'AI classifies in seconds',        cta: 'Upload Now',    bg: 'bg-emerald-600 text-white' },
          { href: '/os-marketplace', label: 'Browse Marketplace',  desc: '38 active listings nearby',       cta: 'View Listings', bg: 'bg-white border border-gray-200 text-gray-900' },
          { href: '/os-analytics',   label: 'ESG Report',          desc: 'Carbon offset this month: 1.8t',  cta: 'View Report',   bg: 'bg-white border border-gray-200 text-gray-900' },
        ].map(({ href, label, desc, cta, bg }) => (
          <Link key={href} href={href} className={`${bg} rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col gap-2`}>
            <p className="font-bold text-sm">{label}</p>
            <p className={`text-xs ${bg.includes('emerald') ? 'text-emerald-100' : 'text-gray-500'}`}>{desc}</p>
            <span className={`text-xs font-semibold mt-2 flex items-center gap-1 ${bg.includes('emerald') ? 'text-white' : 'text-emerald-600'}`}>
              {cta} <ArrowUpRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>

      {/* Recent uploads table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recent Uploads</h2>
          <Link href="/os-results" className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {OS_RECENT_UPLOADS.map(item => {
            const s = STATUS_MAP[item.status];
            const Icon = s.icon;
            return (
              <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.material}</p>
                  <p className="text-xs text-gray-400">{item.weight} · {item.confidence}% confidence</p>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>
                  <Icon className="w-3 h-3" /> {s.label}
                </span>
                <span className="text-xs text-gray-400 hidden sm:block shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3 inline" /> {item.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
