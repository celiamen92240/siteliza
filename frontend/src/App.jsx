import React, { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import MobileShell from './components/MobileShell';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeView from './views/HomeView';
import PredictionsView from './views/PredictionsView';
import QuizView from './views/QuizView';
import DailyGameView from './views/DailyGameView';
import PollsView from './views/PollsView';
import ParentsSpaceView from './views/ParentsSpaceView';
import GuestbookView from './views/GuestbookView';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [isGameActive, setIsGameActive] = useState(false);
  const [isBorn, setIsBorn] = useState(false);
  const [actualBirth, setActualBirth] = useState(null);

  const checkBirthStatus = () => {
    fetch('/api/predictions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsBorn(!!data.isBorn);
          setActualBirth(data.actualBirth || null);
        }
      })
      .catch(err => console.error("Error checking birth status", err));
  };

  useEffect(() => {
    checkBirthStatus();
  }, []);

  return (
    <MobileShell>
      {/* Header */}
      <Header
        onAdminClick={() => setCurrentTab('parents')}
        isBorn={isBorn}
      />

      {/* Main Tab Content */}
      <div className="pt-2">
        {currentTab === 'home' && (
          <HomeView
            setTab={setCurrentTab}
            isBorn={isBorn}
            actualBirth={actualBirth}
          />
        )}

        {currentTab === 'predictions' && (
          <PredictionsView
            isBorn={isBorn}
            actualBirth={actualBirth}
            onOpenAdmin={() => setCurrentTab('parents')}
          />
        )}

        {currentTab === 'quiz' && (
          <QuizView />
        )}

        {currentTab === 'games' && (
          <DailyGameView
            onBack={() => setCurrentTab('home')}
            onGameActiveChange={setIsGameActive}
          />
        )}

        {currentTab === 'polls' && (
          <PollsView />
        )}

        {currentTab === 'parents' && (
          <ParentsSpaceView
            isBorn={isBorn}
            actualBirth={actualBirth}
            onBirthSaved={(birthData) => {
              setIsBorn(true);
              setActualBirth(birthData);
            }}
            onResetBirth={() => {
              setIsBorn(false);
              setActualBirth(null);
            }}
          />
        )}

        {currentTab === 'guestbook' && (
          <GuestbookView />
        )}
      </div>

      {/* Footer Signature */}
      <footer className="text-center py-5 pb-24 space-y-1">
        <p className="font-serif text-xs font-black text-[#812348] tracking-wide flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#F2619C] fill-[#FFE066]" />
          <span>Fait par la meilleure des tatas, Célia</span>
          <Heart className="w-3.5 h-3.5 text-[#F2619C] fill-[#F2619C]" />
        </p>
        <p className="text-[10px] text-slate-400 font-medium">
          En attendant le plus beau des jours J
        </p>
      </footer>

      {/* Bottom Navigation (Cachée UNIQUEMENT pendant le chrono du jeu, visible dès que terminé ou avant de démarrer) */}
      {(!isGameActive || currentTab !== 'games') && (
        <BottomNav
          currentTab={currentTab}
          setTab={setCurrentTab}
        />
      )}
    </MobileShell>
  );
}
