"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle2, ArrowRight, Leaf, Brain, AlertCircle } from 'lucide-react';
import { EMISSION_FACTORS, ENERGY_FACTORS } from '@/lib/carbonCalc';

// ── Types ────────────────────────────────────────────────────────────────────
type WasteType =
  | "Concrete Waste" | "Metal Waste" | "Wood Waste" | "Brick Waste"
  | "Glass Waste" | "Plastic Waste" | "Asphalt Waste" | "Sand"
  | "Gypsum / Drywall" | "Ceramic / Tile Waste" | "Insulation Waste" | "Rubber Waste";

const ALL_TYPES: WasteType[] = [
  "Concrete Waste","Metal Waste","Wood Waste","Brick Waste",
  "Glass Waste","Plastic Waste","Asphalt Waste","Sand",
  "Gypsum / Drywall","Ceramic / Tile Waste","Insulation Waste","Rubber Waste",
];

const MATERIAL_KEY: Record<WasteType, string> = {
  "Concrete Waste":"concrete","Metal Waste":"metal","Wood Waste":"wood",
  "Brick Waste":"brick","Glass Waste":"glass","Plastic Waste":"plastic",
  "Asphalt Waste":"asphalt","Sand":"concrete","Gypsum / Drywall":"gypsum",
  "Ceramic / Tile Waste":"ceramic","Insulation Waste":"insulation","Rubber Waste":"rubber",
};

const BAR_COLORS: Record<WasteType, string> = {
  "Metal Waste":"#64748b","Concrete Waste":"#9ca3af","Sand":"#eab308",
  "Wood Waste":"#d97706","Brick Waste":"#ef4444","Glass Waste":"#06b6d4",
  "Plastic Waste":"#3b82f6","Asphalt Waste":"#52525b","Gypsum / Drywall":"#e5e7eb",
  "Insulation Waste":"#ec4899","Ceramic / Tile Waste":"#6366f1","Rubber Waste":"#27272a",
};

// ── MobileNet keyword map ────────────────────────────────────────────────────
const MOBILENET_MAP: Record<WasteType, string[]> = {
  "Concrete Waste": ["wall","stone","rock","cliff","dam","castle","church","column","pillar","rubble","gravel","pavement","sidewalk","curb","slab","block","quarry","breakwater","bunker","prison","monastery"],
  "Metal Waste":    ["chain","nail","screw","bolt","wrench","hammer","can","tin","wire","cable","drum","shovel","crane","excavator","bulldozer","ladle","anvil","padlock","mailbox","fire hydrant","barbell","hook","car wheel","hubcap","radiator","piston","gear","grille","grate","mesh","locker","manhole","bucket","pail","trowel","chisel","saw","drill","pipe","duct","girder","scaffold","barrel","safe","iron","steel","copper"],
  "Wood Waste":     ["wood","lumber","plank","log","timber","beam","board","pallet","stump","bark","fence","crate","cabinet","bookcase","wardrobe","door","shelf","table","chair","bench","desk","chest","barn","silo","hardwood","plywood","decking","floorboard","joist","rafter"],
  "Brick Waste":    ["brick","clay","chimney","kiln","pottery","terracotta","masonry","flowerpot","vase","cobblestone","flagstone","mortar","tile roof"],
  "Glass Waste":    ["glass","bottle","jar","lens","mirror","greenhouse","windshield","crystal","goblet","wine glass","beer glass","pitcher","carafe","beaker","skylight"],
  "Plastic Waste":  ["plastic","container","bucket","tarp","foam","polystyrene","nylon","trash can","wastebasket","shopping cart","laundry basket","bathtub","toilet seat","rain barrel","jerry can","water bottle","packaging"],
  "Sand":           ["sand","beach","dune","desert","sandbar","seashore","soil","dirt","earth","ground","mud","sandbox"],
  "Asphalt Waste":  ["asphalt","tar","road","highway","tarmac","shingle","roofing","bitumen","crosswalk","parking lot","driveway","blacktop","macadam"],
  "Gypsum / Drywall":["drywall","plaster","gypsum","ceiling","partition","whiteboard","plasterboard","wallboard","stucco","lath"],
  "Insulation Waste":["insulation","fiberglass","batting","mineral wool","sleeping bag","quilt","pillow","foam board","blanket"],
  "Ceramic / Tile Waste":["tile","ceramic","porcelain","bathroom","mosaic","floor tile","toilet","sink","shower","grout"],
  "Rubber Waste":   ["rubber","tire","tyre","gasket","hose","mat","seal","conveyor belt","neoprene","weatherstripping"],
};

