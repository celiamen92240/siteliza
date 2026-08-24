import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Heart, Gift, MessageCircle, HelpCircle, Target, ArrowRight, Lightbulb, Lock } from 'lucide-react';
import { fruitsData } from '../data/fruitsData';

export default function HomeView({ setTab, onTabChange }) {
  const [dailyFact, setDailyFact] = useState(null);
  const [loadingFact, setLoadingFact] = useState(true);

  // Calcul automatique de la semaine de grossesse en temps réel (terme 08/12/2026)
  const getAutoPregnancyWeek = () => {
    const termDate = new Date('2026-12-08T00:00:00');
    const pregnancyStart = new Date(termDate.getTime() - (40 * 7 * 24 * 60 * 60 * 1000));
    const now = new Date();
    const elapsedWeeks = Math.floor((now - pregnancyStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
    return Math.min(40, Math.max(1, elapsedWeeks));
  };

  const currentWeek = getAutoPregnancyWeek();

  const navigate = (tabId) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onTabChange) onTabChange(tabId);
    if (setTab) setTab(tabId);
  };

  // Real-time Countdown Calculation
  const calculateTimeLeft = () => {
    const termDate = new Date('2026-12-08T00:00:00');
    const difference = +termDate - +new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/daily-fact')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDailyFact(data.fact);
        }
        setLoadingFact(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingFact(false);
      });
  }, []);

  const fruitInfo = fruitsData.find(f => f.week === currentWeek) || fruitsData.find(f => f.week === 26) || fruitsData[0];

  return (
    <div className="px-5 space-y-5 pb-6">
      {/* 1. COMPTE À REBOURS DU JOUR J (CLIQUABLE VERS LES PRONOS) */}
      <div
        onClick={() => navigate('predictions')}
        className="bg-gradient-to-br from-[#F2619C] via-[#f06ea5] to-[#E7BEF8] rounded-3xl p-5 shadow-lg border-2 border-[#F2619C]/30 relative overflow-hidden space-y-4 cursor-pointer hover:shadow-xl active:scale-[0.99] transition-all group text-white"
        title="Cliquer pour faire tes pronostics"
      >
        {/* Soft Decorative Glow */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#78350f] bg-[#FFE066] px-3 py-1 rounded-full border border-white/60 flex items-center gap-1.5 w-fit shadow-xs">
              <span>Jour J • 08 Décembre 2026</span>
              <ArrowRight className="w-3 h-3 text-[#812348] group-hover:translate-x-0.5 transition-transform" />
            </span>
            <h2 className="font-serif text-2xl font-black text-white tracking-tight drop-shadow-xs">
              Compte à Rebours Naissance
            </h2>
            <p className="text-xs text-white/90 font-medium">
              Semaine {currentWeek} de grossesse • 6ème mois ✨
            </p>
          </div>

          <div className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-md border-2 border-white flex flex-col items-center justify-center text-center">
            <span className="text-2xl leading-none">👶</span>
            <span className="text-[9px] font-extrabold text-[#F2619C] mt-1 leading-tight">Princesse</span>
          </div>
        </div>

        {/* 4 CARTOUCHES DE TEMPS RÉEL */}
        <div className="grid grid-cols-4 gap-2 pt-1 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 text-center shadow-md border border-[#FFE066]">
            <span className="block font-serif text-2xl font-black text-[#F2619C] leading-none">
              {timeLeft.days}
            </span>
            <span className="text-[9px] uppercase font-black text-slate-400 mt-1 block">Jours</span>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 text-center shadow-md border border-[#FFE066]">
            <span className="block font-serif text-2xl font-black text-[#93ABD9] leading-none">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-black text-slate-400 mt-1 block">Heures</span>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 text-center shadow-md border border-[#FFE066]">
            <span className="block font-serif text-2xl font-black text-[#93ABD9] leading-none">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-black text-slate-400 mt-1 block">Min</span>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 text-center shadow-md border border-[#FFE066]">
            <span className="block font-serif text-2xl font-black text-[#F2619C] leading-none animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] uppercase font-black text-slate-400 mt-1 block">Sec</span>
          </div>
        </div>

        {/* Pregnancy Progress Bar */}
        <div className="space-y-1.5 pt-1 relative z-10">
          <div className="flex justify-between text-[11px] font-extrabold text-white">
            <span>Début</span>
            <span className="bg-[#FFE066] text-[#78350f] px-2 py-0.5 rounded-full text-[10px] shadow-2xs font-black">
              {Math.round((currentWeek / 40) * 100)}% parcouru
            </span>
            <span>08/12</span>
          </div>
          <div className="w-full h-3 bg-black/15 rounded-full overflow-hidden p-0.5 shadow-inner backdrop-blur-xs">
            <div
              className="h-full bg-gradient-to-r from-[#FFE066] to-[#93ABD9] rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${(currentWeek / 40) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. ÉVOLUTION DU BÉBÉ (DESIGN COMPACT, ÉPURÉ & PEP'S) */}
      <div className="bg-gradient-to-br from-[#FFE066]/30 via-white to-[#E7BEF8]/35 rounded-3xl p-5 shadow-md border-2 border-[#E7BEF8] space-y-3.5 relative overflow-hidden">
        {/* Header Title Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl p-1.5 bg-[#FFE066]/60 rounded-xl shadow-2xs">🌱</span>
            <h3 className="font-serif text-sm font-black text-slate-800">
              Évolution semaine après semaine
            </h3>
          </div>
          <span className="text-[11px] font-black text-white bg-[#F2619C] border border-white/80 rounded-xl px-3 py-1 flex items-center gap-1 shadow-sm whitespace-nowrap flex-shrink-0">
            <span>✨ Sem. {currentWeek}</span>
          </span>
        </div>

        {/* Fruit Detail Content */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#E7BEF8] flex items-center gap-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFE066]/50 to-[#E7BEF8]/40 shadow-xs border-2 border-[#E7BEF8] flex items-center justify-center text-4xl flex-shrink-0 animate-bounce-subtle">
            {fruitInfo.emoji}
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-slate-800">
                Comme {fruitInfo.fruit}
              </span>
              <span className="text-[10px] bg-[#FFE066] text-[#78350f] px-2.5 py-0.5 rounded-full font-extrabold whitespace-nowrap flex-shrink-0">
                Sem. {currentWeek}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#93ABD9] font-bold whitespace-nowrap">
              <span>📏 {fruitInfo.sizeCm} cm</span>
              <span>•</span>
              <span>⚖️ ~{fruitInfo.weightG} g</span>
            </div>

            <p className="text-[11px] text-slate-600 italic leading-snug">
              « {fruitInfo.desc || fruitInfo.funFact} »
            </p>
          </div>
        </div>
      </div>

      {/* 3. LE SAVIEZ-VOUS DU JOUR (JAUNE SOLEIL CHAUD ET DOUX) */}
      <div className="bg-gradient-to-br from-[#FFE066]/45 via-[#FFE066]/25 to-white rounded-3xl p-4 shadow-md border-2 border-[#FFE066] space-y-2 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-lg p-1 bg-white rounded-lg shadow-2xs">💡</span>
          <h3 className="font-serif text-xs font-black text-[#78350f]">
            Le saviez-vous ? • Astuce du Jour
          </h3>
        </div>

        {loadingFact ? (
          <p className="text-xs text-slate-400 italic">Chargement du conseil du jour...</p>
        ) : (
          <div className="bg-white/95 rounded-2xl p-3.5 border border-[#FFE066] space-y-1 shadow-2xs">
            <p className="text-xs font-black text-[#F2619C]">
              {dailyFact?.title || "Le développement sensoriel"}
            </p>
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
              {dailyFact?.content || "À ce stade, bébé réagit déjà aux voix de ses parents et aux caresses sur le ventre !"}
            </p>
          </div>
        )}
      </div>

      {/* 4. LES RACCOURCIS VERS LES JEUX & ACTIVITÉS (COLOR BLOCKS PALETTE) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-serif text-xs font-black text-slate-800 uppercase tracking-wider">
            Animations & Jeux en Famille
          </h3>
          <span className="text-[10px] text-[#F2619C] font-extrabold">Cliquez pour jouer !</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Raccourci 1: Le Grand Pronostic (Raspberry Rose) */}
          <button
            type="button"
            onClick={() => navigate('predictions')}
            className="bg-gradient-to-br from-[#F2619C] to-[#de3881] text-white p-4 rounded-3xl shadow-md border border-[#F2619C]/50 hover:shadow-lg active:scale-95 text-left transition-all group flex flex-col justify-between h-30 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className="text-3xl p-1 bg-white/20 rounded-2xl">🎯</span>
              <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <p className="font-serif font-black text-sm text-white">Grand Prono</p>
              <p className="text-[10px] text-white/90 font-medium">Paris sur le jour J & prénom</p>
            </div>
          </button>

          {/* Raccourci 2: Quizz 50 Questions (Soft Lilac) */}
          <button
            type="button"
            onClick={() => navigate('quiz')}
            className="bg-gradient-to-br from-[#E7BEF8] to-[#d79bf2] text-[#56206b] p-4 rounded-3xl shadow-md border-2 border-white hover:shadow-lg active:scale-95 text-left transition-all group flex flex-col justify-between h-30 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className="text-3xl p-1 bg-white/40 rounded-2xl">⚖️</span>
              <ArrowRight className="w-4 h-4 text-[#56206b]/80 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <p className="font-serif font-black text-sm text-[#56206b]">Quizz Parents</p>
              <p className="text-[10px] text-[#56206b]/90 font-medium">50 questions 1 par 1</p>
            </div>
          </button>

          {/* Raccourci 3: Jeux & Mots Fléchés (Blueberry Milk) */}
          <button
            type="button"
            onClick={() => navigate('games')}
            className="bg-gradient-to-br from-[#93ABD9] to-[#7592cb] text-white p-4 rounded-3xl shadow-md border border-[#93ABD9]/50 hover:shadow-lg active:scale-95 text-left transition-all group flex flex-col justify-between h-30 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className="text-3xl p-1 bg-white/20 rounded-2xl">🧩</span>
              <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <p className="font-serif font-black text-sm text-white">Jeux du Jour</p>
              <p className="text-[10px] text-white/90 font-medium">Mots fléchés & chrono ⏱️</p>
            </div>
          </button>

          {/* Raccourci 4: Hésitations & Dilemmes (Sunny Yellow) */}
          <button
            type="button"
            onClick={() => navigate('polls')}
            className="bg-gradient-to-br from-[#FFE066] to-[#FED049] text-[#78350f] p-4 rounded-3xl shadow-md border-2 border-white hover:shadow-lg active:scale-95 text-left transition-all group flex flex-col justify-between h-30 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className="text-3xl p-1 bg-white/40 rounded-2xl">💡</span>
              <ArrowRight className="w-4 h-4 text-[#78350f]/80 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <p className="font-serif font-black text-sm text-[#78350f]">Hésitations</p>
              <p className="text-[10px] text-[#78350f]/90 font-medium">Aidez-les à choisir</p>
            </div>
          </button>
        </div>

        {/* Raccourci 5: Capsule d'Amour / Livre d'or */}
        <button
          type="button"
          onClick={() => navigate('guestbook')}
          className="w-full bg-white p-4 rounded-3xl shadow-md border-2 border-[#E7BEF8] hover:border-[#F2619C] active:scale-[0.99] flex items-center justify-between group transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1 bg-[#fdf2f7] rounded-2xl">💌</span>
            <div className="text-left">
              <p className="font-serif font-black text-sm text-slate-800">Capsule d'Amour & Mots Doux</p>
              <p className="text-[10px] text-slate-400">Laissez un message pour la petite puce</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#F2619C] group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Raccourci 6: Espace Parents (en dernier) */}
        <button
          type="button"
          onClick={() => navigate('parents')}
          className="w-full bg-gradient-to-r from-[#fdf2f7] via-white to-[#f4ebfc] p-4 rounded-3xl shadow-xs border-2 border-[#E7BEF8] hover:border-[#F2619C] active:scale-[0.99] flex items-center justify-between group transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#EDE986] to-[#E7BEF8] shadow-2xs border border-white flex items-center justify-center text-xl">
              👑
            </div>
            <div className="text-left">
              <p className="font-serif font-black text-sm text-slate-800 flex items-center gap-1.5">
                <span>Espace Parents</span>
                <Lock className="w-3.5 h-3.5 text-[#F2619C]" />
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Organisation privée pour Liza & Clément</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#F2619C] group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>
    </div>
  );
}
