import React, { useState, useEffect } from 'react';
import { Timer, Trophy, Play, CheckCircle2, XCircle, RotateCcw, Award, ArrowRight, Sparkles, UserCheck, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import ParticipantSelector from '../components/ParticipantSelector';

export default function JustePrixView() {
  const [items, setItems] = useState([]);
  const [scores, setScores] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameState, setGameState] = useState('intro'); // 'intro', 'playing', 'game_over'
  const [timeLeft, setTimeLeft] = useState(15);
  const [playerName, setPlayerName] = useState(localStorage.getItem('juste_prix_player') || 'Célia');
  const [playerPhoto, setPlayerPhoto] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [answeredCurrent, setAnsweredCurrent] = useState(false);
  const [showTimeoutNotice, setShowTimeoutNotice] = useState(false);

  const fetchItemsAndScores = () => {
    fetch('/api/juste-prix/items')
      .then(res => res.json())
      .then(data => {
        if (data.success) setItems(data.items || []);
      });

    fetch('/api/juste-prix/scores')
      .then(res => res.json())
      .then(data => {
        if (data.success) setScores(data.scores || []);
      });
  };

  useEffect(() => {
    fetchItemsAndScores();
  }, []);

  const handleDeleteScore = async (scoreId, name) => {
    if (!window.confirm(`Supprimer le score de ${name} du classement ?`)) return;

    try {
      const res = await fetch(`/api/juste-prix/scores/${scoreId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setScores(data.scores || []);
      }
    } catch (err) {
      console.error("Error deleting score", err);
    }
  };

  // 15-second Timer per item
  useEffect(() => {
    let timer = null;
    if (gameState === 'playing' && !answeredCurrent && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'playing' && !answeredCurrent && timeLeft === 0) {
      // Time is up!
      handleTimeOut();
    }
    return () => clearInterval(timer);
  }, [gameState, answeredCurrent, timeLeft]);

  const handleSelectPlayer = (name, photoOrAvatar) => {
    setPlayerName(name);
    setPlayerPhoto(photoOrAvatar);
    localStorage.setItem('juste_prix_player', name);
  };

  const startGame = () => {
    if (!playerName.trim()) return;
    setCurrentIndex(0);
    setTotalScore(0);
    setCorrectCount(0);
    setTimeLeft(15);
    setSelectedChoice(null);
    setAnsweredCurrent(false);
    setShowTimeoutNotice(false);
    setGameState('playing');
  };

  const handlePriceSelect = (chosenPrice) => {
    if (answeredCurrent) return;

    const currentItem = items[currentIndex];
    if (!currentItem) return;

    setAnsweredCurrent(true);
    setSelectedChoice(chosenPrice);

    const isCorrect = chosenPrice === currentItem.price;

    let points = 0;
    if (isCorrect) {
      // Base points + Speed bonus
      points = 100 + (timeLeft * 5);
      setCorrectCount(prev => prev + 1);
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#16a34a', '#86efac', '#fbdf8a']
      });
    } else {
      points = 10; // small participation points
    }

    setTotalScore(prev => prev + points);

    // Auto advance to next item after 1.4s
    setTimeout(() => {
      moveToNextItem();
    }, 1400);
  };

  const handleTimeOut = () => {
    setAnsweredCurrent(true);
    setSelectedChoice(null);
    setShowTimeoutNotice(true);

    setTimeout(() => {
      setShowTimeoutNotice(false);
      moveToNextItem();
    }, 1500);
  };

  const moveToNextItem = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(15);
      setSelectedChoice(null);
      setAnsweredCurrent(false);
    } else {
      // Game Over! Save score
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameState('game_over');
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#f63d65', '#d8b4fe', '#ff708d', '#fbdf8a']
    });

    try {
      const res = await fetch('/api/juste-prix/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName || 'Un proche',
          score: totalScore,
          totalDifference: items.length - correctCount
        })
      });
      const data = await res.json();
      if (data.success) {
        setScores(data.scores || []);
      }
    } catch (err) {
      console.error("Error submitting score", err);
    }
  };

  const currentItem = items[currentIndex];
  const progressPct = items.length > 0 ? Math.round(((currentIndex + 1) / items.length) * 100) : 0;

  return (
    <div className="px-5 space-y-5 pb-8">
      {/* Header Banner */}
      <div className="glass-card-pink rounded-3xl p-5 border border-blush-200/90 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blush-600">
              Jeu en Famille • Chrono 15s
            </span>
            <h2 className="font-serif text-xl font-extrabold text-slate-800">
              ⏱️ Le Juste Prix Bébé
            </h2>
            <p className="text-xs text-rose-500 font-medium">
              Devine le vrai prix des essentiels de puériculture parmi 4 choix !
            </p>
          </div>
          <span className="text-3xl">🛒</span>
        </div>
      </div>

      {/* 1. ÉCRAN INTRO : SÉLECTION DU JOUEUR & PODIUM */}
      {gameState === 'intro' && (
        <div className="space-y-5 animate-in zoom-in-95">
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-blush-200 text-center space-y-4">
            <span className="text-4xl">🍼 🛍️</span>

            <div className="space-y-1">
              <h3 className="font-serif text-lg font-black text-slate-800">
                Prêt pour le défi ?
              </h3>
              <p className="text-xs text-slate-500">
                10 articles indispensables (lait, yaourts, couches, poussette...). Trouve le bon prix parmi 4 propositions avant la fin des 15s !
              </p>
            </div>

            {/* Player Selection */}
            <div className="text-left bg-rose-50/40 rounded-2xl p-3.5 border border-rose-100">
              <ParticipantSelector
                selectedName={playerName}
                onSelect={handleSelectPlayer}
                label="Qui joue cette partie ?"
              />
            </div>

            <button
              type="button"
              onClick={startGame}
              className="w-full bg-gradient-to-r from-blush-500 via-rose-500 to-purple-600 hover:from-blush-600 hover:to-purple-700 text-white font-bold py-4 rounded-2xl shadow-lg text-sm transition-all flex items-center justify-center gap-2 glow-pink cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Lancer ma partie (15s par article) 🚀</span>
            </button>
          </div>

          {/* Tableau des Meilleurs Scores de la Famille */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100 space-y-3">
            <h3 className="font-serif text-sm font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>🏆 Podium des Meilleurs Acheteurs</span>
            </h3>

            {scores.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-3">
                Aucun score enregistré. Sois le premier champion !
              </p>
            ) : (
              <div className="space-y-2">
                {scores.slice(0, 5).map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold ${
                      idx === 0
                        ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                        : idx === 1
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-rose-50/30 border-rose-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-white shadow-2xs flex items-center justify-center text-xs">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <span>{s.playerName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-blush-600">{s.score} pts</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteScore(s.id, s.playerName)}
                        className="text-slate-300 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="Supprimer ce score"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ÉCRAN EN JEU : 1 ARTICLE AVEC PHOTO & 4 CHOIX DE PRIX */}
      {gameState === 'playing' && currentItem && (
        <div className="bg-white rounded-3xl p-5 shadow-lg border-2 border-blush-200 space-y-4 animate-in fade-in zoom-in-95 relative overflow-hidden">
          {/* Header Bar: Item Counter & 15s Timer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-blush-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                {currentItem.category}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Article {currentIndex + 1} / {items.length}
              </span>
            </div>

            {/* Chrono Timer Pill */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all ${
              timeLeft <= 4
                ? 'bg-red-500 text-white animate-pulse shadow-md scale-105'
                : timeLeft <= 8
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-rose-100 text-blush-800 border border-rose-200'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blush-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>

          {/* Photo du Produit Réel */}
          <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-100 shadow-inner border border-rose-100 relative group">
            <img
              src={currentItem.photo}
              alt={currentItem.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                // Fallback image if unsplash fails
                e.target.src = "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute bottom-2 left-3 right-3 text-white text-xs font-bold drop-shadow">
              {currentItem.name}
            </div>
          </div>

          <p className="text-xs text-slate-600 italic text-center px-2">
            « {currentItem.description} »
          </p>

          {/* 4 CHOIX DE PRIX (QCM INTERACTIF) */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-bold text-slate-500 text-center uppercase tracking-wider">
              Quel est le juste prix ?
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {currentItem.options.map((optionPrice, idx) => {
                const isSelected = selectedChoice === optionPrice;
                const isRealPrice = optionPrice === currentItem.price;

                let btnStyle = "bg-rose-50/70 hover:bg-rose-100 text-slate-800 border-rose-200";

                if (answeredCurrent) {
                  if (isRealPrice) {
                    btnStyle = "bg-green-500 text-white font-black ring-4 ring-green-200 border-green-600 shadow-md scale-102";
                  } else if (isSelected && !isRealPrice) {
                    btnStyle = "bg-red-500 text-white font-bold border-red-600 opacity-85";
                  } else {
                    btnStyle = "bg-slate-100 text-slate-400 opacity-50 border-slate-200";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={answeredCurrent}
                    onClick={() => handlePriceSelect(optionPrice)}
                    className={`py-3.5 px-3 rounded-2xl border text-sm font-extrabold flex items-center justify-between transition-all cursor-pointer ${btnStyle}`}
                  >
                    <span>{optionPrice.toFixed(2).replace('.', ',')} €</span>
                    {answeredCurrent && isRealPrice && <CheckCircle2 className="w-4 h-4 text-white" />}
                    {answeredCurrent && isSelected && !isRealPrice && <XCircle className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback message when answered */}
          {answeredCurrent && (
            <div className={`p-3 rounded-2xl text-center text-xs font-bold animate-in zoom-in-95 ${
              selectedChoice === currentItem.price
                ? 'bg-green-50 text-green-800 border border-green-200'
                : showTimeoutNotice
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {selectedChoice === currentItem.price ? (
                <span>🎯 Bravo ! C'est le juste prix exact ({currentItem.price.toFixed(2).replace('.', ',')} €) ! (+{100 + timeLeft * 5} pts)</span>
              ) : showTimeoutNotice ? (
                <span>⏳ Temps écoulé ! Le juste prix était de {currentItem.price.toFixed(2).replace('.', ',')} €.</span>
              ) : (
                <span>❌ Raté ! Le juste prix était de {currentItem.price.toFixed(2).replace('.', ',')} €.</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. ÉCRAN FIN DE PARTIE : RÉSULTAT FINAL & REJOUER */}
      {gameState === 'game_over' && (
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-blush-300 text-center space-y-4 animate-in zoom-in-95">
          <span className="text-5xl">👑 🏆</span>

          <div className="space-y-1">
            <h3 className="font-serif text-xl font-black text-slate-800">
              Partie terminée, {playerName} !
            </h3>
            <p className="text-xs text-rose-500 font-medium">
              Tu as trouvé {correctCount} juste{correctCount > 1 ? 's' : ''} prix sur les 10 articles !
            </p>
          </div>

          <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-2xl p-4 border border-rose-100 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Ton Score Total</span>
            <p className="font-serif text-3xl font-black text-blush-600">
              {totalScore} <span className="text-sm font-sans font-bold text-slate-700">points</span>
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setGameState('intro')}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Changer de joueur
            </button>
            <button
              type="button"
              onClick={startGame}
              className="flex-1 bg-blush-500 hover:bg-blush-600 text-white font-bold py-3 rounded-xl shadow text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rejouer 🚀</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