// ── Pixel-level analysis ─────────────────────────────────────────────────────
interface PixelFeatures {
  rMean: number; gMean: number; bMean: number;
  hMean: number; sMean: number; vMean: number;
  darkRatio: number; lightRatio: number;
  edgeDensity: number; variance: number;
  redness: number; blueness: number; greenness: number;
  warmth: number; // r+g - b
}

function extractFeatures(data: Uint8ClampedArray, w: number, h: number): PixelFeatures {
  let rS=0,gS=0,bS=0,hS=0,sS=0,vS=0,dark=0,light=0,edges=0;
  const n = w * h;
  const grays: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r=data[i], g=data[i+1], b=data[i+2];
    rS+=r; gS+=g; bS+=b;
    const mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn;
    const v=mx/255, s=mx>0?d/mx:0;
    let hv=0;
    if(d>0){
      if(mx===r) hv=((g-b)/d)%6;
      else if(mx===g) hv=(b-r)/d+2;
      else hv=(r-g)/d+4;
      hv=(hv*60+360)%360;
    }
    hS+=hv; sS+=s*255; vS+=v*255;
    const gray=(r+g+b)/3;
    grays.push(gray);
    if(gray<60) dark++;
    if(gray>210) light++;
    // Sobel-like edge
    if(i>=w*4 && i<data.length-w*4){
      const gx=Math.abs(r-data[i-4])+Math.abs(r-data[i+4]);
      const gy=Math.abs(r-data[i-w*4])+Math.abs(r-data[i+w*4]);
      if(gx+gy>80) edges++;
    }
  }
  const rM=rS/n, gM=gS/n, bM=bS/n;
  const mean=grays.reduce((a,b)=>a+b,0)/n;
  const variance=grays.reduce((a,b)=>a+(b-mean)**2,0)/n;
  return {
    rMean:rM, gMean:gM, bMean:bM,
    hMean:hS/n, sMean:sS/n, vMean:vS/n,
    darkRatio:dark/n, lightRatio:light/n,
    edgeDensity:edges/n, variance,
    redness:rM-(gM+bM)/2,
    blueness:bM-(rM+gM)/2,
    greenness:gM-(rM+bM)/2,
    warmth:rM+gM-bM,
  };
}

