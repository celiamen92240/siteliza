import React, { useState, useEffect } from 'react';
import {
  Heart, Sparkles, Trophy, MessageSquareText,
  CalendarHeart, ArrowRight, Lightbulb, ChevronRight, Lock, Mail, Sprout, Camera, MailOpen, Puzzle, ShieldCheck
} from 'lucide-react';
import BabyVectorLogo from '../components/BabyVectorLogo';
import FruitIllustration from '../components/FruitIllustration';
import { fruitsData } from '../data/fruitsData';
import { getTodayDailyFact } from '../data/dailyFacts';
import { compressImage } from '../utils/imageCompressor';

export default function HomeView({ setTab, onTabChange, isBorn, actualBirth }) {
  const [dailyFact, setDailyFact] = useState(() => getTodayDailyFact());
  const [loadingFact, setLoadingFact] = useState(false);

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

  // Header Photo State (Synced with Top-Left Photo)
  const [headerPhoto, setHeaderPhoto] = useState(() => localStorage.getItem('app_custom_logo') || null);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.85);
        setHeaderPhoto(compressed);
        localStorage.setItem('app_custom_logo', compressed);
        window.dispatchEvent(new CustomEvent('customHeaderPhotoChanged', { detail: compressed }));
        await fetch('/api/config/logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo: compressed })
        });
      } catch (err) {
        console.error("Error uploading countdown photo", err);
      }
    }
  };

  useEffect(() => {
    const fetchPhoto = () => {
      fetch('/api/config/logo')
        .then(res => res.json())
        .then(data => {
          if (data.photo) {
            setHeaderPhoto(data.photo);
            localStorage.setItem('app_custom_logo', data.photo);
          }
        })
        .catch(err => console.error("Error loading home photo", err));
    };

    fetchPhoto();

    const handlePhotoChanged = (e) => {
      if (e.detail) {
        setHeaderPhoto(e.detail);
      } else {
        fetchPhoto();
      }
    };

    window.addEventListener('customHeaderPhotoChanged', handlePhotoChanged);
    return () => window.removeEventListener('customHeaderPhotoChanged', handlePhotoChanged);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Met à jour la citation du jour
    setDailyFact(getTodayDailyFact());
  }, []);

  const fruitInfo = fruitsData.find(f => f.week === currentWeek) || fruitsData.find(f => f.week === 26) || fruitsData[0];

  return (
    <div className="px-5 space-y-5 pb-6">
      {/* 1. ANNONCE OFFICIELLE DE NAISSANCE AVEC PHOTO (SI BÉBÉ EST NÉ) OU COMPTE À REBOURS */}
      {isBorn && actualBirth ? (
        <div className="bg-gradient-to-br from-[#F2619C] via-[#f06ea5] to-[#E7BEF8] rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-[#F2619C]/40 relative overflow-hidden space-y-4 text-white animate-in zoom-in-95">
          {/* Soft Decorative Glow */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/25 rounded-full blur-2xl pointer-events-none"></div>

          {/* Badge & Title */}
          <div className="text-center space-y-1.5 relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#78350f] bg-[#FFE066] px-3.5 py-1 rounded-full border border-white/70 shadow-xs">
              <Sparkles className="w-3 h-3 text-[#812348]" />
              <span>C'est officiel • Bébé est arrivé !</span>
              <Sparkles className="w-3 h-3 text-[#812348]" />
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
              Bienvenue {actualBirth.name || 'notre petite princesse'} ! 💖
            </h2>
            <p className="text-xs text-white/90 font-medium">
              Le plus beau des trésors est arrivé parmi nous ✨
            </p>
          </div>

          {/* Photo de Bébé */}
          {actualBirth.photo && (
            <div className="relative z-10 mx-auto max-w-xs rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-4 ring-white/30 bg-white/10">
              <img
                src={actualBirth.photo}
                alt={actualBirth.name || 'Bébé'}
                className="w-full max-h-72 object-cover rounded-xl"
              />
            </div>
          )}

          {/* 4 Cartouches des détails réels de naissance */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 relative z-10">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 text-center shadow-md border border-[#FFE066]">
              <span className="block text-[10px] uppercase font-black text-slate-400">Date</span>
              <span className="block font-serif text-sm font-black text-[#F2619C] mt-0.5">
                {actualBirth.date ? new Date(actualBirth.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '08 Déc.'}
              </span>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 text-center shadow-md border border-[#FFE066]">
              <span className="block text-[10px] uppercase font-black text-slate-400">Heure</span>
              <span className="block font-serif text-sm font-black text-[#93ABD9] mt-0.5">
                {actualBirth.time || '14:20'}
              </span>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 text-center shadow-md border border-[#FFE066]">
              <span className="block text-[10px] uppercase font-black text-slate-400">Poids</span>
              <span className="block font-serif text-sm font-black text-[#F2619C] mt-0.5">
                {actualBirth.weightG ? (actualBirth.weightG > 100 ? `${(actualBirth.weightG / 1000).toFixed(3).replace('.', ',')} kg` : `${actualBirth.weightG} kg`) : '3,350 kg'}
              </span>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 text-center shadow-md border border-[#FFE066]">
              <span className="block text-[10px] uppercase font-black text-slate-400">Taille</span>
              <span className="block font-serif text-sm font-black text-[#93ABD9] mt-0.5">
                {actualBirth.sizeCm || 49.5} cm
              </span>
            </div>
          </div>

          {/* Bouton Podium Pronos */}
          <button
            type="button"
            onClick={() => navigate('predictions')}
            className="w-full bg-white hover:bg-white/95 text-[#F2619C] font-black py-3 rounded-2xl shadow-lg border border-white flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] text-xs relative z-10"
          >
            <Trophy className="w-4 h-4 text-[#F2619C]" />
            <span>Découvrir le podium & les gagnants des pronos</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F2619C]" />
          </button>
        </div>
      ) : (
        /* COMPTE À REBOURS DU JOUR J (HARMONIE ROSE & LILAS DOUX) */
        <div
          onClick={() => navigate('predictions')}
          className="bg-gradient-to-br from-[#F2619C] via-[#E85D9E] to-[#C084FC] rounded-3xl p-5 shadow-lg border-2 border-white/60 relative overflow-hidden space-y-4 cursor-pointer hover:shadow-xl active:scale-[0.99] transition-all group text-white"
          title="Cliquer pour faire tes pronostics"
        >
          {/* Soft Decorative Glow */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/25 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#812348] bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full border border-white/90 flex items-center gap-1.5 w-fit shadow-xs">
                <Sparkles className="w-3 h-3 text-[#F2619C]" />
                <span>Jour J • 08 Décembre 2026</span>
                <ArrowRight className="w-3 h-3 text-[#F2619C] group-hover:translate-x-0.5 transition-transform" />
              </span>
              <h2 className="font-serif text-2xl font-black text-white tracking-tight drop-shadow-xs">
                Compte à Rebours Naissance
              </h2>
              <p className="text-xs text-white/90 font-medium">
                Semaine {currentWeek} de grossesse • 6ème mois ✨
              </p>
            </div>

            <div className="flex items-center justify-center relative">
              <BabyVectorLogo gender="girl" size={68} className="drop-shadow-md hover:scale-110 transition-transform" />
            </div>
          </div>

          {/* 4 CARTOUCHES DE TEMPS RÉEL */}
          <div className="grid grid-cols-4 gap-2 pt-1 relative z-10">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 text-center shadow-md border border-[#FBCFE8]">
              <span className="block font-serif text-2xl font-black text-[#F2619C] leading-none">
                {timeLeft.days}
              </span>
              <span className="text-[9px] uppercase font-black text-slate-400 mt-1 block">Jours</span>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 text-center shadow-md border border-[#FBCFE8]">
              <span className="block font-serif text-2xl font-black text-[#A855F7] leading-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-black text-slate-400 mt-1 block">Heures</span>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 text-center shadow-md border border-[#FBCFE8]">
              <span className="block font-serif text-2xl font-black text-[#A855F7] leading-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-black text-slate-400 mt-1 block">Min</span>
            </div>

            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 text-center shadow-md border border-[#FBCFE8]">
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
              <span className="bg-white text-[#812348] px-2.5 py-0.5 rounded-full text-[10px] shadow-2xs font-black">
                {Math.round((currentWeek / 40) * 100)}% parcouru
              </span>
              <span>08/12</span>
            </div>
            <div className="w-full h-3 bg-black/15 rounded-full overflow-hidden p-0.5 shadow-inner backdrop-blur-xs">
              <div
                className="h-full bg-gradient-to-r from-white via-[#FBCFE8] to-[#E879F9] rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${(currentWeek / 40) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ÉVOLUTION DU BÉBÉ (DESIGN COMPACT, ÉPURÉ & PEP'S) */}
      <div className="bg-gradient-to-br from-[#FCE7F3]/40 via-white to-[#E7BEF8]/35 rounded-3xl p-5 shadow-md border-2 border-[#E7BEF8] space-y-3 relative overflow-hidden">
        {/* Header Title Row sur une seule ligne épurée avec douce feuille */}
        <div>
          <h3 className="font-serif text-xs font-black text-[#812348] tracking-wide flex items-center gap-1.5">
            <span>🌿</span>
            <span>Évolution semaine après semaine</span>
          </h3>
        </div>

        {/* Fruit Detail Content */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#E7BEF8] flex items-center gap-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FCE7F3] to-[#E7BEF8]/40 shadow-xs border border-[#E7BEF8] flex items-center justify-center flex-shrink-0">
            <FruitIllustration fruit={fruitInfo.fruit} size={48} className="drop-shadow-xs" />
          </div>

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <span className="font-extrabold text-xs sm:text-sm text-[#812348] truncate">
                Comme {fruitInfo.fruit}
              </span>
              <span className="text-[10px] bg-[#FCE7F3] text-[#812348] px-2.5 py-0.5 rounded-full font-extrabold whitespace-nowrap flex-shrink-0">
                Sem. {currentWeek}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#A855F7] font-bold whitespace-nowrap">
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
          <div className="w-7 h-7 rounded-xl bg-white text-amber-500 flex items-center justify-center shadow-2xs border border-[#FFE066]">
            <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-300" />
          </div>
          <h3 className="font-serif text-xs font-black text-[#78350f]">
            Le saviez-vous ? • Astuce du Jour
          </h3>
        </div>

        <div className="bg-white/95 rounded-2xl p-3.5 border border-[#FFE066] space-y-1 shadow-2xs">
          <p className="text-xs font-black text-[#F2619C]">
            {dailyFact?.title || "Le développement sensoriel"}
          </p>
          <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
            {dailyFact?.content || "À ce stade, bébé réagit déjà aux voix de ses parents et aux caresses sur le ventre !"}
          </p>
        </div>
      </div>

      {/* 3. SECTION ACTIVITÉS & JEUX EN FAMILLE (MOCKUP BENTO CUBES) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-serif text-base font-black text-slate-800 leading-tight">
              Activités & jeux en famille
            </h3>
            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <span>Apprenez, jouez, partagez chaque jour</span>
              <Heart className="w-3 h-3 text-[#F2619C] fill-[#F2619C] inline" />
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('predictions')}
            className="text-[11px] font-bold text-[#F2619C] bg-white hover:bg-rose-50 px-3 py-1 rounded-full border border-rose-200/80 shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>Voir tout</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* 4 Bento Cubes Grid 2x2 */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* CUBE 1 : GRAND PRONO (Rose Framboise) */}
          <button
            type="button"
            onClick={() => navigate('predictions')}
            className="bg-gradient-to-br from-[#F57BAA] to-[#E95B91] text-white p-4 rounded-[28px] shadow-sm hover:shadow-md active:scale-95 text-left transition-all group flex flex-col justify-between h-[145px] relative overflow-hidden cursor-pointer"
          >
            {/* Top-left Icon */}
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
              <CalendarHeart className="w-5 h-5 text-white" />
            </div>

            {/* Bottom-right Discreet Arrow */}
            <ArrowRight className="w-4 h-4 text-white/80 absolute bottom-3.5 right-3.5 group-hover:translate-x-1 transition-transform" />

            {/* Bottom-left Content */}
            <div className="pr-6">
              <p className="font-serif font-black text-sm text-white leading-tight">Grand Prono</p>
              <p className="text-[10px] text-white/90 font-medium">Paris sur le jour J & prénom</p>
            </div>
          </button>

          {/* CUBE 2 : QUI DE LIZA OU DE CLÉMENT ? (Pastel Lilas) */}
          <button
            type="button"
            onClick={() => navigate('quiz')}
            className="bg-gradient-to-br from-[#E7BEF8] to-[#D59EED] text-[#4A154B] p-4 rounded-[28px] shadow-sm hover:shadow-md active:scale-95 text-left transition-all group flex flex-col justify-between h-[145px] relative overflow-hidden cursor-pointer"
          >
            {/* Top-left Icon */}
            <div className="w-10 h-10 rounded-2xl bg-white/30 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
              <MessageSquareText className="w-5 h-5 text-[#4A154B]" />
            </div>

            {/* Bottom-right Discreet Arrow */}
            <ArrowRight className="w-4 h-4 text-[#4A154B]/80 absolute bottom-3.5 right-3.5 group-hover:translate-x-1 transition-transform" />

            {/* Bottom-left Content */}
            <div className="pr-6">
              <p className="font-serif font-black text-sm text-[#4A154B] leading-tight">Qui de Liza<br />ou de Clément ?</p>
              <p className="text-[10px] text-[#4A154B]/85 font-medium">Duel des futurs parents</p>
            </div>
          </button>

          {/* CUBE 3 : JEUX DU JOUR / MOTS FLÉCHÉS (Bleu Ciel) */}
          <button
            type="button"
            onClick={() => navigate('games')}
            className="bg-gradient-to-br from-[#A5C2F8] to-[#88ADF4] text-white p-4 rounded-[28px] shadow-sm hover:shadow-md active:scale-95 text-left transition-all group flex flex-col justify-between h-[145px] relative overflow-hidden cursor-pointer"
          >
            {/* Top-left Icon */}
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
              <Puzzle className="w-5 h-5 text-white" />
            </div>

            {/* Bottom-right Discreet Arrow */}
            <ArrowRight className="w-4 h-4 text-white/80 absolute bottom-3.5 right-3.5 group-hover:translate-x-1 transition-transform" />

            {/* Bottom-left Content */}
            <div className="pr-6">
              <p className="font-serif font-black text-sm text-white leading-tight">Mots Fléchés</p>
              <p className="text-[10px] text-white/90 font-medium">12 mots & chrono ⏱️</p>
            </div>
          </button>

          {/* CUBE 4 : PETITS DOUTES, GRANDES RÉPONSES (Jaune Pêche) */}
          <button
            type="button"
            onClick={() => navigate('polls')}
            className="bg-gradient-to-br from-[#FEE58A] to-[#FCD468] text-[#6B4D1B] p-4 rounded-[28px] shadow-sm hover:shadow-md active:scale-95 text-left transition-all group flex flex-col justify-between h-[145px] relative overflow-hidden cursor-pointer"
          >
            {/* Top-left Icon */}
            <div className="w-10 h-10 rounded-2xl bg-white/35 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-[#6B4D1B]" />
            </div>

            {/* Bottom-right Discreet Arrow */}
            <ArrowRight className="w-4 h-4 text-[#6B4D1B]/80 absolute bottom-3.5 right-3.5 group-hover:translate-x-1 transition-transform" />

            {/* Bottom-left Content */}
            <div className="pr-6">
              <p className="font-serif font-black text-xs font-black text-[#6B4D1B] leading-tight">Petits Doutes,<br />grandes réponses</p>
              <p className="text-[10px] text-[#6B4D1B]/85 font-medium">On vous aide, à deux</p>
            </div>
          </button>
        </div>

        {/* BANNER 1 : CAPSULE D'AMOUR & MOTS DOUX */}
        <button
          type="button"
          onClick={() => navigate('guestbook')}
          className="w-full bg-[#FEEFF4] border border-[#FCD8E6] rounded-[24px] p-4 flex items-center justify-between shadow-2xs relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white shadow-2xs flex items-center justify-center flex-shrink-0 relative border border-pink-100">
              <MailOpen className="w-5 h-5 text-[#F2619C] stroke-[2.2px]" />
              <Heart className="w-2.5 h-2.5 text-[#F2619C] fill-[#F2619C] absolute -top-1 right-1.5 drop-shadow-2xs animate-pulse" />
            </div>
            <div className="text-left">
              <p className="font-serif font-black text-sm text-[#4A154B] leading-tight">Capsule d'Amour & Mots Doux</p>
              <p className="text-[10px] text-rose-500 font-medium">Écrivez-lui un message plein de tendresse</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-rose-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* BANNER 2 : ESPACE PARENTS */}
        <button
          type="button"
          onClick={() => navigate('parents')}
          className="w-full bg-[#F7F2FA] border border-[#E7BEF8] rounded-[24px] p-4 flex items-center justify-between shadow-2xs relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white shadow-2xs flex items-center justify-center flex-shrink-0 relative border border-purple-100">
              <ShieldCheck className="w-5 h-5 text-[#6c2874]" />
            </div>
            <div className="text-left">
              <p className="font-serif font-black text-sm text-slate-800 flex items-center gap-1.5 leading-tight">
                <span>Espace Parents</span>
                <Lock className="w-3.5 h-3.5 text-[#F2619C]" />
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Organisation privée pour Liza & Clément</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#6c2874]/60 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
