import { ReactNode } from 'react';

export default function ImpactMetricCard({ title, value, unit, icon, colorClass }: { title: string, value: number|string, unit: string, icon: ReactNode, colorClass: string }) {
  return (
    <div className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:-translate-y-1 hover:shadow-md transition-all`}>
       <div className={`p-4 rounded-full ${colorClass}`}>{icon}</div>
       <div>
         <p className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">{title}</p>
         <h3 className="text-3xl font-extrabold text-gray-900 mt-1.5">{value} <span className="text-base text-gray-400 font-bold ml-1">{unit}</span></h3>
       </div>
    </div>
  );
}
