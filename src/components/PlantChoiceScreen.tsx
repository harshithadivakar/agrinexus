import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { APPROVED_PLANTS, Plant } from '../types';

interface PlantChoiceScreenProps {
  onBack: () => void;
  onSelect: (plant: Plant) => void;
  initialSelectedId?: string | null;
}

export default function PlantChoiceScreen({
  onBack,
  onSelect,
  initialSelectedId = null,
}: PlantChoiceScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);

  const handleCardClick = (id: string) => {
    setSelectedId(id);
  };

  const handleStartGrowing = () => {
    if (!selectedId) return;
    const plant = APPROVED_PLANTS.find((p) => p.id === selectedId);
    if (plant) {
      onSelect(plant);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#f7faf6] text-[#181c1a]">
      {/* Top AppBar */}
      <header className="w-full top-0 sticky z-30 bg-[#f7faf6] flex justify-between items-center px-5 h-16 border-b border-[#D8E4DA]/40">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-[#ecefeb] transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-[#006038]" />
        </button>
        <div className="font-heading text-lg font-extrabold text-[#006038]">Agrinexus</div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Main content */}
      <main className="w-full max-w-md flex-grow flex flex-col px-5 pb-8">
        {/* Title Block */}
        <section className="mt-5 mb-6">
          <h1 className="font-heading text-2xl font-extrabold text-[#17211B] mb-1">
            Choose Your Plant
          </h1>
          <p className="font-sans text-sm text-[#3f4941]">
            Select the seeds you want to grow in your new pod.
          </p>
        </section>

        {/* Plant Grid */}
        <section className="grid grid-cols-2 gap-4 flex-grow content-start">
          {APPROVED_PLANTS.map((plant) => {
            const isActive = selectedId === plant.id;
            return (
              <div
                key={plant.id}
                onClick={() => handleCardClick(plant.id)}
                className={`plant-card rounded-2xl bg-white shadow-sm cursor-pointer transition-all duration-300 flex flex-col overflow-hidden group select-none ${
                  isActive 
                    ? 'plant-card-active ring-2 ring-[#006038]' 
                    : 'plant-card-inactive border border-[#D8E4DA]/40 hover:border-[#006038]/40'
                }`}
              >
                <div className="aspect-square w-full relative overflow-hidden bg-slate-50">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={plant.imageUrl}
                    alt={plant.name}
                  />
                  {isActive && (
                    <div className="absolute top-2.5 right-2.5">
                      <CheckCircle2 className="w-6 h-6 text-[#006038] fill-[#9ef5be]" />
                    </div>
                  )}
                </div>
                <div className="p-3.5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-sm font-bold text-[#17211B] leading-snug">
                      {plant.name}
                    </h3>
                    {plant.scientificName && (
                      <p className="font-sans italic text-[10px] text-[#58605b] mt-0.5">
                        {plant.scientificName}
                      </p>
                    )}
                  </div>
                  <p className="font-sans text-[11px] text-[#3f4941] mt-1.5 leading-normal">
                    {plant.description}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Bottom Action Bar */}
        <div className="mt-10 flex flex-col items-center">
          <button
            onClick={handleStartGrowing}
            disabled={!selectedId}
            id="plant-choice-start-btn"
            className={`w-full h-[52px] rounded-full font-heading font-bold text-sm flex items-center justify-center transition-all duration-300 ${
              selectedId
                ? 'bg-[#006038] text-white shadow-lg active:scale-[0.97] hover:bg-[#165E3A]'
                : 'bg-[#ecefeb] text-[#3f4941]/50 cursor-not-allowed opacity-60'
            }`}
          >
            Start Growing
          </button>
          
          <p className="mt-4 font-sans text-[11px] text-[#3f4941] text-center px-4 leading-normal">
            Agrinexus will automatically adjust water and light settings for your chosen plant.
          </p>
        </div>
      </main>
    </div>
  );
}
