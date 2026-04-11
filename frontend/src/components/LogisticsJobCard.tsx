import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function LogisticsJobCard({ job, onAccept }: { job: any, onAccept?: (id: string) => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{job.listing_title}</h3>
          <span className="text-[11px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-bold tracking-widest uppercase">ID: {job.id.substring(0,8)}</span>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-black shadow-sm border border-emerald-100">
          ${job.payment_offered_usd}
        </div>
      </div>
      
      <div className="space-y-4 mb-6 relative pl-1">
        <div className="absolute left-[15px] top-6 bottom-6 w-[2px] bg-gray-200 z-10"></div>
        <div className="flex gap-4 relative z-20 items-center">
          <div className="bg-blue-100 p-2 rounded-full h-max border-2 border-white shadow-sm"><MapPin className="h-4 w-4 text-blue-600" /></div>
          <div>
             <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Pickup Zone</p>
             <p className="text-sm font-semibold text-gray-700">({job.pickup.lat.toFixed(4)}, {job.pickup.lng.toFixed(4)})</p>
          </div>
        </div>
        <div className="flex gap-4 relative z-20 items-center">
          <div className="bg-purple-100 p-2 rounded-full h-max border-2 border-white shadow-sm"><MapPin className="h-4 w-4 text-purple-600" /></div>
          <div>
             <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-0.5">Dropoff Dest</p>
             <p className="text-sm font-semibold text-gray-700">({job.dropoff.lat.toFixed(4)}, {job.dropoff.lng.toFixed(4)})</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {onAccept && job.status === 'AVAILABLE' && (
          <button onClick={() => onAccept(job.id)} className="flex-1 bg-gray-900 text-white rounded-xl py-2.5 font-bold hover:bg-gray-800 transition text-sm shadow cursor-pointer">
            Accept Job
          </button>
        )}
        <Link href={`/logistics/routes/${job.id}`} className="flex-1 text-center bg-gray-100 text-gray-800 rounded-xl py-2.5 font-bold hover:bg-gray-200 transition text-sm cursor-pointer">
          View Route
        </Link>
      </div>
    </div>
  );
}
