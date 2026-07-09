import React, { useState, useEffect, useRef } from 'react';
import { Droplet, Sun, FlaskConical, Calendar, ChevronRight, AlertCircle, X, RotateCcw, Settings, LogOut, Info, Stethoscope, RefreshCw, Volume2, Loader2 } from 'lucide-react';
import { Plant, APPROVED_PLANTS, GardenState } from '../types';
import { fetchAllPlantConditions, syncPlantCondition, PlantCondition } from '../supabase';

type PlantMood = 'happy' | 'needy' | 'distressed';
type PlantIssue = 'water_low' | 'water_critical' | 'light_off' | 'ph_high' | 'ph_low';

const LOCAL_VOICE_FALLBACK: Record<PlantMood, string> = {
  happy: "Feeling good today. Thanks for checking in on me!",
  needy: "Hellooo? Anyone there? I could use a little attention.",
  distressed: "Stop ignoring me. I mean it this time.",
};

// Shared talking-plant logic: fetches a personality line for a given plant+mood
// (optionally grounded in specific issues like "water is low") and can speak it
// aloud. Used both by the hero card's speech bubble and the garden grid orbs.
function usePlantVoice(plantName: string, mood: PlantMood, issues: PlantIssue[] = []) {
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
        body: JSON.stringify({ plantName, mood, issues }),
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
  }, [mood, plantName, issues.join(',')]);

  return { line, loading, audioLoading, playLine, refetch: fetchLine };
}