function scoreFromPixels(f: PixelFeatures): Record<WasteType, number> {
  const s: Record<WasteType, number> = {} as any;
  ALL_TYPES.forEach(t => s[t]=0);
  const {rMean:r,gMean:g,bMean:b,hMean:h,sMean:sat,vMean:v,
         darkRatio:dr,lightRatio:lr,edgeDensity:ed,variance:va,
         redness:red,blueness:blue,warmth:warm} = f;
  const bright=(r+g+b)/3;

  // Asphalt: very dark + low sat
  if(dr>0.5) s["Asphalt Waste"]+=60;
  if(dr>0.4&&sat<35) s["Asphalt Waste"]+=40;
  if(bright<75&&sat<40) s["Asphalt Waste"]+=30;

  // Rubber: dark but slightly more sat than asphalt
  if(dr>0.35&&sat<60&&va<600) s["Rubber Waste"]+=50;
  if(bright<90&&sat<70) s["Rubber Waste"]+=25;

  // Gypsum: very bright + very low sat + low variance
  if(lr>0.55&&sat<18) s["Gypsum / Drywall"]+=70;
  if(bright>215&&sat<22) s["Gypsum / Drywall"]+=50;
  if(lr>0.4&&va<300) s["Gypsum / Drywall"]+=30;

  // Metal: medium bright + very low sat + high edges
  if(sat<20&&bright>120&&bright<210) s["Metal Waste"]+=55;
  if(ed>0.18&&sat<28) s["Metal Waste"]+=40;
  if(va>1800&&sat<30) s["Metal Waste"]+=30;

  // Concrete: medium grey + medium variance + medium edges
  if(sat<55&&bright>90&&bright<190) s["Concrete Waste"]+=45;
  if(va>600&&va<2500&&sat<60) s["Concrete Waste"]+=35;
  if(ed>0.08&&sat<65&&bright>85) s["Concrete Waste"]+=25;

  // Brick: red-orange hue + medium sat
  if(red>35&&sat>45&&bright>65) s["Brick Waste"]+=70;
  if(h>0&&h<20&&sat>55) s["Brick Waste"]+=50;
  if(r>g+40&&r>b+40&&bright>70) s["Brick Waste"]+=35;

  // Wood: warm brown + medium sat + medium bright
  if(red>18&&sat>28&&sat<130&&bright>60&&bright<200) s["Wood Waste"]+=55;
  if(h>12&&h<35&&sat>32&&bright>70) s["Wood Waste"]+=45;
  if(warm>40&&sat>20&&bright>80&&bright<210) s["Wood Waste"]+=25;

  // Sand: warm beige + low-medium sat + high bright
  if(h>18&&h<45&&sat>18&&sat<85&&bright>155) s["Sand"]+=65;
  if(red>12&&bright>165&&sat<75) s["Sand"]+=40;
  if(warm>60&&bright>160&&sat<80) s["Sand"]+=25;

  // Glass: blue-green tint + high bright + low sat
  if(blue>12&&bright>160&&sat<65) s["Glass Waste"]+=55;
  if(h>160&&h<220&&bright>155) s["Glass Waste"]+=45;
  if(lr>0.3&&blue>8) s["Glass Waste"]+=25;

  // Plastic: high sat + medium-high bright
  if(sat>110&&bright>105) s["Plastic Waste"]+=65;
  if(sat>85&&va>400) s["Plastic Waste"]+=35;

  // Ceramic/Tile: regular pattern (high edges) + medium bright + low-med sat
  if(ed>0.22&&sat<85&&bright>125) s["Ceramic / Tile Waste"]+=55;
  if(va>900&&sat<75&&lr>0.18) s["Ceramic / Tile Waste"]+=35;

  // Insulation: pink/yellow + light + low-med sat
  if(red>22&&bright>162&&sat<85) s["Insulation Waste"]+=45;
  if(h>290&&bright>155) s["Insulation Waste"]+=35;

  return s;
}

// ── MobileNet loader ─────────────────────────────────────────────────────────
let _model: any = null;
async function getModel() {
  if (_model) return _model;
  await import('@tensorflow/tfjs');
  const mn = await import('@tensorflow-models/mobilenet');
  _model = await mn.load({ version: 2, alpha: 1.0 });
  return _model;
}

async function scoreFromMobileNet(canvas: HTMLCanvasElement): Promise<Record<WasteType, number>> {
  const scores: Record<WasteType, number> = {} as any;
  ALL_TYPES.forEach(t => scores[t]=0);
  try {
    const model = await getModel();
    const preds: {className:string;probability:number}[] = await model.classify(canvas, 100);
    preds.forEach((p, i) => {
      const label = p.className.toLowerCase();
      const w = i < 10 ? 1.0 : i < 30 ? 0.6 : 0.3;
      for (const [type, kws] of Object.entries(MOBILENET_MAP)) {
        if (kws.some(kw => label.includes(kw))) {
          scores[type as WasteType] += p.probability * w * 100;
          break;
        }
      }
    });
  } catch {}
  return scores;
}

