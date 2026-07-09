import React, { useState } from 'react';
import { ArrowLeft, Flashlight, AlertCircle, Info, QrCode } from 'lucide-react';

interface PairingScreenProps {
  onBack: () => void;
  onSuccess: (deviceId: string) => void;
}

export default function PairingScreen({ onBack, onSuccess }: PairingScreenProps) {
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const triggerScan = () => {
    if (scanning) return;
    setScanning(true);
    setScanResult(null);
    
    // Simulate finding a code after 1.8 seconds
    setTimeout(() => {
      setScanning(false);
      const mockDeviceId = 'AN-9842-X7';
      setScanResult(mockDeviceId);
      
      // Auto-trigger onSuccess after success feedback
      setTimeout(() => {
        onSuccess(mockDeviceId);
      }, 1200);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f7faf6] text-[#181c1a]">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#f7faf6] flex items-center px-4 h-14 border-b border-[#D8E4DA]/40">
        <button
          onClick={onBack}
          className="mr-3 p-2 -ml-2 rounded-full hover:bg-[#ecefeb] transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-[#181c1a]" />
        </button>
        <h1 className="font-heading text-lg font-bold text-[#006038]">Pair Your Garden</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pt-20 pb-8 overflow-hidden max-w-md mx-auto w-full">
        
        {/* Viewfinder Container */}
        <div className="relative w-full aspect-square bg-[#e0e3df] rounded-2xl overflow-hidden shadow-inner max-w-[310px]">
          {/* Grayscale Background Image for Camera Feed */}
          <div
            className={`w-full h-full bg-cover bg-center transition-all duration-300 ${
              flashlightOn ? 'brightness-125 grayscale-0' : 'brightness-95 grayscale-[0.2]'
            }`}
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuClgeEOMlyszzCUErffGIrHeRWEoOFU8s_pqgb84OtuY6H5bPSwiL4GPFZXQuIzvWDlC7OkRPy0jM6lV1VNGwMfmCztR0BloXadhXmZO-mV8nFhbQ6V70RiIp5wgBvh04z6mDe4leLXm7VwplBI2zxCyGueU6BPe-FUhTmBUtVO1uQi9yKySD_37qCXKdXBbFQ-ErTahtmVyV3-ZIx6pQ20cjLuD-BWgM6h1037MqbbcomJ1D9hauga-80UM0kemn4U4zxofnI0dQoh')`,
            }}
          />

          {/* Scanning Box overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-56 h-56 border-2 border-white/30 rounded-lg">
              {/* Corner accents */}
              <div className="viewfinder-corner top-0 left-0 border-t-4 border-l-4 rounded-tl-md border-[#82d8a3]"></div>
              <div className="viewfinder-corner top-0 right-0 border-t-4 border-r-4 rounded-tr-md border-[#82d8a3]"></div>
              <div className="viewfinder-corner bottom-0 left-0 border-b-4 border-l-4 rounded-bl-md border-[#82d8a3]"></div>
              <div className="viewfinder-corner bottom-0 right-0 border-b-4 border-r-4 rounded-br-md border-[#82d8a3]"></div>
              
              {/* Dynamic Scanning Line */}
              {scanning && <div className="scanning-line"></div>}

              {/* Feedback States Overlay */}
              {scanResult && (
                <div className="absolute inset-0 bg-[#006038]/75 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center rounded-lg animate-fade-in">
                  <span className="material-symbols-outlined text-[48px] text-[#6DDBA0] mb-2 animate-bounce">
                    check_circle
                  </span>
                  <p className="font-heading font-bold text-sm">Code Detected!</p>
                  <p className="font-mono text-xs text-white/80 mt-1">{scanResult}</p>
                </div>
              )}
            </div>
          </div>

          {/* Flashlight toggle */}
          <button
            onClick={() => setFlashlightOn(!flashlightOn)}
            className={`absolute top-4 right-4 p-3 rounded-full text-white active:scale-90 transition-all ${
              flashlightOn ? 'bg-[#006038] shadow-lg' : 'bg-black/40 backdrop-blur-md'
            }`}
            title="Toggle Flashlight"
          >
            <Flashlight className={`w-5 h-5 ${flashlightOn ? 'text-[#6DDBA0]' : 'text-white'}`} />
          </button>
        </div>

        {/* Dynamic Instructional Text */}
        <div className="mt-6 text-center max-w-[290px]">
          <p className="font-sans text-sm text-[#3f4941] leading-relaxed">
            Scan the QR code located on the back or bottom of your{' '}
            <span className="font-bold text-[#006038]">AgriNexus</span> device.
          </p>
        </div>

        {/* Actions section */}
        <div className="mt-8 w-full flex flex-col gap-3 items-center">
          <button
            onClick={triggerScan}
            disabled={scanning || !!scanResult}
            id="pairing-scan-btn"
            className={`w-full font-heading font-bold text-sm h-[52px] rounded-full shadow-sm transition-all flex items-center justify-center gap-2 ${
              scanResult
                ? 'bg-[#3867D6] text-white'
                : scanning
                ? 'bg-[#ecefeb] text-[#3f4941] cursor-wait'
                : 'bg-[#006038] text-white hover:bg-[#165E3A] active:scale-95'
            }`}
          >
            {scanning ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-[#006038]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scanning Viewfinder...
              </span>
            ) : scanResult ? (
              'Code Found!'
            ) : (
              'Scan Code'
            )}
          </button>

          {/* Help toggle */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="h-10 flex items-center justify-center font-heading font-semibold text-xs text-[#006038] hover:underline"
          >
            Where is my QR code?
          </button>

          {showHelp && (
            <div className="p-4 bg-white rounded-xl border border-[#D8E4DA] text-xs text-[#3f4941] space-y-2 max-w-sm w-full shadow-sm">
              <div className="flex items-center gap-2 text-[#006038] font-bold font-heading">
                <AlertCircle className="w-4 h-4" />
                <span>Locating Your Code</span>
              </div>
              <p className="leading-relaxed">
                Look for a small square sticker with a black and white pixel pattern (QR format). It is typically printed on:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>The absolute base/bottom plate of the unit.</li>
                <li>Next to the DC power jack on the back wooden trim.</li>
                <li>On the safety instruction page in your starter package.</li>
              </ul>
            </div>
          )}
        </div>
      </main>

      {/* Dynamic automatic pairing section */}
      <div className="px-5 pb-8 max-w-md mx-auto w-full">
        <div className="bg-[#f1f4f0] rounded-2xl p-4 flex items-center gap-4 border border-[#D8E4DA]/60">
          <div className="w-12 h-12 bg-[#1f7a4d] flex items-center justify-center rounded-xl flex-shrink-0">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-heading text-sm font-bold text-[#181c1a]">Automatic Pairing</h4>
            <p className="text-[11px] text-[#3f4941]">Keep your phone close to the device for faster discovery.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
