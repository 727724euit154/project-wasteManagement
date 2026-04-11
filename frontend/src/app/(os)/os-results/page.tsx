"use client";
import { OS_RESULTS_SAMPLE } from '@/lib/osDummyData';
import { CheckCircle2, Clock, ArrowUpRight, Leaf, DollarSign, Package } from 'lucide-react';
import Link from 'next/link';

const STATUS_STYLE: Record<string, string> = {
  listed:  'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  sold:    'bg-blue-50 text-blue-700 border-blue-100',
};

const BAR_COLOR: Record<string, string> = {
  'Metal Waste':    'bg-slate-500',
  'Concrete Waste': 'bg-gray-400',
  'Wood Waste':     'bg-amber-500',
  'Sand':           'bg-yellow-400',
  'Glass Waste':    'bg-cyan-500',
  'Rubber Waste':   'bg-neutral-600',
  'Insulation Waste': 'bg-pink-400',
};

export default function OSResultsPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Results</h1>
          <p className="text-sm text-gray-500 mt-1">AI classification results for your uploaded waste photos.</p>
        </div>
        <Link href="/os-upload" className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-sm flex items-center gap-2">
          + New Upload
        </Link>
      </div>

      <div className="space-y-4">
        {OS_RESULTS_SAMPLE.map(result => (
          <div key={result.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{result.material}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{result.filename}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLE[result.status]}`}>
                  {result.status}
                </span>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {[
                  { icon: CheckCircle2, label: 'Confidence',    value: `${result.confidence}%`,  color: 'text-emerald-600' },
                  { icon: Package,      label: 'Est. Weight',   value: result.weight_est,         color: 'text-gray-700' },
                  { icon: Leaf,         label: 'Carbon Saved',  value: `${result.carbon_saved} kg`, color: 'text-teal-600' },
                  { icon: DollarSign,   label: 'Est. Value',    value: result.value_est,          color: 'text-blue-600' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className={`text-sm font-black ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Material breakdown bars */}
              <div className="space-y-2">
                {result.breakdown.map(b => (
                  <div key={b.type} className="flex items-center gap-3">
                    <p className="text-xs text-gray-500 w-36 shrink-0 truncate">{b.type}</p>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${BAR_COLOR[b.type] ?? 'bg-emerald-500'}`}
                        style={{ width: `${b.pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-8 text-right">{b.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Analysed just now</p>
              <Link href="/os-marketplace" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                List on Marketplace <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
