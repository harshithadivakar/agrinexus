import React, { useState, useEffect, useRef } from 'react';
import { Droplet, Sun, FlaskConical, Calendar, ChevronRight, Sparkles, AlertCircle, X, RotateCcw, Settings, LogOut, Info, Stethoscope, RefreshCw, Volume2, Loader2 } from 'lucide-react';
import { Plant, APPROVED_PLANTS, GardenState } from '../types';

type PlantMood = 'happy' | 'needy' | 'distressed';

const LOCAL_VOICE_FALLBACK: Record<PlantMood, string> = {
  happy: "Feeling good today. Thanks for checking in on me!",
  needy: "Hellooo? Anyone there? I could use a little attention.",
  distressed: "Stop ignoring me. I mean it this time.",
};

function PlantSpeechBubble({ plantName, mood }: { plantName: string; mood: PlantMood }) {
  const [line, setLine] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [audioLoading, setAudioLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const playLine = async (text: string) => {
    if (!text || audioLoading) return;
    setAudioLoading(true);
    try {
      const res = await fetch('/api/plant/voice/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('bad response');
      const blob = await res.blob();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = url;
      await audioRef.current.play();
    } catch (err) {
      // Voice is a bonus on top of the text bubble; skip playback but keep the reason visible for debugging
      console.error('Plant voice playback failed:', err);
    } finally {
      setAudioLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const fetchLine = async () => {
    // Cancel any in-flight request (guards against React StrictMode's double-invoke in dev,
    // and against a stale in-flight request racing a fresh manual refresh)
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch('/api/plant/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantName, mood }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      setLine(data.line || LOCAL_VOICE_FALLBACK[mood]);
      setLoading(false);
    } catch (err: any) {
      if (err?.name === 'AbortError') return; // superseded by a newer request
      setLine(LOCAL_VOICE_FALLBACK[mood]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLine();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, plantName]);

  return (
    <div className="absolute top-4 left-4 right-16 z-10">
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-lg border border-white/60 max-w-[85%]">
        <div className="flex items-start gap-2">
          <span className="text-base leading-none mt-0.5">🌱</span>
          {loading ? (
            <span className="flex items-center gap-1 py-1">
              <span className="w-1.5 h-1.5 bg-[#006038]/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-[#006038]/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-[#006038]/60 rounded-full animate-bounce"></span>
            </span>
          ) : (
            <p className="text-[12px] font-semibold text-[#181c1a] leading-snug">{line}</p>
          )}
          <div className="ml-auto flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => playLine(line)}
              disabled={loading || audioLoading || !line}
              className="p-1 -m-1 rounded-full hover:bg-black/5 active:scale-90 transition-transform disabled:opacity-40"
              title="Hear your plant say this"
            >
              {audioLoading ? (
                <Loader2 className="w-3 h-3 text-[#006038] animate-spin" />
              ) : (
                <Volume2 className="w-3 h-3 text-[#006038]" />
              )}
            </button>
            <button
              onClick={fetchLine}
              disabled={loading}
              className="p-1 -m-1 rounded-full hover:bg-black/5 active:scale-90 transition-transform disabled:opacity-40"
              title="Hear something else"
            >
              <RefreshCw className={`w-3 h-3 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface GardenDashboardScreenProps {
  plant: Plant;
  gardenState: GardenState;
  userName: string;
  userEmail: string;
  avatarUrl: string;
  onResetSetup: () => void;
  onReplant: () => void;
  onNavigateToTab: (tab: 'diagnose' | 'learn' | 'support') => void;
}

export default function GardenDashboardScreen({
  plant,
  gardenState,
  userName,
  userEmail,
  avatarUrl,
  onResetSetup,
  onReplant,
  onNavigateToTab
}: GardenDashboardScreenProps) {
  // Modal states for passive tiles
  const [activeModal, setActiveModal] = useState<'water' | 'light' | 'ph' | 'harvest' | 'profile' | null>(null);
  
  // Simulated stats state to allow users to interact
  const [currentWater, setCurrentWater] = useState<'optimal' | 'low' | 'critical'>('optimal');
  const [currentLight, setCurrentLight] = useState<'on_schedule' | 'off'>('on_schedule');
  const [currentPh, setCurrentPh] = useState<'steady' | 'high' | 'low'>('steady');
  
  // Day Counter offset (Simulated Growing day)
  const [growingDay, setGrowingDay] = useState(12);

  // Derive the plant's "mood" from state, without surfacing raw sensor readouts to the user
  const plantMood: PlantMood =
    currentWater === 'critical' || (currentPh !== 'steady' && currentLight === 'off')
      ? 'distressed'
      : currentWater === 'low' || currentPh !== 'steady' || currentLight === 'off'
      ? 'needy'
      : 'happy';

  // Harvest date calculation
  const getEstHarvestDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + plant.harvestOffsetDays);
    return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleResetSim = () => {
    setCurrentWater('optimal');
    setCurrentLight('on_schedule');
    setCurrentPh('steady');
    setGrowingDay(12);
  };

  return (
    <div className="bg-[#f7faf6] min-h-screen pb-24 text-[#181c1a]">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#f7faf6]/95 backdrop-blur-md border-b border-[#D8E4DA]/40 px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006038] text-[26px]">potted_plant</span>
          <h1 className="font-heading text-lg font-bold text-[#006038] tracking-tight">AgriNexus</h1>
        </div>
        
        {/* Clickable Profile Avatar to launch the profile modal */}
        <button
          onClick={() => setActiveModal('profile')}
          className="w-9 h-9 rounded-full bg-[#ecefeb] overflow-hidden flex items-center justify-center ring-2 ring-[#006038]/10 hover:scale-105 active:scale-95 transition-transform"
          title="Account Settings & Reset"
          id="dashboard-profile-avatar-btn"
        >
          {avatarUrl ? (
            <img className="w-full h-full object-cover" src={avatarUrl} alt={userName} />
          ) : (
            <span className="material-symbols-outlined text-[#3f4941] text-[22px]">person</span>
          )}
        </button>
      </header>

      {/* Main content area */}
      <main className="max-w-md mx-auto px-5 mt-4 space-y-6">
        
        {/* Simulated State Quick Controller (Very valuable for review/testing) */}
        <section className="bg-white p-3.5 rounded-2xl border border-[#D8E4DA]/50 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#58605b] tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#006038]" /> Simulation Sandbox Control
            </span>
            <button 
              onClick={handleResetSim}
              className="text-[10px] text-[#006038] hover:underline font-bold flex items-center gap-1"
              title="Reset Simulated Readings"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[9px] text-[#58605b] mb-1 font-semibold">Water Level</p>
              <select
                value={currentWater}
                onChange={(e) => setCurrentWater(e.target.value as any)}
                className="w-full text-[10px] p-1.5 rounded-lg border border-[#D8E4DA] bg-white text-slate-800"
              >
                <option value="optimal">Optimal (Green)</option>
                <option value="low">Low (Yellow)</option>
                <option value="critical">Critical (Red)</option>
              </select>
            </div>
            <div>
              <p className="text-[9px] text-[#58605b] mb-1 font-semibold">Light Status</p>
              <select
                value={currentLight}
                onChange={(e) => setCurrentLight(e.target.value as any)}
                className="w-full text-[10px] p-1.5 rounded-lg border border-[#D8E4DA] bg-white text-slate-800"
              >
                <option value="on_schedule">On Schedule</option>
                <option value="off">Turned Off</option>
              </select>
            </div>
            <div>
              <p className="text-[9px] text-[#58605b] mb-1 font-semibold">pH Stability</p>
              <select
                value={currentPh}
                onChange={(e) => setCurrentPh(e.target.value as any)}
                className="w-full text-[10px] p-1.5 rounded-lg border border-[#D8E4DA] bg-white text-slate-800"
              >
                <option value="steady">Steady (6.2)</option>
                <option value="high">High (7.8)</option>
                <option value="low">Low (5.1)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#D8E4DA]/30">
            <span className="text-[10px] text-[#58605b] font-medium">Configure growing day:</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setGrowingDay(prev => Math.max(1, prev - 1))}
                className="w-5 h-5 bg-[#f1f4f0] rounded-md text-xs font-bold flex items-center justify-center border border-[#bec9bf]/40"
              >-</button>
              <span className="text-[11px] font-bold text-[#181c1a] w-12 text-center">Day {growingDay}</span>
              <button 
                onClick={() => setGrowingDay(prev => prev + 1)}
                className="w-5 h-5 bg-[#f1f4f0] rounded-md text-xs font-bold flex items-center justify-center border border-[#bec9bf]/40"
              >+</button>
            </div>
          </div>
        </section>

        {/* Hero Section: Active Plant Card */}
        <section>
          <div className="relative group overflow-hidden rounded-3xl bg-white shadow-sm border border-[#D8E4DA]/40 transition-all duration-300">
            <div className="aspect-[4/3] w-full overflow-hidden relative">
              <img
                className="w-full h-full object-cover select-none"
                src={plant.imageUrl}
                alt={plant.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
            </div>

            <PlantSpeechBubble plantName={plant.name} mood={plantMood} />

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <p className="text-white/80 text-[10px] uppercase font-bold tracking-widest mb-1 font-heading">
                Current Pod
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="font-heading text-2xl font-extrabold tracking-tight">
                    {plant.name}
                  </h2>
                  {plant.scientificName && (
                    <p className="font-sans italic text-xs text-white/70 mt-0.5">
                      {plant.scientificName}
                    </p>
                  )}
                </div>
                <span className="bg-[#9ef5be] text-[#002110] px-3.5 py-1.5 rounded-full font-heading font-extrabold text-xs shadow-xs">
                  Growing Day {growingDay}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Passive Status Tiles (2x2 Grid) */}
        <section>
          <div className="grid grid-cols-2 gap-4">
            
            {/* Water Tile */}
            <div
              onClick={() => setActiveModal('water')}
              className="p-4 bg-white rounded-2xl border border-[#D8E4DA]/40 shadow-xs cursor-pointer hover:border-[#006038]/50 hover:shadow-sm transition-all flex flex-col justify-between h-32 select-none group"
            >
              <div className="flex items-center gap-1.5 text-[#58605b] group-hover:text-[#006038] transition-colors">
                <Droplet className={`w-5 h-5 ${
                  currentWater === 'low' ? 'text-amber-500' : currentWater === 'critical' ? 'text-red-500' : 'text-[#006038]'
                }`} />
                <span className="font-heading font-bold text-xs uppercase tracking-wider">Water</span>
              </div>
              <div>
                <p className={`font-heading text-lg font-extrabold ${
                  currentWater === 'low' ? 'text-amber-600' : currentWater === 'critical' ? 'text-red-600' : 'text-[#006038]'
                }`}>
                  {currentWater === 'low' ? 'Low Level' : currentWater === 'critical' ? 'Critical!' : 'Ready'}
                </p>
                <p className="text-[#58605b] text-[11px] mt-0.5 leading-tight">
                  {currentWater === 'low' ? 'Refill required soon' : currentWater === 'critical' ? 'Water reservoir dry' : 'Level is optimal'}
                </p>
              </div>
            </div>

            {/* Light Tile */}
            <div
              onClick={() => setActiveModal('light')}
              className="p-4 bg-white rounded-2xl border border-[#D8E4DA]/40 shadow-xs cursor-pointer hover:border-[#006038]/50 hover:shadow-sm transition-all flex flex-col justify-between h-32 select-none group"
            >
              <div className="flex items-center gap-1.5 text-[#58605b] group-hover:text-[#006038] transition-colors">
                <Sun className={`w-5 h-5 ${currentLight === 'off' ? 'text-slate-400' : 'text-amber-500 animate-spin-slow'}`} />
                <span className="font-heading font-bold text-xs uppercase tracking-wider">Light</span>
              </div>
              <div>
                <p className={`font-heading text-lg font-extrabold ${currentLight === 'off' ? 'text-slate-600' : 'text-[#006038]'}`}>
                  {currentLight === 'off' ? 'Offline' : 'On Schedule'}
                </p>
                <p className="text-[#58605b] text-[11px] mt-0.5 leading-tight">
                  {currentLight === 'off' ? 'Power off / manual idle' : '14h / 10h cycle'}
                </p>
              </div>
            </div>

            {/* pH Tile */}
            <div
              onClick={() => setActiveModal('ph')}
              className="p-4 bg-white rounded-2xl border border-[#D8E4DA]/40 shadow-xs cursor-pointer hover:border-[#006038]/50 hover:shadow-sm transition-all flex flex-col justify-between h-32 select-none group"
            >
              <div className="flex items-center gap-1.5 text-[#58605b] group-hover:text-[#006038] transition-colors">
                <FlaskConical className={`w-5 h-5 ${currentPh !== 'steady' ? 'text-amber-500' : 'text-[#006038]'}`} />
                <span className="font-heading font-bold text-xs uppercase tracking-wider">pH</span>
              </div>
              <div>
                <p className={`font-heading text-lg font-extrabold ${currentPh !== 'steady' ? 'text-amber-600' : 'text-[#006038]'}`}>
                  {currentPh === 'high' ? 'High pH' : currentPh === 'low' ? 'Low pH' : 'Steady'}
                </p>
                <p className="text-[#58605b] text-[11px] mt-0.5 leading-tight">
                  {currentPh === 'high' ? '7.8 pH alkaline scale' : currentPh === 'low' ? '5.1 pH acidic buffer' : '6.2 pH balanced'}
                </p>
              </div>
            </div>

            {/* Harvest Tile */}
            <div
              onClick={() => setActiveModal('harvest')}
              className="p-4 bg-white rounded-2xl border border-[#D8E4DA]/40 shadow-xs cursor-pointer hover:border-[#006038]/50 hover:shadow-sm transition-all flex flex-col justify-between h-32 select-none group"
            >
              <div className="flex items-center gap-1.5 text-[#58605b] group-hover:text-[#006038] transition-colors">
                <Calendar className="w-5 h-5 text-[#006038]" />
                <span className="font-heading font-bold text-xs uppercase tracking-wider">Harvest</span>
              </div>
              <div>
                <p className="font-heading text-lg font-extrabold text-[#006038]">
                  {growingDay >= plant.growingDaysMax ? 'Ready!' : `In ${Math.max(1, plant.growingDaysMax - growingDay)} Days`}
                </p>
                <p className="text-[#58605b] text-[11px] mt-0.5 leading-tight">
                  Est. {getEstHarvestDate()}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Diagnose Quick Access */}
        <section className="bg-white rounded-2xl border border-[#D8E4DA]/40 p-4 shadow-xs">
          <h3 className="font-heading font-bold text-sm text-[#181c1a] mb-3">Plant Health</h3>
          <div
            onClick={() => onNavigateToTab('diagnose')}
            className="flex items-center gap-4 p-3 bg-[#f1f4f0] rounded-xl transition-all hover:bg-[#ecefeb] cursor-pointer group"
            id="dashboard-diagnose-shortcut"
          >
            <div className="w-11 h-11 rounded-lg bg-[#006038]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5 text-[#006038]" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="font-heading font-bold text-xs text-[#181c1a]">Diagnose from a photo</p>
              <p className="text-[#58605b] text-[10px] truncate">Spot disease, pests, or stress with AI + get next steps.</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#58605b] group-hover:translate-x-1 transition-transform" />
          </div>
        </section>

        {/* Care Tips Quick Section */}
        <section className="bg-white rounded-2xl border border-[#D8E4DA]/40 p-4 shadow-xs">
          <h3 className="font-heading font-bold text-sm text-[#181c1a] mb-3">Care Tips</h3>
          <div
            onClick={() => onNavigateToTab('learn')}
            className="flex items-center gap-4 p-3 bg-[#f1f4f0] rounded-xl transition-all hover:bg-[#ecefeb] cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-lg bg-[#006038]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[#006038]">tips_and_updates</span>
            </div>
            <div className="flex-grow min-w-0">
              <p className="font-heading font-bold text-xs text-[#181c1a]">Pruning for growth</p>
              <p className="text-[#58605b] text-[10px] truncate">Pinch the top leaves to encourage bushiness.</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#58605b] group-hover:translate-x-1 transition-transform" />
          </div>
        </section>

      </main>

      {/* FIXED CONTEXTUAL FAB: Starts Replant / Capsule Replacement workflow */}
      <button
        onClick={onReplant}
        className="fixed right-5 bottom-24 w-14 h-14 bg-[#006038] text-white rounded-2xl shadow-xl hover:bg-[#165E3A] active:scale-90 hover:scale-105 transition-all flex items-center justify-center z-40"
        title="Start New Seed Pod"
        id="dashboard-replant-fab"
      >
        <span className="material-symbols-outlined text-[24px]">add</span>
      </button>

      {/* --- WATER STATUS DETAIL MODAL --- */}
      {activeModal === 'water' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-5 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 border border-[#D8E4DA] shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#D8E4DA]/30">
              <h3 className="font-heading font-bold text-base text-[#181c1a] flex items-center gap-2">
                <Droplet className="w-5 h-5 text-[#006038]" /> Reservoir Status
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-slate-600 leading-relaxed">
                AgriNexus operates on passive sub-irrigation. Water level readings are continuously evaluated by capacitive float probes inside the base.
              </p>
              <div className="p-3 bg-[#f1f4f0] rounded-xl space-y-1">
                <p className="font-bold">Current Fluid Volume: <span className="text-[#006038]">92% (2.3 Liters)</span></p>
                <p className="text-slate-500 text-[10px]">Optimal fill level requires 2.5L capacity</p>
              </div>
              <p className="text-slate-600">
                To refill, simply pull open the lateral kitchen port drawer and add fresh tap water. The device beep chime will stop immediately once optimal fill index is reached.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- LIGHT STATUS DETAIL MODAL --- */}
      {activeModal === 'light' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-5 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 border border-[#D8E4DA] shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#D8E4DA]/30">
              <h3 className="font-heading font-bold text-base text-[#181c1a] flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" /> Grow Light Schedule
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Photosynthetic LEDs regulate cellular plant mitosis automatically. Your garden triggers:
              </p>
              <div className="p-3 bg-[#f1f4f0] rounded-xl space-y-2">
                <p className="font-bold text-[#006038]">14 Hours Active Daylight Photoperiod</p>
                <p className="font-bold text-slate-500">10 Hours Dark Dormancy Period</p>
                <p className="text-slate-500 text-[10px]">Synchronized daily starting at 06:30 AM</p>
              </div>
              <p className="text-slate-600">
                Our red and blue spectrum matches the exact absorption peaks of Chlorophyll A &amp; B, accelerating photosynthesis while ignoring wasteful heat output.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- pH STATUS DETAIL MODAL --- */}
      {activeModal === 'ph' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-5 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 border border-[#D8E4DA] shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#D8E4DA]/30">
              <h3 className="font-heading font-bold text-base text-[#181c1a] flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[#006038]" /> pH Buffer System
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-slate-600 leading-relaxed">
                In soil-less setups, root absorption of trace elements relies entirely on water acidity balance:
              </p>
              <div className="p-3 bg-[#f1f4f0] rounded-xl space-y-1">
                <p className="font-bold text-[#006038]">Optimal Sweet Spot: 6.0 - 6.5 pH</p>
                <p className="text-slate-500 text-[10px]">Calibrated buffer tablets dissolve automatically inside the coir capsule.</p>
              </div>
              <p className="text-slate-600">
                If the pH climbs outside this range, nutrient molecules bond tightly with water molecules, locking out iron and copper absorption. AgriNexus is keeping this steady for your {plant.name} automatically!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- HARVEST STATUS DETAIL MODAL --- */}
      {activeModal === 'harvest' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-5 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 border border-[#D8E4DA] shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#D8E4DA]/30">
              <h3 className="font-heading font-bold text-base text-[#181c1a] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#006038]" /> Harvest Schedule
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Estimated harvesting target for <span className="font-bold text-[#006038]">{plant.name}</span>:
              </p>
              <div className="p-3 bg-[#f1f4f0] rounded-xl space-y-2">
                <p className="font-bold">Total Growing Cycle: <span className="text-[#006038]">{plant.growingDaysMax} Days</span></p>
                <p className="font-bold text-amber-600">First Pruning Stage: Day {plant.growingDaysMax - plant.harvestOffsetDays}</p>
                <p className="text-slate-500 text-[10px]">Estimated full-yield harvest date: {getEstHarvestDate()}</p>
              </div>
              <p className="text-slate-600">
                Once mature, harvest only the topmost 30% of foliage to allow internal shoots to regenerate continually for months of continuous garnishes!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- PROFILE, SETTINGS & ONBOARDING RESET MODAL --- */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-5 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 border border-[#D8E4DA] shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#D8E4DA]/30">
              <h3 className="font-heading font-bold text-base text-[#181c1a] flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-700" /> Account Settings
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 bg-[#f1f4f0] p-3 rounded-xl border border-[#D8E4DA]/50">
              <div className="w-10 h-10 rounded-full bg-[#ecefeb] overflow-hidden flex items-center justify-center ring-2 ring-[#006038]/20 flex-shrink-0">
                {avatarUrl ? (
                  <img className="w-full h-full object-cover" src={avatarUrl} alt={userName} />
                ) : (
                  <span className="material-symbols-outlined text-slate-500 text-[20px]">person</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#181c1a] truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-600">Testing Tools:</p>
              
              <button
                onClick={() => {
                  setActiveModal(null);
                  onResetSetup();
                }}
                className="w-full py-3 px-4 bg-[#ba1a1a]/10 hover:bg-[#ba1a1a]/20 text-[#ba1a1a] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-[#ba1a1a]/20"
                id="profile-reset-onboarding-btn"
              >
                <RotateCcw className="w-4 h-4" /> Restart Setup Guide
              </button>
              
              <p className="text-[10px] text-slate-400 text-center leading-normal">
                Restarting the setup guide lets you test Step 1-5 of placing, adding water, capsule clipping, QR handshaking, and crop choice again.
              </p>
            </div>

            <div className="pt-2 border-t border-[#D8E4DA]/30 text-center">
              <button
                onClick={() => {
                  setActiveModal(null);
                  onResetSetup(); // Trigger full logout/reset to intro
                }}
                className="text-xs font-bold text-slate-500 hover:text-[#ba1a1a] flex items-center gap-1 mx-auto"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out from Companion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
