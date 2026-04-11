"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createListing } from '@/services/api';
import { getStore, setStore } from '@/lib/storage';

export default function CreateListingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '', description: '',
    latitude: 40.7128, longitude: -74.0060,
    price: 0, weight_kg: 0,
    company_name: '', contact_number: '',
    materials: [] as any[],
  });

  useEffect(() => {
    const stored = localStorage.getItem('last_scan_materials');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setFormData(prev => ({ ...prev, materials: parsed, title: `${parsed[0].type} - ${parsed[0].percentage}% Pure` }));
        }
      } catch {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newListing = {
      id: crypto.randomUUID(),
      contractor_id: crypto.randomUUID(),
      title: formData.title,
      description: formData.description,
      status: 'available',
      created_at: new Date().toISOString(),
      latitude: formData.latitude,
      longitude: formData.longitude,
      price: formData.price,
      weight_kg: formData.weight_kg,
      company_name: formData.company_name,
      contact_number: formData.contact_number,
      materials: formData.materials,
    };

    // Save to this user's scoped listings
    const userListings = getStore<any[]>('user_listings', []);
    setStore('user_listings', [...userListings, newListing]);

    // Also save to global all_listings so marketplace shows it to everyone
    const allListings: any[] = JSON.parse(localStorage.getItem('all_listings') || '[]');
    localStorage.setItem('all_listings', JSON.stringify([...allListings, newListing]));

    localStorage.removeItem('last_scan_materials');

    const token = localStorage.getItem('access_token');
    if (token) {
      createListing({
        title: formData.title, description: formData.description,
        location: { latitude: formData.latitude, longitude: formData.longitude },
        status: 'available', price: formData.price,
        company_name: formData.company_name, contact_number: formData.contact_number,
      }).catch(() => {});
    }
    router.push('/marketplace');
  };

  return (
    <div className="max-w-2xl mx-auto cwi-auth-card p-8 rounded-2xl">
      <h1 className="text-3xl font-bold text-white mb-2">Publish Resource</h1>
      <p className="text-zinc-500 mb-8 border-b border-white/5 pb-6">Post reusable structural fragments to the public marketplace.</p>

      {formData.materials.length > 0 && (
        <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <h4 className="text-sm font-bold text-emerald-400 mb-3">Primary Material Detected</h4>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-white">{formData.materials[0].type}</span>
              <p className="text-sm text-zinc-500 mt-1">High-purity construction waste material</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-400">{formData.materials[0].percentage}%</div>
              <div className="text-xs text-zinc-500">Confidence</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Listing Title</label>
          <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className="cwi-input w-full rounded-xl px-4 py-3 outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Latitude</label>
            <input type="number" step="any" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })} className="cwi-input w-full rounded-xl px-4 py-3 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Longitude</label>
            <input type="number" step="any" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })} className="cwi-input w-full rounded-xl px-4 py-3 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Description</label>
          <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="cwi-input w-full rounded-xl px-4 py-3 outline-none" placeholder="E.g., 20 tons of crushed concrete ready for pickup..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Price ($)</label>
            <input type="number" step="0.01" value={isNaN(formData.price) ? '' : formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} required className="cwi-input w-full rounded-xl px-4 py-3 outline-none" placeholder="USD" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Total Weight (kg)</label>
            <input type="number" step="0.01" value={isNaN(formData.weight_kg) ? '' : formData.weight_kg} onChange={e => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || 0 })} required className="cwi-input w-full rounded-xl px-4 py-3 outline-none" placeholder="kg" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Company Name</label>
          <input type="text" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} required className="cwi-input w-full rounded-xl px-4 py-3 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1.5">Contact Number</label>
          <input type="tel" value={formData.contact_number} onChange={e => setFormData({ ...formData, contact_number: e.target.value })} required className="cwi-input w-full rounded-xl px-4 py-3 outline-none" />
        </div>
        <button type="submit" className="cwi-btn-primary w-full py-3.5 rounded-xl font-bold mt-2">
          Publish to Marketplace
        </button>
      </form>
    </div>
  );
}
