import React, { useRef, useState } from 'react';
import {
  Stethoscope,
  Camera,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Bug,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';

interface DiagnosisResult {
  isPlant: boolean;
  status: 'healthy' | 'stressed' | 'unhealthy' | 'unknown';
  summary: string;
  diseaseSigns: string;
  recommendation: string;
  issues: string[];
}

interface DiagnoseScreenProps {
  activePlantName?: string;
}

const STATUS_META: Record<DiagnosisResult['status'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  healthy: { label: 'Healthy', color: 'text-[#006038]', bg: 'bg-[#9ef5be]', icon: <CheckCircle2 className="w-4 h-4" /> },
  stressed: { label: 'Stressed', color: 'text-amber-700', bg: 'bg-amber-200', icon: <AlertTriangle className="w-4 h-4" /> },
  unhealthy: { label: 'Unhealthy', color: 'text-red-700', bg: 'bg-red-200', icon: <AlertCircle className="w-4 h-4" /> },
  unknown: { label: 'Unclear', color: 'text-slate-600', bg: 'bg-slate-200', icon: <HelpCircle className="w-4 h-4" /> },
};

const MAX_FILE_BYTES = 8 * 1024 * 1024;

const SAMPLE_PHOTOS = [
  { label: 'Early Blight', src: '/demo/early_blight_tomato.jpg' },
  { label: 'Late Blight', src: '/demo/late_blight_tomato.jpg' },
];

// A vision model doesn't need multi-megapixel photos, and large uploads are what makes
// diagnosis feel slow (or time out). Downscale to a max dimension before sending.
const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.82;

function downscaleImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = () => reject(new Error('Could not load image for resizing.'));
    img.src = dataUrl;
  });
}

export default function DiagnoseScreen({ activePlantName = 'Sweet Basil' }: DiagnoseScreenProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isSampleLoading, setIsSampleLoading] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('Image is too large. Please choose a photo under 8MB.');
      return;
    }

    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const rawDataUrl = reader.result as string;
      const dataUrl = await downscaleImage(rawDataUrl).catch(() => rawDataUrl);
      setPreview(dataUrl);
      submitForDiagnosis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSamplePhoto = async (sample: { label: string; src: string }) => {
    setIsSampleLoading(sample.label);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(sample.src);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = async () => {
        const rawDataUrl = reader.result as string;
        const dataUrl = await downscaleImage(rawDataUrl).catch(() => rawDataUrl);
        setPreview(dataUrl);
        submitForDiagnosis(dataUrl);
      };
      reader.readAsDataURL(blob);
    } catch {
      setError('Could not load the sample photo. Please try uploading your own.');
    } finally {
      setIsSampleLoading(null);
    }
  };

  const submitForDiagnosis = async (imageDataUrl: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl, plantContext: activePlantName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to diagnose the photo.');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while analyzing the photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="bg-[#f7faf6] min-h-screen pb-24 text-[#181c1a]">
      <header className="sticky top-0 z-50 bg-[#f7faf6] border-b border-[#D8E4DA]/40 px-5 h-16 flex items-center gap-2">
        <Stethoscope className="w-5 h-5 text-[#006038]" />
        <h1 className="font-heading text-lg font-bold text-[#006038]">Plant Diagnostics</h1>
      </header>

      <main className="px-5 mt-4 max-w-md mx-auto space-y-5">
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-xl text-[#181c1a]">Diagnose from a photo</h2>
          <p className="text-xs text-[#58605b]">
            Snap or upload a close-up photo of a leaf or stem on your {activePlantName} to check for disease, pests, or
            nutrient stress, with next-step recommendations powered by Gemini AI.
          </p>
        </div>

        {!preview && (
          <div className="bg-white rounded-2xl border border-[#D8E4DA]/40 shadow-xs p-5 space-y-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full py-3.5 rounded-xl bg-[#1f7a4d] text-white font-heading font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#18603c] active:scale-95 transition-all"
              id="diagnose-camera-btn"
            >
              <Camera className="w-4 h-4" /> Take a Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 rounded-xl bg-[#f1f4f0] text-[#181c1a] font-heading font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#ecefeb] active:scale-95 transition-all"
              id="diagnose-upload-btn"
            >
              <Upload className="w-4 h-4" /> Upload from Gallery
            </button>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        )}

        {!preview && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#58605b] px-1">
              Or try a demo photo
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SAMPLE_PHOTOS.map((sample) => (
                <button
                  key={sample.label}
                  onClick={() => handleSamplePhoto(sample)}
                  disabled={isSampleLoading !== null}
                  className="relative rounded-xl overflow-hidden border border-[#D8E4DA]/50 aspect-square bg-slate-100 group disabled:opacity-60"
                >
                  <img src={sample.src} alt={sample.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    {isSampleLoading === sample.label ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <span className="text-white text-xs font-heading font-bold">{sample.label}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 leading-relaxed">{error}</p>
          </div>
        )}

        {preview && (
          <div className="space-y-4 animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden border border-[#D8E4DA]/50 aspect-[4/3] bg-slate-100">
              <img src={preview} alt="Submitted plant" className="w-full h-full object-cover" />
            </div>

            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-6 text-[#3f4941]">
                <Loader2 className="w-4 h-4 animate-spin text-[#1f7a4d]" />
                <span className="text-xs font-medium">Analyzing your photo...</span>
              </div>
            )}

            {result && !isLoading && (
              !result.isPlant ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    We couldn't recognize a plant in this photo. Try a clearer, closer shot of a leaf or stem.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-[#D8E4DA]/40 shadow-xs p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_META[result.status].bg} ${STATUS_META[result.status].color}`}
                    >
                      {STATUS_META[result.status].icon}
                      {STATUS_META[result.status].label}
                    </span>
                  </div>

                  <p className="text-sm text-[#181c1a] leading-relaxed">{result.summary}</p>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-[#f1f4f0] rounded-xl flex gap-2.5">
                      <Bug className="w-4 h-4 text-[#006038] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#58605b]">Disease &amp; Pest Signs</p>
                        <p className="text-xs text-[#181c1a] mt-0.5 leading-relaxed">{result.diseaseSigns}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-[#e7f6ec] border border-[#9ef5be]/60 rounded-xl flex gap-2.5">
                      <Lightbulb className="w-4 h-4 text-[#006038] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#006038]">Recommended Next Steps</p>
                        <p className="text-xs text-[#181c1a] mt-0.5 leading-relaxed">{result.recommendation}</p>
                      </div>
                    </div>
                  </div>

                  {result.issues.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#D8E4DA]/30">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#58605b]">Observations</p>
                      <ul className="space-y-1">
                        {result.issues.map((issue, i) => (
                          <li key={i} className="text-xs text-[#3f4941] flex gap-2">
                            <span className="text-[#006038]">&bull;</span> {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            )}

            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl border border-[#D8E4DA] text-[#3f4941] font-heading font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#f1f4f0] active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Diagnose Another Photo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
