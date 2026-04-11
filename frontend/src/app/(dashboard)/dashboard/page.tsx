"use client";
import { useEffect, useState } from 'react';
import { totalCarbonSavedKg } from '@/lib/carbonCalc';
import Link from 'next/link';
import { Leaf, Box, TrendingUp, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const [totalListings, setTotalListings] = useState(0);
  const [materialsSoldKg, setMaterialsSoldKg] = useState(0);
  const [carbonSavedKg, setCarbonSavedKg] = useState(0);

  useEffect(() => {
    const listings: any[] = JSON.parse(localStorage.getItem('user_listings') || '[]');
    setTotalListings(listings.length);

    // Revenue from producer's own sold listings — not purchases
    const sold = listings.filter((l: any) => l.status === 'sold');
    const revenue = sold.reduce((sum: number, l: any) => sum + (parseFloat(l.price) || 0), 0);
    setMaterialsSoldKg(revenue);
    setCarbonSavedKg(totalCarbonSavedKg(sold));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Contractor Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your waste streams and environmental impact.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-center flex gap-4">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><Box className="h-6 w-6"/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Listings</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalListings}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-center flex gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600"><TrendingUp className="h-6 w-6"/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Materials Sold</p>
            <h3 className="text-2xl font-bold text-gray-900">${materialsSoldKg.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 items-center flex gap-4">
          <div className="bg-teal-100 p-4 rounded-full text-teal-600"><Leaf className="h-6 w-6"/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Carbon Saved</p>
            <h3 className="text-2xl font-bold text-gray-900">{carbonSavedKg.toFixed(1)} kg CO₂</h3>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/scan-waste" className="block group">
          <div className="bg-emerald-600 h-full p-6 text-white rounded-2xl shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2 flex justify-between items-center">Scan Waste <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" /></h3>
            <p className="text-emerald-100 text-sm">Use AI to automatically classify materials directly from your site photos.</p>
          </div>
        </Link>
        <Link href="/create-listing" className="block group">
          <div className="bg-white border-2 border-gray-200 h-full p-6 rounded-2xl hover:border-emerald-500 transition">
            <h3 className="text-xl font-bold mb-2 text-gray-800 flex justify-between items-center">Create Listing <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-transform" /></h3>
            <p className="text-gray-500 text-sm">Manually post structural components to the open marketplace.</p>
          </div>
        </Link>
        <Link href="/marketplace" className="block group">
          <div className="bg-gray-900 border-2 border-gray-900 h-full p-6 rounded-2xl hover:bg-gray-800 transition">
            <h3 className="text-xl font-bold mb-2 text-white flex justify-between items-center">View Marketplace <ArrowRight className="h-5 w-5 text-gray-400 transform group-hover:translate-x-1 transition-transform" /></h3>
            <p className="text-gray-400 text-sm">Search the ecosystem for available resources and buyers dynamically.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
