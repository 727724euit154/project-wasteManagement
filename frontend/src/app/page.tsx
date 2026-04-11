"use client";
import Link from 'next/link';
import { ArrowRight, Leaf, Truck, Factory, Recycle, BarChart3, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen cwi-bg flex flex-col overflow-x-hidden">

      {/* Navbar */}
      <nav className="cwi-nav fixed top-0 w-full z-50 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Recycle className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight text-white">CWI Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition">Sign In</Link>
          <Link href="/login?mode=register" className="cwi-btn-primary text-sm px-5 py-2 rounded-full font-semibold">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero — full-bleed construction site image */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 min-h-[92vh] overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1600"
            alt="Construction site"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,15,0.75) 0%, rgba(10,10,15,0.6) 50%, rgba(10,10,15,0.92) 100%)' }} />
          {/* Emerald tint */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="cwi-badge mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Platform Online · Circular Economy Network
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-[1.05] max-w-4xl">
            Turn Construction<br />
            Waste Into{' '}
            <span className="cwi-gradient-text">Value.</span>
          </h1>

          <p className="text-lg text-zinc-300 max-w-xl mb-10 leading-relaxed">
            AI-powered marketplace connecting demolition sites, recyclers, and drivers — closing the loop on construction waste with real-time ESG tracking.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/login?mode=register" className="cwi-btn-primary px-8 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 group">
              Get Started Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="cwi-btn-ghost px-8 py-3.5 rounded-2xl font-bold text-base">
              Sign In
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg w-full">
            {[
              { value: '12,400+', label: 'Tonnes Diverted' },
              { value: '340+', label: 'Active Listings' },
              { value: '98%', label: 'ESG Compliance' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-zinc-400 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white mb-3">Everything in one platform</h2>
          <p className="text-zinc-500 max-w-md mx-auto">From AI waste scanning to driver dispatch — the full circular economy stack.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: <Recycle className="h-6 w-6 text-emerald-400" />, color: 'emerald', title: 'AI Waste Classification', desc: 'YOLOv8-powered image scanning identifies material types and purity levels instantly from site photos.' },
            { icon: <BarChart3 className="h-6 w-6 text-blue-400" />, color: 'blue', title: 'Real-time ESG Tracking', desc: 'CO₂ offsets, energy savings, and landfill diversion calculated from actual material weights — not estimates.' },
            { icon: <Truck className="h-6 w-6 text-purple-400" />, color: 'purple', title: 'Driver Dispatch Network', desc: 'Drivers accept pickup bounties, navigate live routes, and mark deliveries complete from a single dashboard.' },
            { icon: <Factory className="h-6 w-6 text-amber-400" />, color: 'amber', title: 'Recycler Marketplace', desc: 'Recycling centers browse available material streams filtered by proximity, type, and purity grade.' },
            { icon: <ShieldCheck className="h-6 w-6 text-teal-400" />, color: 'teal', title: 'Waste Passports', desc: 'Every material transfer is certified with a tamper-proof digital passport for full chain-of-custody.' },
            { icon: <Zap className="h-6 w-6 text-rose-400" />, color: 'rose', title: 'PostGIS Routing', desc: 'ST_DistanceSphere algorithms match waste sources to the nearest recycler in real time.' },
          ].map(f => (
            <div key={f.title} className="cwi-card group p-6 rounded-2xl">
              <div className={`cwi-icon-box cwi-icon-${f.color} mb-4`}>{f.icon}</div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role cards */}
      <section className="px-6 pb-24 max-w-6xl mx-auto w-full">
        <div className="cwi-role-banner rounded-3xl p-10 md:p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-black text-white mb-3">Ready to close the loop?</h2>
              <p className="text-zinc-400 max-w-md">Join producers, consumers, drivers, and recyclers already building the circular economy.</p>
            </div>
            <Link href="/login?mode=register" className="cwi-btn-primary px-8 py-4 rounded-2xl font-bold text-base flex items-center gap-2 group shrink-0">
              Get Started Free
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-6 flex items-center justify-between text-xs text-zinc-600">
        <span className="font-bold text-zinc-500">CWI Platform</span>
        <span>Construction Waste Intelligence · Circular Economy</span>
      </footer>
    </div>
  );
}
