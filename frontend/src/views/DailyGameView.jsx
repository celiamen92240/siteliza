import React, { useState, useEffect, useRef } from 'react';
import { Timer, Trophy, Play, CheckCircle2, XCircle, RotateCcw, Sparkles, Flame, ArrowRight, ArrowLeft, HelpCircle, Award, Calendar, Star, Zap, Eye, Check, ShieldCheck, Rocket, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import ParticipantSelector from '../components/ParticipantSelector';

export default function DailyGameView({ onBack, onGameActiveChange }) {
  const [gridData, setGridData] = useState(null);
  const [todayScores, setTodayScores] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [leaderboardTab, setLeaderboardTab] = useState('today'); // 'today' or 'global'
  const [showAllToday, setShowAllToday] = useState(false);
  const [showAllGlobal, setShowAllGlobal] = useState(false);
  
  const [playerName, setPlayerName] = useState(localStorage.getItem('crosswords_player') || '');
  const [playerPhoto, setPlayerPhoto] = useState(null);
  
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTenths, setElapsedTenths] = useState(0); // 100ms units
  const [userInputs, setUserInputs] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultDetails, setResultDetails] = useState(null); // { correctCount, totalWords, awardedPoints, answers: [...] }
  const [loading, setLoading] = useState(true);

  const timerRef = useRef(null);

  useEffect(() => {
    if (onGameActiveChange) {
      onGameActiveChange(isPlaying && !isSubmitted);
    }
  }, [isPlaying, isSubmitted, onGameActiveChange]);

  const fetchDailyData = () => {
    fetch('/api/crosswords/daily')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGridData(data.grid);
          setTodayScores(data.todayScores || []);
          setGlobalLeaderboard(data.globalLeaderboard || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading daily crosswords", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDailyData();
    const interval = setInterval(fetchDailyData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Chronometer Ticking
  useEffect(() => {
    if (isPlaying && !isSubmitted) {
      timerRef.current = setInterval(() => {
        setElapsedTenths(prev => prev + 1);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isSubmitted]);

  const formatTime = (tenths) => {
    const totalSec = Math.floor(tenths / 10);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const dec = tenths % 10;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${dec}`;
  };

  const handleSelectPlayer = (name, photoOrAvatar) => {
    setPlayerName(name);
    setPlayerPhoto(photoOrAvatar);
    localStorage.setItem('crosswords_player', name);
    setIsPlaying(false);
    setIsSubmitted(false);
    setResultDetails(null);
  };

  // Check if player has already completed today's official challenge
  const todayPlayerScore = playerName ? todayScores.find(
    s => s.playerName.toLowerCase() === playerName.toLowerCase()
  ) : null;

  const handleStartGame = () => {
    if (!playerName || !playerName.trim()) {
      alert("Veuillez d'abord sélectionner votre prénom dans la liste déroulante avant de démarrer !");
      return;
    }
    setIsPlaying(true);
    setIsSubmitted(false);
    setResultDetails(null);
    setElapsedTenths(0);
    setUserInputs({});
  };

  const handleWordInputChange = (wordId, value) => {
    if (!gridData || !gridData.words) return;
    const targetWord = gridData.words.find(w => w.id === wordId);
    if (!targetWord) return;

    const cleaned = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, targetWord.length);
    setUserInputs(prev => ({ ...prev, [wordId]: cleaned }));
  };

  // Player confirms their choices without knowing the answers in advance!
  const handleSubmitGrid = async () => {
    if (!gridData || !gridData.words) return;
    
    setIsSubmitted(true);
    setIsPlaying(false);

    // Calculate correct answers
    const answers = gridData.words.map(w => {
      const typed = (userInputs[w.id] || '').trim().toUpperCase();
      const isCorrect = typed === w.word.toUpperCase();
      return {
        id: w.id,
        clue: w.clue,
        word: w.word,
        typed: typed,
        length: w.length,
        isCorrect: isCorrect
      };
    });

    const correctCount = answers.filter(a => a.isCorrect).length;
    const totalWords = gridData.words.length;
    const timeSeconds = parseFloat((elapsedTenths / 10).toFixed(1));
    const timeFormatted = formatTime(elapsedTenths);

    if (correctCount >= 6) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#f63d65', '#d8b4fe', '#ff708d', '#fbdf8a', '#22c55e']
      });
    }

    try {
      const res = await fetch('/api/crosswords/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName || 'Un proche',
          timeSeconds,
          timeFormatted,
          correctCount,
          totalWords,
          theme: gridData.theme || 'Mots Fléchés',
          date: gridData.date
        })
      });
      const data = await res.json();
      if (data.success) {
        setResultDetails({
          correctCount: data.correctCount !== undefined ? data.correctCount : correctCount,
          totalWords: data.totalWords || totalWords,
          awardedPoints: data.awardedPoints,
          timeFormatted,
          alreadySubmitted: data.alreadySubmitted,
          answers
        });
        setTodayScores(data.todayScores || []);
        setGlobalLeaderboard(data.globalLeaderboard || []);
      }
    } catch (err) {
      console.error("Error submitting crossword score", err);
      setResultDetails({
        correctCount,
        totalWords,
        awardedPoints: correctCount * 60,
        timeFormatted,
        answers
      });
    }
  };

  const filledCount = gridData?.words?.filter(w => (userInputs[w.id] || '').trim().length > 0).length || 0;
  const totalWords = gridData?.words?.length || 12;

  return (
    <div className="px-5 space-y-5 pb-8">
      {/* Titre et Sous-titre en violet au-dessus du rectangle */}
      <div className="flex items-center justify-between px-1 gap-2">
        <div className="space-y-0.5 min-w-0">
          <h2 className="font-serif text-lg font-black text-[#812348] tracking-tight leading-tight truncate">
            Mots fléchés du quotidien
          </h2>
          <p className="text-[11px] sm:text-xs text-[#812348]/85 font-medium">
            12 mots chaque jour pour faire briller votre culture
          </p>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 bg-white hover:bg-rose-50 text-[#812348] font-bold text-xs px-3 py-2 rounded-xl border border-rose-200 shadow-xs cursor-pointer transition-all active:scale-95 flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour</span>
          </button>
        )}
      </div>

      {/* Rectangle Thème du jour & Thème de demain */}
      {gridData && (
        <div className="glass-card-pink rounded-3xl p-4 border border-blush-200/90 shadow-sm space-y-2">
          {/* Thème du jour sur la même ligne */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <span className="font-bold text-slate-500 flex-shrink-0">Thème du jour :</span>
            <strong className="text-blush-700 font-black truncate">{gridData.theme}</strong>
          </div>

          {/* Thème de demain en beaucoup plus petit et en italique */}
          {gridData.tomorrowTheme && (
            <div className="pt-1.5 border-t border-rose-100/70 flex items-center gap-1.5 text-[10px] text-slate-400 italic">
              <span>🔮 Thème de demain :</span>
              <span className="text-slate-600 font-bold not-italic">{gridData.tomorrowTheme}</span>
            </div>
          )}
        </div>
      )}

      {/* CHRONOMETER BAR (Visible pendant la partie) */}
      {isPlaying && !isSubmitted && (
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-rose-100 flex items-center justify-between animate-in fade-in">
          <span className="text-xs font-bold text-slate-700">
            Joueur : <strong className="text-blush-600">{playerName}</strong>
          </span>

          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black font-mono bg-red-500 text-white animate-pulse shadow-md">
            <Timer className="w-3.5 h-3.5" />
            <span>{formatTime(elapsedTenths)}</span>
          </div>
        </div>
      )}

      {/* 1. ÉCRAN INTRO : DÉMARRER OU REJOUER POUR ENREGISTRER SON DERNIER SCORE */}
      {!isPlaying && !isSubmitted && (
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-blush-200 text-center space-y-4 animate-in zoom-in-95">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-[#F2619C]/20 via-[#FFE066]/40 to-[#E7BEF8]/50 border border-[#F2619C]/30 flex items-center justify-center text-[#F2619C] shadow-2xs">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-lg font-black text-slate-800">
              Défi Mots Fléchés du Jour
            </h3>
            <p className="text-xs text-rose-500 font-medium">
              « {gridData?.description || "Trouve les 12 mots le plus vite possible !"} »
            </p>
          </div>

          {/* Participant Selection */}
          <div className="text-left pt-1">
            <ParticipantSelector
              selectedName={playerName}
              onSelect={(name) => setPlayerName(name)}
              label="Qui relève le défi ?"
            />
          </div>

          {/* If player already played today -> Show his latest recorded score and allow replay */}
          {todayPlayerScore && (
            <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-left space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Dernier score enregistré aujourd'hui : <strong>+{todayPlayerScore.score} pts</strong> ({todayPlayerScore.timeFormatted})</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Tu peux rejouer pour tenter de battre ton record ou améliorer ton chrono !
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartGame}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-[#F2619C] via-[#fb7185] to-[#812348] hover:from-[#e11d48] hover:to-[#581c87] text-white font-black py-3.5 px-6 rounded-2xl shadow-xl hover:shadow-2xl text-sm transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer active:scale-95 border border-white/25"
          >
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
              <Rocket className="w-4.5 h-4.5 text-white stroke-[2.5]" />
            </div>
            <span className="text-sm font-black tracking-wide">
              {todayPlayerScore ? "Rejouer" : "Démarrer"}
            </span>
          </button>
        </div>
      )}

      {/* 2. GRILLE ACTIVE DE JEU (12 MOTS À REMPLIR) */}
      {isPlaying && !isSubmitted && gridData && (
        <div className="space-y-4 animate-in zoom-in-95">
          <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-blush-200 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-50 pb-2">
              <span className="text-xs font-extrabold text-slate-700">
                Progression : <strong className="text-blush-600">{filledCount} / {totalWords}</strong> mots remplis
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                60 pts / mot exact
              </span>
            </div>

            {/* List of 12 Clues with Natural Full Page Scroll */}
            <div className="space-y-3">
              {gridData.words.map((item, idx) => {
                const currentVal = userInputs[item.id] || '';
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100/80 hover:border-blush-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 leading-snug">
                        {item.clue}
                      </p>
                      <span className="text-[10px] font-extrabold text-blush-600 bg-white px-2 py-0.5 rounded-full border border-rose-200 flex-shrink-0 shadow-2xs">
                        {item.length} lettres
                      </span>
                    </div>

                    {/* Single Word Input Rectangle */}
                    <div className="pt-1">
                      <input
                        type="text"
                        placeholder={`Tapez votre mot (${item.length} lettres)...`}
                        value={currentVal}
                        onChange={(e) => handleWordInputChange(item.id, e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border-2 font-black uppercase text-xs tracking-wider transition-all outline-none ${
                          currentVal
                            ? 'bg-white border-blush-500 text-blush-700 shadow-xs'
                            : 'bg-white border-rose-200 text-slate-800 placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal focus:border-blush-500 focus:bg-white'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmitGrid}
                className="w-full bg-gradient-to-r from-blush-500 via-rose-500 to-purple-600 hover:from-blush-600 hover:to-purple-700 text-white font-black py-4 rounded-2xl shadow-xl text-sm transition-all flex items-center justify-center gap-2 glow-pink cursor-pointer active:scale-95"
              >
                <Check className="w-5 h-5 stroke-[3px]" />
                <span>Valider</span>
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-2">
                Attention : ton score sera figé et non modifiable une fois validé !
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. ÉCRAN RÉSULTATS DÉTAILLÉS AVEC LOGO VECTORIEL DESIGN */}
      {isSubmitted && resultDetails && (
        <div className="space-y-4 animate-in zoom-in-95">
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-blush-300 text-center space-y-4">
            {resultDetails.correctCount >= 6 ? (
              /* Case à cocher verte stylisée et design */
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-200/80 flex items-center justify-center animate-in zoom-in-75">
                <div className="w-full h-full rounded-[22px] bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 flex items-center justify-center text-white border border-white/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/35 to-transparent pointer-events-none"></div>
                  <svg className="w-10 h-10 text-white relative z-10 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
            ) : (
              /* Croix rouge stylisée et design */
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500 to-red-400 p-0.5 shadow-lg shadow-rose-200/80 flex items-center justify-center animate-in zoom-in-75">
                <div className="w-full h-full rounded-[22px] bg-gradient-to-b from-rose-400 via-rose-500 to-rose-600 flex items-center justify-center text-white border border-white/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/35 to-transparent pointer-events-none"></div>
                  <svg className="w-10 h-10 text-white relative z-10 drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-black text-slate-800">
                Résultats de {playerName}
              </h3>
              <p className="text-xs text-rose-500 font-medium">
                Temps : <strong>{resultDetails.timeFormatted}</strong> • <strong>{resultDetails.correctCount} / {resultDetails.totalWords}</strong> mots corrects !
              </p>
            </div>

            {/* Score Box */}
            <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-2xl p-4 border border-rose-100 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Points Marqués Aujourd'hui</span>
              <p className="font-serif text-3xl font-black text-blush-600 flex items-center justify-center gap-1">
                <span>+{resultDetails.awardedPoints}</span>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Verrouillés et ajoutés à ton classement général !
              </p>
            </div>

            {/* Detailed Answers Review (Corrigé des 12 mots) */}
            <div className="text-left space-y-2.5 pt-2">
              <p className="font-serif text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blush-600" />
                <span>Détail de tes réponses & Corrigé :</span>
              </p>

              <div className="space-y-2">
                {resultDetails.answers.map((ans, idx) => (
                  <div
                    key={ans.id || idx}
                    className={`p-3 rounded-2xl border text-xs transition-all ${
                      ans.isCorrect
                        ? 'bg-green-50/80 border-green-200 text-green-950'
                        : 'bg-rose-50/50 border-rose-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-[11px] font-bold text-slate-700 leading-snug break-words flex-1">
                        <span className="font-extrabold text-slate-400 mr-1">#{idx + 1}.</span>
                        {ans.clue}
                      </p>
                      {ans.isCorrect ? (
                        <span className="text-[10px] font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Exact (+60 pts)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                          <XCircle className="w-3 h-3" />
                          <span>Manqué</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] pt-1.5 border-t border-slate-200/50">
                      <span className="text-slate-500 font-medium">
                        Ta réponse : <strong className={ans.isCorrect ? "text-green-700 font-mono" : "text-rose-600 line-through font-mono"}>
                          {ans.typed || "(vide)"}
                        </strong>
                      </span>
                      {!ans.isCorrect && (
                        <span className="text-blush-700 font-extrabold font-mono bg-white px-2 py-0.5 rounded-md border border-rose-200 shadow-2xs">
                          Solution : {ans.word}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => { setIsPlaying(false); setIsSubmitted(false); setResultDetails(null); }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Passer au joueur suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. LES DEUX CLASSEMENTS (SANS BOUTON SUPPRESSION = ANTI-TRICHE) */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100 space-y-4">
        {/* Leaderboard Tabs Switcher */}
        <div className="flex items-center justify-between border-b border-rose-50 pb-2">
          <div className="flex items-center gap-1.5 bg-rose-50/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setLeaderboardTab('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                leaderboardTab === 'today'
                  ? 'bg-white text-blush-600 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blush-500" />
              <span>Podium du Jour</span>
            </button>
            <button
              type="button"
              onClick={() => setLeaderboardTab('global')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                leaderboardTab === 'global'
                  ? 'bg-white text-blush-600 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-blush-500" />
              <span>Classement Général</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PODIUM DU JOUR */}
        {leaderboardTab === 'today' && (
          <div className="space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
              <span>Joueurs d'aujourd'hui</span>
              <span>Temps & Points</span>
            </div>

            {todayScores.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FFE066]/30 border border-[#FFE066]/60 flex items-center justify-center text-blush-600 shadow-2xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">Aucun score enregistré aujourd'hui</p>
                <p className="text-[10px] text-slate-400">Sois le premier à relever la grille de 12 mots !</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(showAllToday ? todayScores : todayScores.slice(0, 4)).map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold ${
                      idx === 0
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900 shadow-2xs'
                        : idx === 1
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : idx === 2
                        ? 'bg-rose-50/40 border-rose-200 text-slate-700'
                        : 'bg-white border-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-7 h-7 rounded-xl shadow-2xs flex items-center justify-center text-xs font-black ${
                        idx === 0 ? 'bg-[#FFE066] text-[#78350f] border border-white' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-amber-200/80 text-amber-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-slate-800 font-extrabold">{s.playerName}</p>
                        <p className="text-[9px] text-slate-400 font-normal">
                          {s.correctCount !== undefined ? `${s.correctCount}/12 trouvés` : '12 mots'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-rose-100 flex items-center gap-1">
                        <Timer className="w-3 h-3 text-slate-400" />
                        <span>{s.timeFormatted}</span>
                      </span>
                      <span className="font-black text-blush-600 bg-rose-50 px-2 py-0.5 rounded-lg">
                        +{s.points} pts
                      </span>
                    </div>
                  </div>
                ))}

                {todayScores.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setShowAllToday(!showAllToday)}
                    className="w-full py-2.5 text-center text-xs font-bold text-blush-600 bg-rose-50/70 hover:bg-rose-100/70 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs mt-1"
                  >
                    <span>{showAllToday ? "Voir moins" : `Voir tous les joueurs (${todayScores.length})`}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllToday ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLASSEMENT GÉNÉRAL ÉVOLUTIF (CUMUL DES JOURS) */}
        {leaderboardTab === 'global' && (
          <div className="space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
              <span>Famille & Proches</span>
              <span>Points Cumulés</span>
            </div>

            {globalLeaderboard.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#E7BEF8]/30 border border-[#E7BEF8]/60 flex items-center justify-center text-blush-600 shadow-2xs">
                  <Trophy className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">Le classement général démarre</p>
                <p className="text-[10px] text-slate-400">Joue chaque jour pour cumuler des points !</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(showAllGlobal ? globalLeaderboard : globalLeaderboard.slice(0, 3)).map((item, idx) => (
                  <div
                    key={item.playerName || idx}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold ${
                      idx === 0
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900 shadow-2xs ring-1 ring-amber-300'
                        : idx === 1
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : idx === 2
                        ? 'bg-rose-50/40 border-rose-200 text-slate-700'
                        : 'bg-white border-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-7 h-7 rounded-xl shadow-2xs flex items-center justify-center text-xs font-black ${
                        idx === 0 ? 'bg-[#FFE066] text-[#78350f] border border-white' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-amber-200/80 text-amber-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-extrabold text-slate-800">{item.playerName}</p>
                        <p className="text-[9px] text-slate-400 font-medium">
                          {item.daysPlayed} jour{item.daysPlayed > 1 ? 's' : ''} joué{item.daysPlayed > 1 ? 's' : ''} • Record : {item.bestTimeFormatted}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm text-blush-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100">
                        {item.totalPoints} pts
                      </span>
                    </div>
                  </div>
                ))}

                {globalLeaderboard.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllGlobal(!showAllGlobal)}
                    className="w-full py-2.5 text-center text-xs font-bold text-blush-600 bg-rose-50/70 hover:bg-rose-100/70 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs mt-1"
                  >
                    <span>{showAllGlobal ? "Voir moins" : `Voir tous les joueurs (${globalLeaderboard.length})`}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllGlobal ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