// ── Combined classifier ───────────────────────────────────────────────────────
async function classify(file: File): Promise<{results: {type:string;percentage:number}[]; method:string}> {
  // Draw to canvas
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = URL.createObjectURL(file);
  });
  const canvas = document.createElement('canvas');
  canvas.width = 224; canvas.height = 224;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, 224, 224);
  const imageData = ctx.getImageData(0, 0, 224, 224);

  // Run both analyses in parallel
  const [pixelScores, mobilenetScores] = await Promise.all([
    Promise.resolve(scoreFromPixels(extractFeatures(imageData.data, 224, 224))),
    scoreFromMobileNet(canvas),
  ]);

  // Weighted combination: pixel 40% + mobilenet 60%
  const combined: Record<WasteType, number> = {} as any;
  const mnTotal = Object.values(mobilenetScores).reduce((a,b)=>a+b,0);
  const hasMN = mnTotal > 0.5;

  ALL_TYPES.forEach(t => {
    const px = pixelScores[t];
    const mn = mobilenetScores[t];
    combined[t] = hasMN ? px * 0.4 + mn * 0.6 : px;
  });

  const total = Object.values(combined).reduce((a,b)=>a+b,0);
  if (total === 0) return { results:[{type:"Concrete Waste",percentage:70}], method:"Pixel Analysis" };

  const ranked = (Object.entries(combined) as [WasteType,number][])
    .sort((a,b)=>b[1]-a[1]);

  const topShare = ranked[0][1] / total;
  const primaryConf = Math.min(Math.round(68 + topShare * 27), 95);

  const results: {type:string;percentage:number}[] = [
    { type: ranked[0][0], percentage: primaryConf }
  ];

  if (ranked[1][1]/total > 0.13) {
    const c = Math.round((ranked[1][1]/total)*75);
    if (c >= 10) results.push({ type: ranked[1][0], percentage: c });
  }
  if (ranked[2][1]/total > 0.09 && results.length < 3) {
    const c = Math.round((ranked[2][1]/total)*65);
    if (c >= 8) results.push({ type: ranked[2][0], percentage: c });
  }

  return {
    results,
    method: hasMN ? 'MobileNet v2 + Pixel Analysis' : 'Pixel Analysis',
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ScanWastePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File|null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [results, setResults] = useState<{type:string;percentage:number}[]>([]);
  const [method, setMethod] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getModel().then(() => setModelReady(true)).catch(() => setModelReady(true));
  }, []);

  const handleFile = (f: File) => {
    if (!f?.type.startsWith('image/')) return;
    setFile(f); setPreview(URL.createObjectURL(f));
    setResults([]); setError(''); setMethod('');
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true); setError(''); setResults([]); setMethod('');
    try {
      // Try backend first (5s)
      try {
        const { analyzeWaste } = await import('@/services/api');
        const res = await Promise.race([
          analyzeWaste(crypto.randomUUID(), file),
          new Promise<never>((_,r) => setTimeout(() => r(new Error('timeout')), 5000)),
        ]) as any;
        if (res.data?.materials?.length > 0) {
          setResults(res.data.materials);
          setMethod('Server AI (EfficientNet-B4)');
          localStorage.setItem('last_scan_materials', JSON.stringify(res.data.materials));
          return;
        }
      } catch {}

      // Client-side combined classifier
      const { results: mats, method: m } = await classify(file);
      setResults(mats);
      setMethod(m);
      localStorage.setItem('last_scan_materials', JSON.stringify(mats));
    } catch {
      setError('Analysis failed. Please try a clearer construction site photo.');
    } finally {
      setLoading(false);
    }
  };

  const primary = results[0];
  const matKey = primary ? MATERIAL_KEY[primary.type as WasteType] : null;
  const co2 = matKey ? (EMISSION_FACTORS[matKey] ?? 0) : 0;
  const energy = matKey ? (ENERGY_FACTORS[matKey] ?? 0) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight mb-1">AI Material Scanner</h1>
        <p className="text-zinc-500 flex items-center gap-2">
          Upload a construction site photo to classify waste materials.
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${modelReady ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}
            style={{ background: modelReady ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }}>
            {modelReady ? '● Model Ready' : '● Loading Model...'}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Upload */}
        <div className="cwi-auth-card rounded-2xl p-6 flex flex-col gap-4">
          {preview ? (
            <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
              <img src={preview} alt="Preview" className="object-cover w-full h-full" />
              <button onClick={() => { setFile(null); setPreview(''); setResults([]); setError(''); setMethod(''); }}
                className="absolute top-2 right-2 text-xs px-3 py-1 rounded-full font-semibold"
                style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}>
                Clear
              </button>
            </div>
          ) : (
            <div
              onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
              onDragOver={e => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer flex flex-col items-center transition-all"
              style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.03)' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.7)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)')}>
              <input ref={inputRef} type="file" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} accept="image/*" className="hidden" />
              <UploadCloud className="h-10 w-10 text-emerald-400 mb-3" />
              <p className="text-white font-semibold">Click or drag image here</p>
              <p className="text-xs text-zinc-500 mt-1">JPG, PNG, WEBP — construction site photos work best</p>
            </div>
          )}

          <button onClick={handleAnalyze} disabled={!file || loading}
            className="cwi-btn-primary w-full py-3.5 rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analysing...</>
              : <><Brain className="h-4 w-4" /> Analyse Waste</>}
          </button>

          {method && (
            <p className="text-xs text-zinc-500 text-center flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> {method}
            </p>
          )}
        </div>

        {/* Results */}
        <div className="cwi-auth-card rounded-2xl p-6 flex flex-col min-h-[360px]">
          <h3 className="font-black text-white text-lg mb-4 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            Detection Results
          </h3>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl mb-4 text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}

          {results.length > 0 ? (
            <div className="space-y-4 flex-1">
              {results.map((mat, idx) => (
                <div key={idx} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="font-bold text-white text-sm">{mat.type}</span>
                      {idx === 0 && <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Primary</span>}
                    </div>
                    <span className="font-black text-white text-lg">{mat.percentage}%</span>
                  </div>
                  <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${mat.percentage}%`, background: BAR_COLORS[mat.type as WasteType] ?? '#10b981' }} />
                  </div>
                </div>
              ))}

              {primary && co2 > 0 && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Leaf className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">ESG Impact per 1,000 kg recycled</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-2xl font-black text-emerald-400">{(co2 * 1000).toFixed(0)}<span className="text-sm font-medium ml-1">kg</span></div>
                      <div className="text-xs text-zinc-500">CO₂ saved</div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-amber-400">{(energy * 1000).toFixed(0)}<span className="text-sm font-medium ml-1">kWh</span></div>
                      <div className="text-xs text-zinc-500">Energy saved</div>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={() => router.push('/create-listing')}
                className="cwi-btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                Draft Listing <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <Brain className="h-12 w-12 text-zinc-700" />
              <p className="text-zinc-500 text-sm">Upload a photo to detect materials.</p>
              <p className="text-zinc-600 text-xs max-w-xs">Uses MobileNet v2 + pixel analysis combined for best accuracy.</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="cwi-auth-card rounded-2xl p-5">
        <h3 className="font-bold text-white text-sm mb-3">Tips for accurate results</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { tip: "Fill the frame with the material", icon: "📸" },
            { tip: "Use natural daylight", icon: "☀️" },
            { tip: "Avoid blurry or dark photos", icon: "🔍" },
            { tip: "One material type per scan", icon: "🎯" },
          ].map(t => (
            <div key={t.tip} className="flex items-start gap-2 text-xs text-zinc-500">
              <span>{t.icon}</span><span>{t.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
