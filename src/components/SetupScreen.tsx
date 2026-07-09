import React, { useState } from 'react';
import { ArrowRight, Info, CheckCircle, Smartphone, Droplet, Layers, LogOut } from 'lucide-react';

interface SetupScreenProps {
  currentStep: number;
  userName: string;
  avatarUrl: string;
  onStepChange: (step: number) => void;
  onSkip: () => void;
  onGoToPairing: () => void;
  onGoToPlantChoice: () => void;
  selectedPlantName?: string | null;
  isPaired: boolean;
}

export default function SetupScreen({
  currentStep,
  userName,
  avatarUrl,
  onStepChange,
  onSkip,
  onGoToPairing,
  onGoToPlantChoice,
  selectedPlantName,
  isPaired,
}: SetupScreenProps) {
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (currentStep === 1) {
        onStepChange(2);
      } else if (currentStep === 2) {
        onStepChange(3);
      } else if (currentStep === 3) {
        // Go to Step 4: Pairing Screen
        onGoToPairing();
      } else if (currentStep === 4) {
        // Go to Step 5: Plant Selection
        onGoToPlantChoice();
      }
    }, 600);
  };

  // Step Content Customizers
  const stepTitles = [
    "Let's Get Started",
    "Add Clean Water",
    "Insert Seed Pod",
    "Pair Your Garden",
    "Choose Your Seed"
  ];

  const stepDescriptions = [
    "Find a flat surface in your kitchen with access to a power outlet.",
    "Pour clean room-temperature water into the main basin up to the MAX line.",
    "Place your AgriNexus smart capsule firmly into the center growing chamber.",
    "Pair your smartphone with the device's QR code to synchronize the cycle.",
    "Pick the crop you want to cultivate and start the dynamic lighting schedule."
  ];

  const stepTips = [
    "Place your AgriNexus away from direct sunlight for optimal nutrient balance and water temperature.",
    "Use filtered water if available to avoid calcium scale and support clean nutrient absorption.",
    "Leave the clear bio-dome dome lid on the pod until sprouts touch the top of the plastic.",
    "Keep your smartphone close during the automatic pairing handshake for faster discovery.",
    "Each seed pod contains carefully calibrated minerals optimized for that specific crop's lifespan."
  ];

  const stepDetailTitles = [
    "Recommended Spot",
    "Water Fill Limit",
    "Capsule Bay",
    "Secure Linkage",
    "Growing Profile"
  ];

  const stepDetailValues = [
    "Near a 220V Outlet",
    "2.5L Max Capacity",
    "Clip-Lock Pod System",
    "QR Code Protected",
    selectedPlantName ? `${selectedPlantName} Selected` : "Awaiting Selection"
  ];

  const stepIcons = [
    <span key="1" className="material-symbols-outlined text-primary text-[22px] text-[#006038]">electrical_services</span>,
    <Droplet key="2" className="w-5 h-5 text-[#006038]" />,
    <Layers key="3" className="w-5 h-5 text-[#006038]" />,
    <Smartphone key="4" className="w-5 h-5 text-[#006038]" />,
    <CheckCircle key="5" className="w-5 h-5 text-[#006038]" />
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f7faf6] text-[#181c1a]">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-[#f7faf6] flex items-center justify-between px-5 h-16 border-b border-[#D8E4DA]/40">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006038] text-[24px]">potted_plant</span>
          <h1 className="font-heading text-lg font-bold text-[#006038] tracking-tight">AgriNexus</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#58605b] hidden sm:inline">Hello, {userName}</span>
          <div className="w-8 h-8 rounded-full bg-[#ecefeb] overflow-hidden flex items-center justify-center ring-2 ring-[#006038]/10">
            {avatarUrl ? (
              <img className="w-full h-full object-cover" src={avatarUrl} alt={userName} />
            ) : (
              <span className="material-symbols-outlined text-[#3f4941] text-[20px]">person</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-20 pb-10 flex flex-col items-center justify-between px-5 max-w-md mx-auto w-full">
        {/* Step Indicator */}
        <div className="w-full text-center mt-3">
          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="text-[11px] font-heading font-bold text-[#006038] uppercase tracking-widest">
              Step {currentStep} of 5
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="flex w-full h-1 bg-[#ecefeb] rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-[#006038] transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>

          <h2 className="font-heading text-2xl font-extrabold text-[#181c1a] mb-1.5 leading-tight">
            {stepTitles[currentStep - 1]}
          </h2>
          <p className="font-sans text-sm text-[#3f4941] max-w-sm mx-auto leading-relaxed">
            {stepDescriptions[currentStep - 1]}
          </p>
        </div>

        {/* Central Visual Image container */}
        <div className="relative w-full aspect-square my-6 max-w-[320px]">
          <div className="absolute inset-0 bg-[#006038]/5 rounded-full blur-3xl -z-10" />
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-md bg-white border border-[#D8E4DA]/40 relative">
            <img
              className="w-full h-full object-cover select-none"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBS45ND4xL6YwppJ-QKCqGfrr7-loYKWLQxiMXTh6LQptAvlDwba0HyxzLC-u3dmYfSHkGJW0XCT6Ph9Rp9L1zCsXrbZOeSuI5Klx_2wqw4cuKBCUUApRkbmWBv3TrghiEe312CxRiR_M0rG6-oU933ycuqSLpHc8XUrD94osPssV2Ghzurh2_K2bClWfRaN9aAdGJt_Ovtc9-0GaqS2W4D5a9NUQOXFyfHkCxIcwWtSNJQ0rnk85tDd01apiW7qq2zfWzW1B6Fpev0"
              alt="AgriNexus setup stage"
            />
            
            {/* Floating Detail Card */}
            <div className="absolute bottom-3 left-3 right-3 p-3.5 bg-white/90 backdrop-blur-md rounded-xl border border-white/50 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-[#9ef5be] flex items-center justify-center flex-shrink-0">
                {stepIcons[currentStep - 1]}
              </div>
              <div>
                <p className="text-[10px] font-medium text-[#3f4941] uppercase tracking-wider">{stepDetailTitles[currentStep - 1]}</p>
                <p className="font-heading text-sm font-bold text-[#181c1a] leading-tight">
                  {stepDetailValues[currentStep - 1]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions & Actions */}
        <div className="w-full space-y-4">
          <div className="flex flex-col gap-3">
            {currentStep === 4 ? (
              <button
                onClick={onGoToPairing}
                id="setup-pair-device-btn"
                className="w-full h-[52px] bg-[#006038] text-white rounded-full font-heading font-bold text-sm shadow-md hover:bg-[#165E3A] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isPaired ? "Scan QR Code Again" : "Scan QR Code"}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : currentStep === 5 ? (
              <button
                onClick={onGoToPlantChoice}
                id="setup-select-plant-btn"
                className="w-full h-[52px] bg-[#006038] text-white rounded-full font-heading font-bold text-sm shadow-md hover:bg-[#165E3A] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {selectedPlantName ? "Change Selected Plant" : "Choose Seed Pod"}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={loading}
                id={`setup-next-step-${currentStep}-btn`}
                className="w-full h-[52px] bg-[#006038] text-white rounded-full font-heading font-bold text-sm shadow-md hover:bg-[#165E3A] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                ) : (
                  <>
                    Next: {currentStep === 1 ? "Add Water" : currentStep === 2 ? "Insert Pod" : "Pair Device"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            <button
              onClick={onSkip}
              id="setup-skip-btn"
              className="w-full h-12 bg-[#f1f4f0] text-[#3f4941] rounded-full font-heading font-semibold text-sm border border-[#bec9bf]/40 hover:bg-[#ecefeb] transition-colors"
            >
              Skip Setup for Now
            </button>
          </div>

          {/* Contextual Tip */}
          <div className="flex items-start gap-3 p-4 bg-[#616f65]/5 rounded-xl border border-[#d7e6da]/50">
            <Info className="w-5 h-5 text-[#006038] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#3f4941] leading-relaxed">
              {stepTips[currentStep - 1]}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
