import Link from 'next/link';
import { ArrowRight, Leaf, Zap, Shield, BarChart3 } from 'lucide-react';

const FEATURES = [
  { icon: Zap,       title: 'AI Classification',  desc: 'MobileNetV3 identifies 12 material types from site photos in under 2 seconds.' },
  { icon: BarChart3, title: 'ESG Analytics',       desc: 'Real-time carbon offset tracking with IPCC-grade emission factor calculations.' },
  { icon: Shield,    title: 'Circular Marketplace',desc: 'Connect demolition waste directly to verified recyclers and buyers.' },
];

export default function OSLandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="h-16 border-b border-gray-100 flex items-center px-8 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-gray-900">Circular Construction OS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/os-login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">Sign In</Link>
          <Link href="/os-signup" className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Now in Production
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-6 max-w-4xl">
          The OS for<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">
            Construction Waste
          </span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed">
          Upload site photos. AI classifies materials. List on the circular marketplace. Track your ESG impact — all in one platform.
        </p>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link href="/os-signup" className="bg-gray-900 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition shadow-lg flex items-center gap-2">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/os-overview" className="border border-gray-200 text-gray-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition">
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 bg-gray-50 px-8 py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5 border border-emerald-100">
                <Icon className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
