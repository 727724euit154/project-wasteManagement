"use client";
import { OS_ANALYTICS_MONTHLY, OS_MATERIAL_BREAKDOWN, OS_STATS } from '@/lib/osDummyData';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, Leaf, DollarSign, Package } from 'lucide-react';

const METRIC_ICONS = [Package, DollarSign, Leaf, TrendingUp];

export default function OSAnalyticsPage() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">ESG performance and circular economy metrics.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {OS_STATS.map((stat, i) => {
          const Icon = METRIC_ICONS[i];
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                  <Icon className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-xs font-semibold text-gray-500">{stat.label}</p>
              </div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">{stat.delta} this month</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Monthly Activity</h2>
          <p className="text-xs text-gray-400 mb-6">Tonnes uploaded vs sold · last 6 months</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={OS_ANALYTICS_MONTHLY} barGap={4}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="uploaded" name="Uploaded (t)" fill="#e5e7eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="sold"     name="Sold (t)"     fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
            {[{ color: '#e5e7eb', label: 'Uploaded' }, { color: '#10b981', label: 'Sold' }].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Donut chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="font-bold text-gray-900 mb-1">Material Mix</h2>
          <p className="text-xs text-gray-400 mb-4">By volume %</p>
          <div className="flex-1 flex items-center justify-center">
            <PieChart width={200} height={200}>
              <Pie data={OS_MATERIAL_BREAKDOWN} cx={100} cy={100} innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {OS_MATERIAL_BREAKDOWN.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
            </PieChart>
          </div>
          <div className="space-y-2 mt-2">
            {OS_MATERIAL_BREAKDOWN.map(m => (
              <div key={m.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m.color }} />
                  <span className="text-gray-600">{m.name}</span>
                </div>
                <span className="font-bold text-gray-800">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carbon trend */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-1">Carbon Offset Trend</h2>
        <p className="text-xs text-gray-400 mb-6">kg CO₂ saved per month</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={OS_ANALYTICS_MONTHLY}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="carbon" name="CO₂ Saved (kg)" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
