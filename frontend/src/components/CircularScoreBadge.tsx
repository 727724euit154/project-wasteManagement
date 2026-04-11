export default function CircularScoreBadge({ score }: { score: number }) {
  const dashArray = 283;
  const dashOffset = dashArray - (dashArray * score) / 100;
  
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90 drop-shadow-md">
        <circle cx="96" cy="96" r="45" className="stroke-gray-100" strokeWidth="14" fill="none" />
        <circle 
          cx="96" cy="96" r="45" 
          className="stroke-emerald-500 transition-all duration-1000 ease-out" 
          strokeWidth="14" fill="none" 
          strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="round" 
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
         <span className="text-4xl font-black text-gray-900 leading-none">{score}</span>
         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Score</span>
      </div>
    </div>
  );
}
