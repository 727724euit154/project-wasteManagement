import Link from 'next/link';

export default function RecyclerListingCard({ listing }: { listing: any }) {
  return (
    <Link href={`/recycler/listing/${listing.id}`} className="block">
      <div className="border rounded-2xl p-4 shadow-sm hover:shadow-lg transition bg-white group cursor-pointer relative overflow-hidden">
        <div className="absolute top-6 right-6 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-extrabold text-gray-800 z-20 shadow-md flex items-center gap-1 border border-gray-100">
          <span className="text-purple-600">📍</span> {listing.distance_km ? `${listing.distance_km.toFixed(1)} km` : 'Near'}
        </div>
        <div className="w-full h-44 bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
          <img 
            src={listing.image || 'https://images.unsplash.com/photo-1595822363143-6df79ceb6d5c?auto=format&fit=crop&q=80&w=400'} 
            alt="Waste Resource" 
            className="object-cover w-full h-full group-hover:scale-105 transition duration-700" 
          />
        </div>
        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{listing.title}</h3>
        <p className="text-gray-500 text-sm mt-1 mb-4 line-clamp-2 min-h-[40px] leading-relaxed">{listing.description}</p>
        
        <div className="flex border-t pt-4 justify-between items-center text-sm">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Availability</span>
            <span className={`font-semibold uppercase tracking-wider text-[11px] ${listing.status === 'sold' ? 'text-red-500' : 'text-emerald-600'}`}>
              {listing.status}
            </span>
          </div>
          <button className="bg-purple-50 text-purple-700 px-5 py-1.5 rounded-lg font-bold hover:bg-purple-100 transition shadow-sm">
            Evaluate
          </button>
        </div>
      </div>
    </Link>
  );
}
