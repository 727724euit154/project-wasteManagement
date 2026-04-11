"use client";
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapLayer'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center font-bold text-gray-400">
      Loading Map…
    </div>
  ),
});

interface Props {
  pickup: { lat: number; lng: number };
  deliveryAddress?: string | null;
  isActive?: boolean;
}

export default function RouteMap({ pickup, deliveryAddress, isActive }: Props) {
  if (!pickup) return null;
  return <MapComponent pickup={pickup} deliveryAddress={deliveryAddress} isActive={isActive} />;
}