function PlantSpeechBubble({ plantName, mood }: { plantName: string; mood: PlantMood }) {
  const { line, loading, audioLoading, playLine, refetch } = usePlantVoice(plantName, mood);

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
              onClick={refetch}
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

// Four concrete water/light/pH combinations, each grounded in a specific real cause
// (rather than a generic mood), so the plant complains about the actual problem -
// "I need water" instead of "I feel neglected".
const STATE_PRESETS: Array<{ label: string; condition: PlantCondition; mood: PlantMood; issues: PlantIssue[] }> = [
  { label: 'Healthy', condition: { waterLevel: 'optimal', lightStatus: 'on_schedule', phStatus: 'steady' }, mood: 'happy', issues: [] },
  { label: 'Thirsty', condition: { waterLevel: 'critical', lightStatus: 'on_schedule', phStatus: 'steady' }, mood: 'needy', issues: ['water_critical'] },
  { label: 'Needs more light', condition: { waterLevel: 'optimal', lightStatus: 'off', phStatus: 'steady' }, mood: 'needy', issues: ['light_off'] },
  { label: 'Struggling', condition: { waterLevel: 'critical', lightStatus: 'off', phStatus: 'high' }, mood: 'distressed', issues: ['water_critical', 'light_off', 'ph_high'] },
];

function presetIndexForCondition(condition: PlantCondition | undefined): number {
  if (!condition) return 0;
  const idx = STATE_PRESETS.findIndex(
    (p) =>
      p.condition.waterLevel === condition.waterLevel &&
      p.condition.lightStatus === condition.lightStatus &&
      p.condition.phStatus === condition.phStatus
  );
  return idx === -1 ? 0 : idx;
}

// What the person should actually do about each issue - shown in the plant's detail view.
const ISSUE_ACTION: Record<PlantIssue, string> = {
  water_critical: 'Add water to the reservoir today - it\'s critically low.',
  water_low: 'Top up the water reservoir soon.',
  light_off: 'Move this plant somewhere sunnier, or turn its grow light back on.',
  ph_high: 'Check the nutrient solution - pH is too alkaline.',
  ph_low: 'Check the nutrient solution - pH is too acidic.',
};

const MOOD_RING: Record<PlantMood, string> = {
  happy: 'ring-[#1f7a4d]',
  needy: 'ring-amber-500',
  distressed: 'ring-red-500',
};
const MOOD_DOT: Record<PlantMood, string> = {
  happy: 'bg-[#1f7a4d]',
  needy: 'bg-amber-500',
  distressed: 'bg-red-500',
};

// One circular avatar in the garden grid: its own independently-controllable
// water/light/pH state (tap to cycle through presets), its own speech bubble
// grounded in that specific state, and its own voice - so different plants can
// say different, specific things at once ("I'm thirsty" vs "move me to more light").
function PlantOrb({
  plant,
  initialCondition,
  onConditionChange,
}: {
  plant: Plant;
  initialCondition?: PlantCondition;
  onConditionChange: (plantId: string, condition: PlantCondition) => void;
}) {
  const [presetIndex, setPresetIndex] = useState(() => presetIndexForCondition(initialCondition));
  // Adopt the persisted condition once it arrives from Supabase (it loads async, after first render)
  useEffect(() => {
    if (initialCondition) setPresetIndex(presetIndexForCondition(initialCondition));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCondition?.waterLevel, initialCondition?.lightStatus, initialCondition?.phStatus]);

  const preset = STATE_PRESETS[presetIndex];
  const { line, loading, audioLoading, playLine } = usePlantVoice(plant.name, preset.mood, preset.issues);
  const [showDetail, setShowDetail] = useState(false);

  const cyclePreset = () => {
    const nextIndex = (presetIndex + 1) % STATE_PRESETS.length;
    setPresetIndex(nextIndex);
    onConditionChange(plant.id, STATE_PRESETS[nextIndex].condition);
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={() => setShowDetail(true)}
        className={`relative w-14 h-14 rounded-full overflow-hidden ring-[3px] ${MOOD_RING[preset.mood]} shadow-sm active:scale-95 transition-transform`}
        title={`See why ${plant.name} feels this way (currently: ${preset.label})`}
      >
        <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover" />
        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${MOOD_DOT[preset.mood]}`} />
      </button>
      <p className="text-[9px] font-heading font-bold text-[#181c1a] text-center leading-tight truncate w-full">
        {plant.name}
      </p>
      <div className="w-full bg-white rounded-xl border border-[#D8E4DA]/50 shadow-xs px-1.5 py-1.5 min-h-[46px] flex items-center gap-1">
        {loading ? (
          <span className="flex items-center gap-1 py-1 mx-auto">
            <span className="w-1 h-1 bg-[#006038]/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1 h-1 bg-[#006038]/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1 h-1 bg-[#006038]/60 rounded-full animate-bounce"></span>
          </span>
        ) : (
          <p className="text-[8.5px] font-medium text-[#181c1a] leading-tight flex-grow">{line}</p>
        )}
        <button
          onClick={() => playLine(line)}
          disabled={loading || audioLoading || !line}
          className="flex-shrink-0 p-0.5 rounded-full hover:bg-black/5 active:scale-90 transition-transform disabled:opacity-40"
          title={`Hear ${plant.name}`}
        >
          {audioLoading ? (
            <Loader2 className="w-2.5 h-2.5 text-[#006038] animate-spin" />
          ) : (
            <Volume2 className="w-2.5 h-2.5 text-[#006038]" />
          )}
        </button>
      </div>

      {showDetail && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-5 animate-fade-in"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm p-5 border border-[#D8E4DA] shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#D8E4DA]/30">
              <h3 className="font-heading font-bold text-base text-[#181c1a] flex items-center gap-2">
                <img src={plant.imageUrl} alt={plant.name} className="w-8 h-8 rounded-full object-cover" />
                {plant.name}
              </h3>
              <button onClick={() => setShowDetail(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {plant.name}'s current status: <strong className="text-[#181c1a]">{preset.label}</strong>
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-xs p-2.5 bg-[#f1f4f0] rounded-xl">
                <Droplet className={`w-4 h-4 flex-shrink-0 ${preset.condition.waterLevel !== 'optimal' ? 'text-red-500' : 'text-[#006038]'}`} />
                <span>
                  Water: <strong>{preset.condition.waterLevel === 'optimal' ? 'Optimal' : preset.condition.waterLevel === 'low' ? 'Low' : 'Critical'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs p-2.5 bg-[#f1f4f0] rounded-xl">
                <Sun className={`w-4 h-4 flex-shrink-0 ${preset.condition.lightStatus === 'off' ? 'text-slate-400' : 'text-amber-500'}`} />
                <span>
                  Light: <strong>{preset.condition.lightStatus === 'off' ? 'Not enough' : 'On schedule'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs p-2.5 bg-[#f1f4f0] rounded-xl">
                <FlaskConical className={`w-4 h-4 flex-shrink-0 ${preset.condition.phStatus !== 'steady' ? 'text-amber-500' : 'text-[#006038]'}`} />
                <span>
                  pH: <strong>{preset.condition.phStatus === 'steady' ? 'Balanced' : preset.condition.phStatus === 'high' ? 'Too alkaline' : 'Too acidic'}</strong>
                </span>
              </div>
            </div>

            {preset.issues.length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#58605b]">What {plant.name} needs from you</p>
                {preset.issues.map((issue) => (
                  <p key={issue} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">•</span> {ISSUE_ACTION[issue]}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#006038] font-medium">Nothing needed right now - just keep it up!</p>
            )}

            <button
              onClick={cyclePreset}
              className="w-full py-2.5 bg-[#006038] text-white rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#165E3A] active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Simulate a different condition
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const GARDENER_GREETINGS = [
  "Hey! How's your day been? Your plants have been waiting to catch up with you 🌿",
  "Welcome back! Take a peek below - your garden's got a few things to tell you.",
  "Hi there! Before anything else, your plants wanted a quick word with you.",
  "Good to see you. Scroll down - everyone in the garden's got something to say today.",
];

// A one-line "remote gardener" greeting that opens the dashboard, before the
// plants themselves each get a chance to say their own thing below.
function GardenerGreeting() {
  const [greeting] = useState(() => GARDENER_GREETINGS[Math.floor(Math.random() * GARDENER_GREETINGS.length)]);

  return (
    <div className="flex items-start gap-2.5 bg-[#eaf6ee] border border-[#1f7a4d]/20 rounded-2xl px-4 py-3">
      <span className="text-xl leading-none">🧑‍🌾</span>
      <div className="min-w-0">
        <p className="text-[9px] uppercase font-bold tracking-wider text-[#1f7a4d] mb-0.5">Your Gardener</p>
        <p className="text-[12px] font-semibold text-[#181c1a] leading-snug">{greeting}</p>
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
  
  // Growing day for the hero card - per-plant water/light/pH states now live in the
  // garden grid below instead, so the hero's mood is always its healthy default.
  const growingDay = 12;
  const plantMood: PlantMood = 'happy';

  // Per-plant water/light/pH conditions for the garden grid, persisted to Supabase
  // (one row per user per plant) so each plant's state survives a reload.
  const [plantConditions, setPlantConditions] = useState<Record<string, PlantCondition>>({});

  useEffect(() => {
    fetchAllPlantConditions().then(setPlantConditions);
  }, []);

  const handlePlantConditionChange = (plantId: string, condition: PlantCondition) => {
    setPlantConditions((prev) => ({ ...prev, [plantId]: condition }));
    syncPlantCondition(plantId, condition);
  };

  // Harvest date calculation
  const getEstHarvestDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + plant.harvestOffsetDays);
    return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

        {/* Remote Gardener Greeting */}
        <GardenerGreeting />

        {/* Garden Grid: each plant has its own independently-controllable mood and voice */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-sm text-[#181c1a]">Your Garden</h3>
            <span className="text-[9px] text-[#58605b]">Tap a plant to see how it's doing</span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {APPROVED_PLANTS.map((p) => (
              <PlantOrb
                key={p.id}
                plant={p}
                initialCondition={plantConditions[p.id]}
                onConditionChange={handlePlantConditionChange}
              />
            ))}
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
                <Droplet className="w-5 h-5 text-[#006038]" />
                <span className="font-heading font-bold text-xs uppercase tracking-wider">Water</span>
              </div>
              <div>
                <p className="font-heading text-lg font-extrabold text-[#006038]">Ready</p>
                <p className="text-[#58605b] text-[11px] mt-0.5 leading-tight">Level is optimal</p>
              </div>
            </div>

            {/* Light Tile */}
            <div
              onClick={() => setActiveModal('light')}
              className="p-4 bg-white rounded-2xl border border-[#D8E4DA]/40 shadow-xs cursor-pointer hover:border-[#006038]/50 hover:shadow-sm transition-all flex flex-col justify-between h-32 select-none group"
            >
              <div className="flex items-center gap-1.5 text-[#58605b] group-hover:text-[#006038] transition-colors">
                <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />
                <span className="font-heading font-bold text-xs uppercase tracking-wider">Light</span>
              </div>
              <div>
                <p className="font-heading text-lg font-extrabold text-[#006038]">On Schedule</p>
                <p className="text-[#58605b] text-[11px] mt-0.5 leading-tight">14h / 10h cycle</p>
              </div>
            </div>

            {/* pH Tile */}
            <div
              onClick={() => setActiveModal('ph')}
              className="p-4 bg-white rounded-2xl border border-[#D8E4DA]/40 shadow-xs cursor-pointer hover:border-[#006038]/50 hover:shadow-sm transition-all flex flex-col justify-between h-32 select-none group"
            >
              <div className="flex items-center gap-1.5 text-[#58605b] group-hover:text-[#006038] transition-colors">
                <FlaskConical className="w-5 h-5 text-[#006038]" />
                <span className="font-heading font-bold text-xs uppercase tracking-wider">pH</span>
              </div>
              <div>
                <p className="font-heading text-lg font-extrabold text-[#006038]">Steady</p>
                <p className="text-[#58605b] text-[11px] mt-0.5 leading-tight">6.2 pH balanced</p>
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
