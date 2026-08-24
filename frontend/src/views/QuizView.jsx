import React, { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, CheckCircle2, RotateCcw, ChevronLeft, ChevronRight, Trophy, User, ArrowRight, UserCheck, BarChart3, Flame, Award, Heart, ShoppingBag, Smile, Compass, Moon, Users, UserPlus, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import ParticipantSelector from '../components/ParticipantSelector';

const getCategoryIcon = (categoryName, iconClass = "w-4 h-4") => {
  const cat = (categoryName || '').toLowerCase();
  if (cat.includes('câlin') || cat.includes('calin') || cat.includes('amour') || cat.includes('tendre')) {
    return <Heart className={`${iconClass} text-pink-500`} />;
  }
  if (cat.includes('dépensier') || cat.includes('depensier') || cat.includes('achat') || cat.includes('shopping')) {
    return <ShoppingBag className={`${iconClass} text-amber-500`} />;
  }
  if (cat.includes('joueur') || cat.includes('complice') || cat.includes('fou') || cat.includes('rire')) {
    return <Smile className={`${iconClass} text-purple-500`} />;
  }
  if (cat.includes('aventurier') || cat.includes('sportif') || cat.includes('sport')) {
    return <Compass className={`${iconClass} text-blue-500`} />;
  }
  if (cat.includes('nocturne') || cat.includes('patient') || cat.includes('nuit')) {
    return <Moon className={`${iconClass} text-indigo-500`} />;
  }
  return <Sparkles className={`${iconClass} text-rose-500`} />;
};

const getCategoryBg = (categoryName) => {
  const cat = (categoryName || '').toLowerCase();
  if (cat.includes('câlin') || cat.includes('calin')) return "bg-pink-50 border-pink-200";
  if (cat.includes('dépensier') || cat.includes('depensier')) return "bg-amber-50 border-amber-200";
  if (cat.includes('joueur') || cat.includes('complice')) return "bg-purple-50 border-purple-200";
  if (cat.includes('aventurier') || cat.includes('sportif')) return "bg-blue-50 border-blue-200";
  if (cat.includes('nocturne') || cat.includes('patient')) return "bg-indigo-50 border-indigo-200";
  return "bg-rose-50 border-rose-200";
};

export default function QuizView() {
  const [activeTab, setActiveTab] = useState('play'); // 'play' or 'results'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [summary, setSummary] = useState({ lizaGlobalPercent: 50, clementGlobalPercent: 50, totalVotes: 0, uniqueVotersCount: 0, byCategory: [] });
  const [voterName, setVoterName] = useState(localStorage.getItem('quiz_voter') || '');
  const [voterPhoto, setVoterPhoto] = useState(null);
  const [myVotes, setMyVotes] = useState({});
  const [hasStarted, setHasStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAutoNextToast, setShowAutoNextToast] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const [participants, setParticipants] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Famille');
  const [newAvatar, setNewAvatar] = useState('🌸');

  const fetchParticipants = () => {
    fetch('/api/participants')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setParticipants(data.participants || []);
        }
      });
  };

  const fetchQuizData = () => {
    setLoading(true);
    fetch('/api/quiz/results')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuestions(data.questions || []);
          setSummary(data.summary || { lizaGlobalPercent: 50, clementGlobalPercent: 50, totalVotes: 0, uniqueVotersCount: 0, byCategory: [] });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading quiz", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuizData();
    fetchParticipants();
    if (voterName) {
      const saved = JSON.parse(localStorage.getItem(`quiz_votes_${voterName}`) || '{}');
      setMyVotes(saved);
    }
  }, []);

  const handleSelectVoter = (name, photoOrAvatar) => {
    setVoterName(name);
    setVoterPhoto(photoOrAvatar);
    localStorage.setItem('quiz_voter', name);
    
    // Si le serveur indique que ce joueur n'a pas complété le quiz, nettoyer les vieux résidus de test
    const cleanName = (name || '').trim().toLowerCase();
    const isVotedOnServer = (summary?.votedVoters || []).some(v => (v || '').trim().toLowerCase() === cleanName) ||
                            (summary?.completedVoters || []).some(v => (v || '').trim().toLowerCase() === cleanName);
    
    if (!isVotedOnServer) {
      localStorage.removeItem(`quiz_completed_${cleanName}`);
      localStorage.removeItem(`quiz_voted_${cleanName}`);
      localStorage.removeItem(`quiz_votes_${name}`);
      setMyVotes({});
    } else {
      const saved = JSON.parse(localStorage.getItem(`quiz_votes_${name}`) || '{}');
      setMyVotes(saved);
    }
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          role: newRole,
          avatar: newAvatar
        })
      });
      const data = await res.json();
      if (data.success) {
        setParticipants(data.participants || []);
        handleSelectVoter(newName.trim(), newAvatar);
        setShowAddModal(false);
        setNewName('');
        confetti({ particleCount: 30, spread: 50 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartQuiz = (readOnlyMode = false) => {
    if (!voterName) {
      if (participants.length > 0) {
        handleSelectVoter(participants[0].name, participants[0].avatar);
      } else {
        handleSelectVoter('Maman', '🌸');
      }
    }
    setHasStarted(true);
    setIsFinished(false);
    setActiveTab(readOnlyMode ? 'play' : 'play');
  };

  const allVotedNames = Array.from(new Set([
    ...(summary?.votedVoters || []),
    ...(summary?.completedVoters || [])
  ].filter(Boolean)));

  // SE BASE UNIQUEMENT SUR LA BASE DE DONNÉES OFFICIELLE DU SERVEUR
  const hasAlreadyVoted = Boolean(
    voterName && allVotedNames.some(v => (v || '').trim().toLowerCase() === voterName.trim().toLowerCase())
  );

  const handleVote = async (questionId, choice) => {
    if (isVoting || hasAlreadyVoted) return;

    setIsVoting(true);
    const voter = voterName.trim() || 'Un proche';
    
    // Save locally immediately
    setMyVotes(prev => {
      const updated = { ...prev, [questionId]: choice };
      localStorage.setItem(`quiz_votes_${voter}`, JSON.stringify(updated));
      return updated;
    });

    try {
      const res = await fetch('/api/quiz/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, voter, choice })
      });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions || []);
        setSummary(data.summary || summary);
      }
    } catch (err) {
      console.error("Error submitting vote", err);
    }

    // Auto-advance to next question smoothly
    setShowAutoNextToast(true);
    setTimeout(async () => {
      setShowAutoNextToast(false);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // FIN DU QUIZZ -> Clôture officielle pour ce joueur (1 seule participation)
        localStorage.setItem(`quiz_completed_${voter.toLowerCase()}`, 'true');
        localStorage.setItem(`quiz_voted_${voter.toLowerCase()}`, 'true');
        try {
          await fetch('/api/quiz/finish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voter })
          });
        } catch (e) {
          console.error(e);
        }

        setIsFinished(true);
        setActiveTab('results');
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#f472b6', '#c084fc', '#fb7185', '#ec4899']
        });
      }
      setIsVoting(false);
    }, 380);
  };

  const currentQ = questions[currentIndex];
  const progressPct = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="px-5 space-y-5 pb-8">
      {/* Header Banner - Titre unique sans onglets */}
      <div className="bg-gradient-to-br from-[#FFE066]/35 via-white to-[#E7BEF8]/40 rounded-3xl p-5 border-2 border-[#E7BEF8] shadow-md relative overflow-hidden space-y-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#78350f] bg-[#FFE066] px-2.5 py-0.5 rounded-full border border-white/80 flex items-center gap-1.5 shadow-2xs">
              <Users className="w-3 h-3 text-[#78350f]" />
              <span>{(summary?.uniqueVotersCount || 0) <= 1 ? `${summary?.uniqueVotersCount || 0} participant` : `${summary?.uniqueVotersCount || 0} participants`}</span>
            </span>
          </div>

          <h2 className="font-serif text-2xl font-black text-[#812348] tracking-tight leading-tight pt-0.5">
            Qui de Liza ou de Clément ?
          </h2>
          <p className="text-xs text-[#812348]/80 font-medium">
            Votez et découvrez qui remportera les 5 grands titres de super parents !
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. SECTION VOTE AU QUIZ (SÉLECTION JOUEUR OU QUESTIONS) */}
      {/* ======================================================== */}
      {!hasStarted ? (
        /* ÉCRAN 0 : SÉLECTION DU JOUEUR */
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#E7BEF8] text-center space-y-4 animate-in zoom-in-95">
          <div className="space-y-1">
            <h3 className="font-serif text-base font-black text-slate-800">
              Prêt(e) à voter pour ce duel ?
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Sélectionne ton profil ci-dessous pour enregistrer tes choix
            </p>
          </div>

          {/* Sélection du joueur propre et élégante */}
          <div className="text-left pt-1">
            <ParticipantSelector
              selectedName={voterName}
              onSelect={(name, photoOrAvatar) => handleSelectVoter(name, photoOrAvatar)}
              highlightBlueNames={allVotedNames}
              highlightLabel="A déjà voté"
              label="Qui participe au quiz ?"
            />
          </div>

          {/* Bouton d'action épuré */}
          {hasAlreadyVoted ? (
            <button
              type="button"
              onClick={() => {
                setVoterName('');
                localStorage.removeItem('quiz_voter');
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3.5 rounded-2xl shadow-md hover:shadow-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span>Sélectionner un autre participant</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleStartQuiz(false)}
              className="w-full bg-gradient-to-r from-[#F2619C] to-[#d6417f] text-white font-black py-3.5 rounded-2xl shadow-md hover:shadow-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Lancer le Duel</span>
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : isFinished ? (
        /* ÉCRAN FIN DU QUIZ */
        <div className="bg-gradient-to-br from-[#FFE066]/30 via-white to-[#E7BEF8]/40 rounded-3xl p-6 shadow-md border-2 border-[#E7BEF8] text-center space-y-3.5 animate-in zoom-in-95">
          <span className="text-4xl block">🎉</span>
          <h3 className="font-serif text-lg font-black text-[#812348]">
            Merci pour ton vote {voterName} !
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            Tes réponses ont été enregistrées et intégrées aux tendances ci-dessous.
          </p>

          <button
            type="button"
            onClick={() => {
              setHasStarted(false);
              setIsFinished(false);
              setCurrentIndex(0);
            }}
            className="w-full bg-gradient-to-r from-[#F2619C] via-[#e54b87] to-[#812348] text-white font-black py-4 rounded-2xl shadow-lg border-2 border-white flex items-center justify-center gap-2 text-sm uppercase tracking-wide cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
          >
            <UserPlus className="w-5 h-5 text-white" />
            <span>Faire voter un autre proche</span>
          </button>
        </div>
      ) : (
        /* QUESTION ACTIVE DU QUIZ */
        currentQ ? (
          <div key={`question-card-${currentQ.id || currentIndex}`} className="bg-white rounded-3xl p-6 shadow-lg border-2 border-blush-200 space-y-5 relative overflow-hidden animate-in fade-in zoom-in-95">
            {/* Top Bar: Player identity with Photo & Change */}
            <div className="flex items-center justify-between border-b border-rose-50 pb-2.5">
              <div className="flex items-center gap-2">
                {(() => {
                  const currentParticipant = participants.find(p => p.name?.toLowerCase() === voterName?.toLowerCase());
                  if (currentParticipant?.photo) {
                    return <img src={currentParticipant.photo} alt={voterName} className="w-7 h-7 rounded-full object-cover border-2 border-[#F2619C] shadow-2xs" />;
                  }
                  return <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-xs">{currentParticipant?.avatar || '🌸'}</div>;
                })()}
                <span className="text-xs font-bold text-slate-700">
                  Joueur : <strong className="text-blush-600">{voterName}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => setHasStarted(false)}
                className="text-[10px] font-bold text-slate-400 hover:text-blush-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200 cursor-pointer"
              >
                Changer
              </button>
            </div>

            {/* Category Badge & Question Counter */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blush-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 flex items-center gap-1.5 shadow-2xs">
                {getCategoryIcon(currentQ.category, "w-3.5 h-3.5")}
                <span>{currentQ.category}</span>
              </span>

              <span className="text-xs font-extrabold text-slate-400">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blush-400 via-rose-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>

            {/* Big Question Title */}
            <div className="text-center py-3 min-h-[85px] flex items-center justify-center">
              <h3 className="font-serif text-base font-extrabold text-slate-800 leading-snug">
                « {currentQ.question} »
              </h3>
            </div>

            {/* DUEL CHOICE BUTTONS */}
            {(() => {
              const qId = currentQ.id || currentQ.questionId || (currentIndex + 1);
              const userChoice = myVotes[qId];

              return (
                <div className="space-y-4">
                  {hasAlreadyVoted && (
                    <div className="bg-blue-50 rounded-xl p-2.5 border border-blue-200 text-center text-[11px] font-bold text-blue-800 flex items-center justify-center gap-1.5 animate-in fade-in">
                      <Lock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>Mode consultation : Le vote de {voterName} a déjà été définitivement validé.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      key={`btn-liza-${qId}`}
                      type="button"
                      disabled={isVoting || hasAlreadyVoted}
                      onClick={() => handleVote(qId, 'Liza')}
                      className={`py-6 px-3 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-2 transition-all ${
                        hasAlreadyVoted ? 'cursor-default opacity-90' : 'cursor-pointer active:scale-95'
                      } ${
                        userChoice === 'Liza'
                          ? 'bg-gradient-to-r from-blush-400 to-blush-500 text-white shadow-lg ring-4 ring-rose-200 scale-102 font-extrabold'
                          : 'bg-rose-50/70 hover:bg-rose-100/70 text-blush-700 border-2 border-rose-200/80 shadow-xs'
                      }`}
                    >
                      <span className="text-base tracking-wide font-extrabold">Plutôt Liza</span>
                      {userChoice === 'Liza' ? (
                        <CheckCircle2 className="w-5 h-5 stroke-[3px] text-white" />
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-rose-300"></span>
                      )}
                    </button>

                    <button
                      key={`btn-clement-${qId}`}
                      type="button"
                      disabled={isVoting || hasAlreadyVoted}
                      onClick={() => handleVote(qId, 'Clément')}
                      className={`py-6 px-3 rounded-2xl font-black text-sm flex flex-col items-center justify-center gap-2 transition-all ${
                        hasAlreadyVoted ? 'cursor-default opacity-90' : 'cursor-pointer active:scale-95'
                      } ${
                        userChoice === 'Clément'
                          ? 'bg-gradient-to-r from-blueberry-400 to-blueberry-500 text-white shadow-lg ring-4 ring-blue-200 scale-102 font-extrabold'
                          : 'bg-blue-50/70 hover:bg-blue-100/70 text-blueberry-700 border-2 border-blue-200/80 shadow-xs'
                      }`}
                    >
                      <span className="text-base tracking-wide font-extrabold">Plutôt Clément</span>
                      {userChoice === 'Clément' ? (
                        <CheckCircle2 className="w-5 h-5 stroke-[3px] text-white" />
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-blue-300"></span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-rose-100 text-xs font-bold">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Précédente</span>
              </button>

              <button
                type="button"
                disabled={currentIndex + 1 >= questions.length}
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-blush-700 hover:bg-rose-100 disabled:opacity-30 flex items-center gap-1 cursor-pointer"
              >
                <span>Suivante</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : null
      )}

      {/* ======================================================== */}
      {/* 2. SECTION RÉSULTATS & TENDANCES EN DESSOUS              */}
      {/* ======================================================== */}
      <div className="space-y-4 pt-1">
        {/* En-tête Palmarès sur une seule et même ligne */}
        <div className="flex items-center justify-between px-1 gap-2">
          <h3 className="font-serif text-[11px] sm:text-sm font-black text-slate-800 flex items-center gap-1.5 whitespace-nowrap min-w-0">
            <Award className="w-4 h-4 text-blush-500 flex-shrink-0" />
            <span className="truncate">Palmarès des parents : qui est le + ?</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap flex-shrink-0">5 thématiques</span>
        </div>

        {/* 5 Cartes de Catégories */}
        {(summary.byCategory && summary.byCategory.length > 0 ? summary.byCategory : [
          { category: "Le plus câlin", lizaPercent: 75, clementPercent: 25, questionsCount: 10 },
          { category: "Le plus dépensier", lizaPercent: 80, clementPercent: 20, questionsCount: 10 },
          { category: "Le plus joueur & complice", lizaPercent: 50, clementPercent: 50, questionsCount: 10 },
          { category: "Le plus aventurier & sportif", lizaPercent: 40, clementPercent: 60, questionsCount: 10 },
          { category: "Le plus nocturne & patient", lizaPercent: 45, clementPercent: 55, questionsCount: 10 }
        ]).map((cat, i) => (
          <div
            key={cat.category || i}
            className="bg-white rounded-3xl p-4 shadow-sm border border-rose-100 space-y-3"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-2xs flex-shrink-0 ${getCategoryBg(cat.category)}`}>
                {getCategoryIcon(cat.category, "w-4 h-4")}
              </div>
              <div>
                <h4 className="font-serif text-xs font-black text-slate-800 leading-tight">
                  « {cat.category} »
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">
                  {cat.questionsCount || 10} questions votées
                </span>
              </div>
            </div>

            {/* Category Gauge */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-blush-700">Liza : {cat.lizaPercent}%</span>
                <span className="text-blueberry-700">{cat.clementPercent}% : Clément</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blush-400 to-blush-500"
                  style={{ width: `${cat.lizaPercent}%` }}
                ></div>
                <div
                  className="h-full bg-gradient-to-r from-blueberry-300 to-blueberry-500"
                  style={{ width: `${cat.clementPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nouveau Joueur */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 shadow-2xl border border-rose-200 space-y-3.5 animate-in zoom-in-95">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-blush-600 flex items-center justify-center mx-auto shadow-2xs">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-800">
                Nouveau Joueur
              </h3>
              <p className="text-[11px] text-slate-400">
                Entrez votre prénom pour voter
              </p>
            </div>

            <form onSubmit={handleCreatePlayer} className="space-y-3">
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Votre prénom (ex: Julie, Tata, Lucas...)"
                autoFocus
                className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/40 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blush-300"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="text-xs font-bold py-2 px-2.5 rounded-xl border border-rose-200 bg-white text-slate-700"
                >
                  <option value="Famille">Famille</option>
                  <option value="Ami(e)">Ami(e)</option>
                  <option value="Collègue">Collègue</option>
                  <option value="Parrain/Marraine">Parrain/Marraine</option>
                </select>

                <select
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  className="text-xs font-bold py-2 px-2.5 rounded-xl border border-rose-200 bg-white text-slate-700"
                >
                  <option value="🌸">🌸 Rose</option>
                  <option value="🦁">🦁 Lion</option>
                  <option value="👶">👶 Bébé</option>
                  <option value="💖">💖 Cœur</option>
                  <option value="⭐">⭐ Étoile</option>
                  <option value="✨">✨ Magie</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-blush-500 hover:bg-blush-600 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
