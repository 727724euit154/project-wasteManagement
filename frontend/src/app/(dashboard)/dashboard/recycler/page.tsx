"use client";
import Link from 'next/link';
import { ArrowRight, Truck, TrendingUp, Search, Settings } from 'lucide-react';

export default function RecyclerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Recycler Hub</h1>
        <p className="text-gray-500 mt-1">Discover raw materials and maximize your processing throughput.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-center flex gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Search className="h-6 w-6"/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Nearby Listings</p>
            <h3 className="text-2xl font-bold text-gray-900">42</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-center flex gap-4">
          <div className="bg-purple-100 p-4 rounded-full text-purple-600"><TrendingUp className="h-6 w-6"/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Materials Purchased</p>
            <h3 className="text-2xl font-bold text-gray-900">14 Orders</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-center flex gap-4">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><Truck className="h-6 w-6"/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Received Capacity</p>
            <h3 className="text-2xl font-bold text-gray-900">12,500 kg</h3>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/recycler/marketplace" className="block group">
          <div className="bg-purple-900 h-full p-8 text-white rounded-2xl shadow-md hover:shadow-lg transition relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <h3 className="text-2xl font-bold mb-2 flex justify-between items-center z-10 relative">Browse Procurement <ArrowRight className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" /></h3>
            <p className="text-purple-200 text-sm z-10 relative">Search the ecosystem for available resources intercepting waste bound for landfills ranked by geographic proximity.</p>
          </div>
        </Link>
        <Link href="#" className="block group">
          <div className="bg-white border-2 border-gray-200 h-full p-8 rounded-2xl hover:border-purple-500 transition">
            <h3 className="text-2xl font-bold mb-2 text-gray-800 flex justify-between items-center">Facility Configuration <Settings className="h-6 w-6 text-gray-400 group-hover:text-purple-500 transform group-hover:rotate-45 transition-transform" /></h3>
            <p className="text-gray-500 text-sm">Update your capacity limits and accepted material categories for our AI distribution matchmaking engine.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
