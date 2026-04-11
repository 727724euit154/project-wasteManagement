"use client";
import { useEffect, useState } from 'react';
import { getMaterialBreakdown } from '@/services/api';
import { totalCarbonSavedKg, totalEnergySavedKwh, totalWeightKg, getWeightKg, detectMaterialKey, EMISSION_FACTORS } from '@/lib/carbonCalc';
import ImpactMetricCard from '@/components/ImpactMetricCard';
import CircularScoreBadge from '@/components/CircularScoreBadge';
import { Leaf, Box, Factory, Wind, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function EnvironmentalImpactDashboard() {
  const [summary, setSummary] = useState({ waste_reused_tons: 0, landfill_avoided_tons: 0, co2_saved_tons: 0, energy_saved_mwh: 0 });
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [circularityScore, setCircularityScore] = useState(0);

  useEffect(() => {
    const purchased: any[] = JSON.parse(localStorage.getItem('purchased_listings') || '[]');
    const allListings: any[] = JSON.parse(localStorage.getItem('user_listings') || '[]');

    const weightKg = totalWeightKg(purchased);
    const carbonKg = totalCarbonSavedKg(purchased);
    const energyKwh = totalEnergySavedKwh(purchased);

    setSummary({
      waste_reused_tons: weightKg / 1000,
      landfill_avoided_tons: weightKg / 1000,
      co2_saved_tons: carbonKg / 1000,
      energy_saved_mwh: energyKwh / 1000,
    });

    // Build material breakdown from real weight_kg per listing
    const materialTotals: Record<string, number> = {};
    purchased.forEach(l => {
      const mat = l.materials?.[0]?.type ?? detectMaterialKey(l);
      const w = getWeightKg(l);
      if (w > 0) materialTotals[mat] = (materialTotals[mat] || 0) + w;
    });
    const localBreakdown = Object.entries(materialTotals).map(([name, value]) => ({ name, value: Math.round(value) }));

    if (localBreakdown.length) {
      setBreakdown(localBreakdown);
    } else {
      const token = localStorage.getItem('access_token');
      if (token) getMaterialBreakdown().then(res => setBreakdown(res.data)).catch(() => {});
    }

    // Circularity score: % of all listed materials that were sold and had weight data
    const totalListed = allListings.length;
    const soldWithWeight = allListings.filter(l => l.status === 'sold' && getWeightKg(l) > 0).length;
    const base = totalListed > 0 ? Math.round((soldWithWeight / totalListed) * 60) + 30 : 0;
    setCircularityScore(Math.min(base + (purchased.length > 0 ? 10 : 0), 100));
  }, []);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-emerald-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <h1 className="text-4xl font-black tracking-tight mb-3 relative z-10">ESG Impact Control</h1>
        <p className="text-emerald-100 text-lg relative z-10 max-w-2xl font-medium">
          All metrics calculated from actual material weights entered during listing publication.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <ImpactMetricCard title="Total Waste Reused" value={summary.waste_reused_tons.toFixed(3)} unit="Tonnes" icon={<Box className="text-emerald-600 h-6 w-6" />} colorClass="bg-emerald-100" />
        <ImpactMetricCard title="Landfill Diverted" value={summary.landfill_avoided_tons.toFixed(3)} unit="Tonnes" icon={<Factory className="text-blue-600 h-6 w-6" />} colorClass="bg-blue-100" />
        <ImpactMetricCard title="CO₂ Saved" value={summary.co2_saved_tons.toFixed(4)} unit="Tonnes" icon={<Wind className="text-purple-600 h-6 w-6" />} colorClass="bg-purple-100" />
        <ImpactMetricCard title="Energy Saved" value={summary.energy_saved_mwh.toFixed(3)} unit="MWh" icon={<Zap className="text-amber-600 h-6 w-6" />} colorClass="bg-amber-100" />
      </div>

      {/* Emission factor reference */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Emission Factors Used (kg CO₂ / kg material)</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Object.entries(EMISSION_FACTORS).map(([mat, factor]) => (
            <div key={mat} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
              <div className="text-xs font-bold text-gray-500 capitalize mb-1">{mat}</div>
              <div className="text-sm font-black text-emerald-600">{factor}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Material Weight Breakdown</h2>
          <p className="text-sm text-gray-400 mb-6">kg of each material type diverted from landfill</p>
          {breakdown.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-300 text-sm">
              No weight data yet — publish listings with weight to see this chart.
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown}>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit=" kg" />
                  <Tooltip
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '1rem', border: '1px solid #e5e7eb' }}
                    formatter={(v: any) => [`${v} kg`, 'Weight']}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <h2 className="text-xl font-black text-gray-900 mb-2 relative z-10">Circularity Index</h2>
          <p className="text-gray-500 text-sm mb-6 relative z-10 font-medium">
            Based on % of listed materials sold with verified weight data.
          </p>
          <CircularScoreBadge score={circularityScore} />
          <div className="mt-8 pt-6 border-t border-gray-100 w-full text-left relative z-10">
            <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Calculation Method</div>
            <div className="flex justify-between text-sm text-gray-500 font-bold">
              <span>Weight-based ESG</span>
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
