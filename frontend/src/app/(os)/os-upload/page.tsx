"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, UploadCloud, X, CheckCircle2, ArrowRight, FileImage } from 'lucide-react';

const STEPS = ['Upload', 'Analysing', 'Complete'];

export default function OSUploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [step, setStep] = useState(0); // 0=idle, 1=analysing, 2=done
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
  };

  const handleAnalyse = async () => {
    setStep(1);
    setProgress(0);
    // Simulate progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 60));
      setProgress(i);
    }
    setStep(2);
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Upload Waste</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a site photo and our AI will classify the material type instantly.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all
              ${i < step ? 'bg-emerald-100 text-emerald-700' : i === step ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px]">{i + 1}</span>}
              {s}
            </div>
            {i < STEPS.length - 1 && <div className={`w-8 h-px mx-1 ${i < step ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Upload zone */}
      {step < 2 && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl transition-all ${dragging ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-white'}`}
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="preview" className="w-full h-72 object-cover rounded-2xl" />
              <button
                onClick={() => { setFile(null); setPreview(''); setStep(0); }}
                className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                <FileImage className="w-3 h-3 inline mr-1" />{file?.name}
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-20 cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center mb-4">
                <UploadCloud className="w-7 h-7 text-gray-400" />
              </div>
              <p className="font-semibold text-gray-700 mb-1">Drop your site photo here</p>
              <p className="text-sm text-gray-400">or <span className="text-emerald-600 font-semibold">browse files</span> · JPG, PNG up to 10MB</p>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Running AI classification…</p>
            <span className="text-sm font-bold text-emerald-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-3">MobileNetV3 · OSRM routing · Carbon calc</p>
        </div>
      )}

      {/* Success state */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">Analysis Complete</h2>
          <p className="text-sm text-gray-500 mb-6">Material classified and carbon impact calculated. View your results.</p>
          <button
            onClick={() => router.push('/os-results')}
            className="bg-gray-900 text-white font-semibold px-8 py-3 rounded-xl hover:bg-gray-800 transition flex items-center gap-2 mx-auto"
          >
            View Results <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Analyse button */}
      {step === 0 && file && (
        <button
          onClick={handleAnalyse}
          className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" /> Analyse with AI
        </button>
      )}
    </div>
  );
}
