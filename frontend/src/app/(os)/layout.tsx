"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Upload, FileSearch, ShoppingBag,
  BarChart3, Settings, LogOut, Menu, X, Leaf, Bell, ChevronDown,
} from 'lucide-react';
import { OS_USER } from '@/lib/osDummyData';

const NAV = [
  { href: '/os-overview', label: 'Overview',    icon: LayoutDashboard },
  { href: '/os-upload',   label: 'Upload Waste', icon: Upload },
  { href: '/os-results',  label: 'Results',      icon: FileSearch },
  { href: '/os-marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/os-analytics', label: 'Analytics',   icon: BarChart3 },
];

export default function OSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-50 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 leading-none">Circular OS</p>
              <p className="text-[10px] text-gray-400 font-medium">Construction Intelligence</p>
            </div>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-600' : 'text-gray-400'}`} />
                {label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-0.5 shrink-0">
          <Link href="/os-overview" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition">
            <Settings className="w-4 h-4 text-gray-400" /> Settings
          </Link>
          <Link href="/os" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition">
            <LogOut className="w-4 h-4" /> Sign Out
          </Link>
          {/* User pill */}
          <div className="flex items-center gap-3 px-3 py-3 mt-2 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-black shrink-0">
              {OS_USER.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{OS_USER.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{OS_USER.role} · {OS_USER.plan}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 shrink-0 sticky top-0 z-30">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex-1" />
          <button className="relative p-2 rounded-lg hover:bg-gray-50 transition">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-gray-100 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5 transition">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-black">
              {OS_USER.avatar}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{OS_USER.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
