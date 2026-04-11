"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/UserContext';
import { Camera, LayoutDashboard, Store, Truck, Leaf, PlusCircle, ShoppingBag, Package } from 'lucide-react';

const NAV: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
  producer: [
    { href: '/producer', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/scan-waste', label: 'Scan Waste', icon: <Camera className="h-4 w-4" /> },
    { href: '/create-listing', label: 'New Listing', icon: <PlusCircle className="h-4 w-4" /> },
    { href: '/marketplace', label: 'Marketplace', icon: <Store className="h-4 w-4" /> },
    { href: '/dashboard/impact', label: 'ESG Impact', icon: <Leaf className="h-4 w-4" /> },
  ],
  consumer: [
    { href: '/consumer', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/marketplace', label: 'Marketplace', icon: <Store className="h-4 w-4" /> },
    { href: '/consumer', label: 'My Purchases', icon: <ShoppingBag className="h-4 w-4" /> },
  ],
  driver: [
    { href: '/driver', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/logistics/jobs', label: 'Available Jobs', icon: <Package className="h-4 w-4" /> },
    { href: '/driver', label: 'My Jobs', icon: <Truck className="h-4 w-4" /> },
  ],
  recycler: [
    { href: '/dashboard/recycler', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/recycler/marketplace', label: 'Procurement', icon: <Store className="h-4 w-4" /> },
    { href: '/dashboard/impact', label: 'ESG Impact', icon: <Leaf className="h-4 w-4" /> },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useUser();
  const links = NAV[role] ?? NAV.producer;

  return (
    <aside className="cwi-sidebar w-64 h-screen fixed pt-20 flex flex-col">
      <div className="p-3 flex-1">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-2">Navigation</p>
        <div className="space-y-0.5">
          {links.map(l => (
            <Link key={l.href + l.label} href={l.href}
              className={`cwi-sidebar-link ${pathname === l.href ? 'active' : ''}`}>
              {l.icon} {l.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
