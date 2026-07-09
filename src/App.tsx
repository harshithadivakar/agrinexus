import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Info, ShoppingBag, BookOpen, HeartHandshake, Camera, Stethoscope } from 'lucide-react';

import WelcomeScreen from './components/WelcomeScreen';
import SetupScreen from './components/SetupScreen';
import PairingScreen from './components/PairingScreen';
import PlantChoiceScreen from './components/PlantChoiceScreen';
import GardenDashboardScreen from './components/GardenDashboardScreen';
import DiagnoseScreen from './components/DiagnoseScreen';
import LearnScreen from './components/LearnScreen';
import SupportScreen from './components/SupportScreen';

import { ActiveScreen, GardenState, APPROVED_PLANTS, Plant } from './types';
import { checkSupabaseConnection, fetchGardenState, syncGardenState, fetchUserProfile, signOutWithSupabase, getCurrentSupabaseUser } from './supabase';

export default function App() {
  // Session details stored in localStorage for robust testing persistence
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('agrinexus_user_email');
  });
  
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('agrinexus_user_name') || 'Harshitha';
  });

  const [avatarUrl] = useState<string>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA-pSa_IucwmwRGXJyRWQrO8yFCM8eyRghyxq1LiniSczZWnRbUMT4kKDMoxEhI6jtBrudNQwggzpK_L7frgc717pveE4LZg9YBYyq4uIJ2sFVo1SNGrFMGA9PA0oUH8r7vo4G_zuoV1aJhsAfhLS4EALueiytpGDpmejjSX1eP8d3VLuMb5NELIJQuXpS7fIAbxS_MYLwQXD3Y3rCJ1nIYqHjoorGEfSNfDJ03W1cZviB9T-cQ8O9f9VBXH1_QrWmPFdGUN496ubhO'
  );

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(() => {
    const savedScreen = localStorage.getItem('agrinexus_active_screen');
    if (savedScreen) return savedScreen as ActiveScreen;
    return localStorage.getItem('agrinexus_user_email') ? 'setup' : 'welcome';
  });

  const [gardenState, setGardenState] = useState<GardenState>(() => {
    const savedState = localStorage.getItem('agrinexus_garden_state');
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        // use default fallback
      }
    }
    return {
      isPaired: false,
      pairedDeviceId: null,
      setupCompleted: false,
      setupStep: 1,
      selectedPlantId: null,
      setupDate: null,
      waterLevel: 'optimal',
      lightStatus: 'on_schedule',
      phStatus: 'steady',
    };
  });

  // Persist State Changes
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('agrinexus_user_email', userEmail);
    } else {
      localStorage.removeItem('agrinexus_user_email');
    }
  }, [userEmail]);

  useEffect(() => {
    localStorage.setItem('agrinexus_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('agrinexus_active_screen', activeScreen);
  }, [activeScreen]);

  useEffect(() => {
    localStorage.setItem('agrinexus_garden_state', JSON.stringify(gardenState));
  }, [gardenState]);

  // Load garden state and profile from Supabase on login
  useEffect(() => {
    async function loadCloudState() {
      if (!userEmail) return;
      try {
        const isConnected = await checkSupabaseConnection();
        if (isConnected) {
          // Trust a live Supabase session over the cached localStorage email -
          // if the session has expired or was never real, don't stay "logged in".
          const currentUser = await getCurrentSupabaseUser();
          if (!currentUser) {
            console.log('No active Supabase session found. Logging out.');
            setUserEmail(null);
            setActiveScreen('welcome');
            return;
          }

          console.log('Loading state from Supabase...');
          const cloudState = await fetchGardenState();
          if (cloudState) {
            setGardenState(cloudState);
            // Navigate based on whether setup is completed
            if (cloudState.setupCompleted && cloudState.selectedPlantId) {
              setActiveScreen('garden');
            } else {
              setActiveScreen('setup');
            }
          }
          const profile = await fetchUserProfile();
          if (profile && profile.name) {
            setUserName(profile.name);
          }
        }
      } catch (err) {
        console.error('Error loading state from Supabase:', err);
      }
    }
    loadCloudState();
  }, [userEmail]);

  // Sync garden state to Supabase on state change (with simple debounce)
  useEffect(() => {
    let active = true;
    async function syncCloudState() {
      if (!userEmail) return;
      try {
        const isConnected = await checkSupabaseConnection();
        if (isConnected && active) {
          console.log('Syncing state to Supabase...');
          await syncGardenState(gardenState);
        }
      } catch (err) {
        console.error('Error syncing state to Supabase:', err);
      }
    }
    
    const timeoutId = setTimeout(() => {
      syncCloudState();
    }, 600);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [gardenState, userEmail]);

  // Actions
  const handleLogin = (email: string, name: string) => {
    setUserEmail(email);
    setUserName(name || 'Harshitha');
    
    // Check if they completed setup already
    if (gardenState.setupCompleted && gardenState.selectedPlantId) {
      setActiveScreen('garden');
    } else {
      setActiveScreen('setup');
    }
  };

  const handleStepChange = (step: number) => {
    setGardenState(prev => ({
      ...prev,
      setupStep: step
    }));
  };

  const handleSkipSetup = () => {
    // Skips directly to dashboard with a fallback plant (e.g. Sweet Basil)
    setGardenState(prev => ({
      ...prev,
      isPaired: true,
      pairedDeviceId: 'AN-9842-X7',
      selectedPlantId: 'sweet_basil',
      setupCompleted: true,
      setupDate: new Date().toISOString()
    }));
    setActiveScreen('garden');
  };

  const handlePairingSuccess = (deviceId: string) => {
    setGardenState(prev => ({
      ...prev,
      isPaired: true,
      pairedDeviceId: deviceId,
      setupStep: 5 // Proceeds to Plant selection next
    }));
    setActiveScreen('setup');
  };

  const handlePlantSelect = (plant: Plant) => {
    setGardenState(prev => ({
      ...prev,
      selectedPlantId: plant.id,
      setupCompleted: true,
      setupDate: new Date().toISOString()
    }));
    setActiveScreen('garden');
  };

  const handleResetSetup = () => {
    // Resets state completely to simulate setup steps
    localStorage.clear();
    signOutWithSupabase().catch(err => console.error('Error logging out:', err));
    setUserEmail(null);
    setUserName('Harshitha');
    setGardenState({
      isPaired: false,
      pairedDeviceId: null,
      setupCompleted: false,
      setupStep: 1,
      selectedPlantId: null,
      setupDate: null,
      waterLevel: 'optimal',
      lightStatus: 'on_schedule',
      phStatus: 'steady',
    });
    setActiveScreen('welcome');
  };

  const handleReplant = () => {
    // Puts user back into plant selection screen
    setActiveScreen('plant_choice');
  };

  // Safe accessor for current active crop model
  const activePlant = APPROVED_PLANTS.find(p => p.id === gardenState.selectedPlantId) || APPROVED_PLANTS[0];

  // Render correct tab frame based on screen state
  const renderTabContent = () => {
    switch (activeScreen) {
      case 'garden':
        return (
          <GardenDashboardScreen
            plant={activePlant}
            gardenState={gardenState}
            userName={userName}
            userEmail={userEmail || ''}
            avatarUrl={avatarUrl}
            onResetSetup={handleResetSetup}
            onReplant={handleReplant}
            onNavigateToTab={(tab) => setActiveScreen(tab)}
          />
        );
      case 'diagnose':
        return <DiagnoseScreen activePlantName={activePlant.name} />;
      case 'learn':
        return <LearnScreen activePlantName={activePlant.name} />;
      case 'support':
        return <SupportScreen userEmail={userEmail || undefined} userName={userName} />;
      default:
        return (
          <GardenDashboardScreen
            plant={activePlant}
            gardenState={gardenState}
            userName={userName}
            userEmail={userEmail || ''}
            avatarUrl={avatarUrl}
            onResetSetup={handleResetSetup}
            onReplant={handleReplant}
            onNavigateToTab={(tab) => setActiveScreen(tab)}
          />
        );
    }
  };

  const showGlobalNav = ['garden', 'diagnose', 'learn', 'support'].includes(activeScreen);

  return (
    <div className="relative min-h-screen bg-[#f7faf6] text-[#181c1a] font-sans antialiased overflow-x-hidden selection:bg-[#9ef5be]">
      <AnimatePresence mode="wait">
        {!userEmail || activeScreen === 'welcome' ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeScreen onNext={handleLogin} />
          </motion.div>
        ) : activeScreen === 'setup' ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            <SetupScreen
              currentStep={gardenState.setupStep}
              userName={userName}
              avatarUrl={avatarUrl}
              onStepChange={handleStepChange}
              onSkip={handleSkipSetup}
              onGoToPairing={() => setActiveScreen('pairing')}
              onGoToPlantChoice={() => setActiveScreen('plant_choice')}
              selectedPlantName={gardenState.selectedPlantId ? activePlant.name : null}
              isPaired={gardenState.isPaired}
            />
          </motion.div>
        ) : activeScreen === 'pairing' ? (
          <motion.div
            key="pairing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PairingScreen
              onBack={() => setActiveScreen('setup')}
              onSuccess={handlePairingSuccess}
            />
          </motion.div>
        ) : activeScreen === 'plant_choice' ? (
          <motion.div
            key="plant_choice"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PlantChoiceScreen
              onBack={() => {
                if (gardenState.setupCompleted) {
                  setActiveScreen('garden');
                } else {
                  setActiveScreen('setup');
                }
              }}
              onSelect={handlePlantSelect}
              initialSelectedId={gardenState.selectedPlantId}
            />
          </motion.div>
        ) : (
          /* Active Tabs Layout Frame with fixed bottom nav */
          <motion.div
            key="tabs-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col justify-between"
          >
            <div className="w-full flex-grow">{renderTabContent()}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED GLOBAL TABS BOTTOM NAVIGATION BAR (Suppressed inside onboarding step screens) */}
      {showGlobalNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#ecefeb] border-t border-[#D8E4DA]/50 shadow-lg flex justify-around items-center h-[80px] pb-safe max-w-md mx-auto rounded-t-2xl">
          {/* Garden Tab */}
          <button
            onClick={() => setActiveScreen('garden')}
            id="tab-garden-btn"
            className={`flex flex-col items-center justify-center py-2 px-4 rounded-full transition-all duration-300 ${
              activeScreen === 'garden'
                ? 'bg-[#1f7a4d] text-white shadow-xs'
                : 'text-[#3f4941] hover:text-[#006038] hover:bg-[#ecefeb]/60'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">home_max</span>
            <span className="text-[10px] font-heading font-bold mt-0.5">Garden</span>
          </button>

          {/* Diagnose Tab */}
          <button
            onClick={() => setActiveScreen('diagnose')}
            id="tab-diagnose-btn"
            className={`flex flex-col items-center justify-center py-2 px-4 rounded-full transition-all duration-300 ${
              activeScreen === 'diagnose'
                ? 'bg-[#1f7a4d] text-white shadow-xs'
                : 'text-[#3f4941] hover:text-[#006038] hover:bg-[#ecefeb]/60'
            }`}
          >
            <span className="relative inline-flex w-[22px] h-[22px]">
              <Stethoscope className="w-[22px] h-[22px]" />
              <span className="absolute -bottom-1 -right-1.5 flex items-center justify-center w-[13px] h-[13px] rounded-full bg-white">
                <Camera className="w-[9px] h-[9px] text-[#1f7a4d]" strokeWidth={3} />
              </span>
            </span>
            <span className="text-[10px] font-heading font-bold mt-0.5">Diagnose</span>
          </button>

          {/* Learn Tab */}
          <button
            onClick={() => setActiveScreen('learn')}
            id="tab-learn-btn"
            className={`flex flex-col items-center justify-center py-2 px-4 rounded-full transition-all duration-300 ${
              activeScreen === 'learn'
                ? 'bg-[#1f7a4d] text-white shadow-xs'
                : 'text-[#3f4941] hover:text-[#006038] hover:bg-[#ecefeb]/60'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">menu_book</span>
            <span className="text-[10px] font-heading font-bold mt-0.5">Learn</span>
          </button>

          {/* Support Tab */}
          <button
            onClick={() => setActiveScreen('support')}
            id="tab-support-btn"
            className={`flex flex-col items-center justify-center py-2 px-4 rounded-full transition-all duration-300 ${
              activeScreen === 'support'
                ? 'bg-[#1f7a4d] text-white shadow-xs'
                : 'text-[#3f4941] hover:text-[#006038] hover:bg-[#ecefeb]/60'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">contact_support</span>
            <span className="text-[10px] font-heading font-bold mt-0.5">Support</span>
          </button>
        </nav>
      )}
    </div>
  );
}
