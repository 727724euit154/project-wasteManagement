"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { getStore, setStore } from '@/lib/storage';
import { totalCarbonSavedKg, totalWeightKg } from '@/lib/carbonCalc';
import { api } from '@/services/api';
import { Box, TrendingUp, Leaf, PlusCircle, Store, Camera, ArrowRight, Package, Pencil, Trash2, X, Check } from 'lucide-react';

export default function ProducerDashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => { loadListings(); }, []);

  const loadListings = () => setListings(getStore<any[]>('user_listings', []));

  const handleDelete = (id: string) => {
    if (!confirm('Delete this listing?')) return;
    const updated = listings.filter(l => l.id !== id);
    setStore('user_listings', updated);
    // Also remove from global
    const all: any[] = JSON.parse(localStorage.getItem('all_listings') || '[]');
    localStorage.setItem('all_listings', JSON.stringify(all.filter(l => l.id !== id)));
    setListings(updated);
    // Try API
    const token = localStorage.getItem('access_token');
    if (token) api.delete(`/listings/${id}`).catch(() => {});
  };

  const startEdit = (l: any) => {
    setEditingId(l.id);
    setEditForm({ title: l.title, description: l.description, price: l.price, weight_kg: l.weight_kg, status: l.status, company_name: l.company_name, contact_number: l.contact_number });
  };

  const saveEdit = (id: string) => {
    const updated = listings.map(l => l.id === id ? { ...l, ...editForm } : l);
    setStore('user_listings', updated);
    const all: any[] = JSON.parse(localStorage.getItem('all_listings') || '[]');
    localStorage.setItem('all_listings', JSON.stringify(all.map(l => l.id === id ? { ...l, ...editForm } : l)));
    setListings(updated);
    setEditingId(null);
    const token = localStorage.getItem('access_token');
    if (token) api.put(`/listings/${id}`, editForm).catch(() => {});
  };

  const sold = listings.filter(l => l.status === 'sold');
  const available = listings.filter(l => l.status === 'available');
  const totalRevenue = sold.reduce((s, l) => s + (parseFloat(l.price) || 0), 0);
  const weightSoldKg = totalWeightKg(sold);
  const carbonSavedKg = totalCarbonSavedKg(sold);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">

        <div className="rounded-3xl p-10 text-white mb-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <h1 className="text-4xl font-black tracking-tight mb-2 relative z-10">Producer Dashboard</h1>
          <p className="text-emerald-200 text-lg relative z-10">Manage your waste listings — create, edit, delete.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Listings', value: available.length, icon: <Box className="h-5 w-5" />, color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)' },
            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: <TrendingUp className="h-5 w-5" />, color: 'text-blue-400', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Weight Sold', value: `${(weightSoldKg / 1000).toFixed(2)} t`, icon: <Package className="h-5 w-5" />, color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)' },
            { label: 'CO₂ Saved', value: `${(carbonSavedKg / 1000).toFixed(2)} t`, icon: <Leaf className="h-5 w-5" />, color: 'text-teal-400', bg: 'rgba(20,184,166,0.1)' },
          ].map(s => (
            <div key={s.label} className="cwi-auth-card rounded-2xl p-5 flex items-center gap-4">
              <div className="p-3 rounded-full" style={{ background: s.bg }}><span className={s.color}>{s.icon}</span></div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link href="/scan-waste" className="group cwi-card p-6 rounded-2xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Camera className="h-6 w-6 mb-3 text-emerald-400" />
            <h3 className="font-bold text-lg text-white flex justify-between items-center">Scan Waste <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition-transform" /></h3>
            <p className="text-zinc-500 text-sm mt-1">AI-classify materials from site photos.</p>
          </Link>
          <Link href="/create-listing" className="group cwi-card p-6 rounded-2xl">
            <PlusCircle className="h-6 w-6 mb-3 text-zinc-400" />
            <h3 className="font-bold text-lg text-white flex justify-between items-center">New Listing <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform" /></h3>
            <p className="text-zinc-500 text-sm mt-1">Post materials to the marketplace.</p>
          </Link>
          <Link href="/marketplace" className="group cwi-card p-6 rounded-2xl">
            <Store className="h-6 w-6 mb-3 text-zinc-400" />
            <h3 className="font-bold text-lg text-white flex justify-between items-center">Marketplace <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:translate-x-1 transition-transform" /></h3>
            <p className="text-zinc-500 text-sm mt-1">View all available resources.</p>
          </Link>
        </div>

        {/* Listings */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">My Listings</h2>
          <Link href="/create-listing" className="cwi-btn-primary px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> New
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="cwi-auth-card rounded-2xl border-dashed p-12 text-center">
            <Box className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">No listings yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map(l => (
              <div key={l.id} className="cwi-auth-card rounded-2xl p-5">
                {editingId === l.id ? (
                  // Edit form inline
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Title</label>
                        <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="cwi-input w-full rounded-xl px-3 py-2 text-sm outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Status</label>
                        <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="cwi-input w-full rounded-xl px-3 py-2 text-sm outline-none">
                          <option value="available">Available</option>
                          <option value="sold">Sold</option>
                          <option value="reserved">Reserved</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">Description</label>
                      <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={2} className="cwi-input w-full rounded-xl px-3 py-2 text-sm outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Price ($)</label>
                        <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) })} className="cwi-input w-full rounded-xl px-3 py-2 text-sm outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 mb-1 block">Weight (kg)</label>
                        <input type="number" value={editForm.weight_kg} onChange={e => setEditForm({ ...editForm, weight_kg: parseFloat(e.target.value) })} className="cwi-input w-full rounded-xl px-3 py-2 text-sm outline-none" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => saveEdit(l.id)} className="cwi-btn-primary px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1"><Check className="h-4 w-4" /> Save</button>
                      <button onClick={() => setEditingId(null)} className="cwi-btn-ghost px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1"><X className="h-4 w-4" /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white truncate">{l.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${l.status === 'available' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-zinc-500'}`}>{l.status}</span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{l.description}</p>
                      <div className="flex gap-4 mt-1 text-sm">
                        <span className="text-emerald-400 font-bold">${parseFloat(l.price || 0).toLocaleString()}</span>
                        <span className="text-zinc-600">{l.weight_kg ? `${l.weight_kg} kg` : '—'}</span>
                        <span className="text-zinc-600">{l.company_name || '—'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(l)} className="p-2 rounded-xl text-zinc-400 hover:text-white transition" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(l.id)} className="p-2 rounded-xl text-zinc-400 hover:text-red-400 transition" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
