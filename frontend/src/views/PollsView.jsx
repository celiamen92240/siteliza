import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, CheckCircle2, Sparkles, Lock, X, Trash2, Lightbulb, Check, Users, ShieldCheck, Image as ImageIcon, Camera, ChevronRight, PlusCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import ParticipantSelector from '../components/ParticipantSelector';

const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function PollsView() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voterName, setVoterName] = useState(localStorage.getItem('saved_voter_name') || '');
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [pinStep, setPinStep] = useState(true); // true = entrer PIN parent, false = formulaire
  const [secretPin, setSecretPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Poll creation form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Hésitation & Idée 💡');
  const [newDesc, setNewDesc] = useState('');
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [optionsList, setOptionsList] = useState([
    { id: 1, label: '', photo: null },
    { id: 2, label: '', photo: null }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPolls = () => {
    fetch('/api/polls')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPolls(data.polls || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading polls", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleSelectVoter = (name) => {
    setVoterName(name);
    if (name) {
      localStorage.setItem('saved_voter_name', name);
    }
  };

  const handleOpenCreateModal = () => {
    setPinStep(true);
    setSecretPin('');
    setPinError('');
    setNewTitle('');
    setNewDesc('');
    setIsMultipleChoice(false);
    setOptionsList([
      { id: 1, label: '', photo: null },
      { id: 2, label: '', photo: null }
    ]);
    setShowAddModal(true);
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (secretPin === '0812' || secretPin === '1234') {
      setPinStep(false);
      setPinError('');
    } else {
      setPinError('Code d\'accès incorrect (ex: 0812)');
    }
  };

  const handleAddOptionRow = () => {
    setOptionsList(prev => [...prev, { id: Date.now(), label: '', photo: null }]);
  };

  const handleRemoveOptionRow = (idToRemove) => {
    if (optionsList.length <= 2) return;
    setOptionsList(prev => prev.filter(opt => opt.id !== idToRemove));
  };

  const handleOptionLabelChange = (id, value) => {
    setOptionsList(prev => prev.map(opt => opt.id === id ? { ...opt, label: value } : opt));
  };

  const handleOptionPhotoUpload = async (id, file) => {
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 0.85);
      setOptionsList(prev => prev.map(opt => opt.id === id ? { ...opt, photo: compressed } : opt));
    } catch (err) {
      console.error("Error compressing option photo", err);
    }
  };

  const handleRemoveOptionPhoto = (id) => {
    setOptionsList(prev => prev.map(opt => opt.id === id ? { ...opt, photo: null } : opt));
  };

  const handleDeletePoll = async (pollId, pollTitle) => {
    if (!window.confirm(`Supprimer l'hésitation « ${pollTitle} » ?`)) return;

    try {
      const res = await fetch(`/api/polls/${pollId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPolls(data.polls || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (pollId, optionId) => {
    if (!voterName) {
      alert("Merci de sélectionner qui participe au vote ci-dessus !");
      return;
    }

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId, voter: voterName })
      });
      const data = await res.json();
      if (data.success) {
        setPolls(data.polls || []);
      }
    } catch (err) {
      console.error("Error voting", err);
    }
  };

  const handleCreatePollSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const validOptions = optionsList
      .map(o => ({ label: o.label.trim(), photo: o.photo }))
      .filter(o => o.label.length > 0);

    if (validOptions.length < 2) {
      alert("Veuillez renseigner au moins 2 choix possibles.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          description: newDesc.trim(),
          multiple: isMultipleChoice,
          options: validOptions,
          secretCode: secretPin || '0812'
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
        setPolls(data.polls || []);
        setShowAddModal(false);
      } else {
        alert(data.error || "Erreur lors de la création du vote.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-5 space-y-5 pb-8">
      {/* Header Banner */}
      <div className="glass-card-pink rounded-3xl p-5 border border-blush-200/90 shadow-md relative overflow-hidden space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-blush-600">
              Sondages & Idées • Aidez les Parents !
            </span>
            <h2 className="font-serif text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span>Hésitations & Dilemmes</span>
              <div className="w-7 h-7 rounded-xl bg-white text-amber-500 flex items-center justify-center shadow-2xs border border-amber-200">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-300" />
              </div>
            </h2>
          </div>
        </div>
      </div>

      {/* 1. EN PREMIER : PROPOSITION DE CRÉER UN NOUVEAU VOTE (Pour les parents) */}
      <div className="bg-gradient-to-r from-rose-50 via-white to-pink-50 rounded-3xl p-4 border-2 border-blush-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blush-400 to-rose-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-black text-slate-800">
              Une hésitation à soumettre ?
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Créez une question et proposez vos choix avec photos
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="bg-blush-500 hover:bg-blush-600 text-white font-bold py-2.5 px-3.5 rounded-xl shadow-xs text-xs flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer active:scale-95"
        >
          <span>Créer un vote</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. SÉLECTION DU PARTICIPANT */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border-2 border-[#E7BEF8] space-y-2">
        <ParticipantSelector
          selectedName={voterName}
          onSelect={(name) => handleSelectVoter(name)}
          label="Qui vote aujourd'hui ?"
        />
      </div>

      {/* 3. LIST OF POLLS */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin w-8 h-8 border-3 border-blush-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-xs text-slate-400 mt-2 font-medium">Chargement des hésitations...</p>
        </div>
      ) : polls.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center space-y-3 border-2 border-dashed border-blush-200">
          <span className="text-4xl block">💡</span>
          <h3 className="font-serif text-base font-bold text-slate-700">Aucun vote actif pour le moment</h3>
          <p className="text-xs text-slate-400">
            Cliquez sur « Créer un vote » ci-dessus pour lancer votre première hésitation !
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const hasVotedAny = voterName && (poll.options || []).some(o => (o.voters || []).includes(voterName));

            return (
              <div
                key={poll.id}
                className="bg-white rounded-3xl p-5 shadow-sm border-2 border-blush-100 hover:border-blush-300 transition-all space-y-4 relative overflow-hidden"
              >
                {/* Header of Poll */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blush-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-blush-200">
                        {poll.category || "Hésitation"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{poll.totalParticipants || 0} participant{(poll.totalParticipants || 0) > 1 ? 's' : ''}</span>
                      </span>
                      {poll.multiple && (
                        <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          Choix multiple
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif text-base font-black text-slate-800 leading-snug pt-0.5">
                      {poll.title}
                    </h3>
                    {poll.description && (
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {poll.description}
                      </p>
                    )}
                  </div>

                  {/* Bouton de suppression parent discret */}
                  <button
                    onClick={() => handleDeletePoll(poll.id, poll.title)}
                    className="text-slate-300 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                    title="Supprimer cette hésitation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {(poll.options || []).map((opt) => {
                    const isOptionChecked = voterName && (opt.voters || []).includes(voterName);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleVote(poll.id, opt.id)}
                        className={`w-full relative overflow-hidden rounded-2xl border-2 p-3 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isOptionChecked
                            ? 'border-blush-500 bg-rose-50/60 shadow-xs scale-[1.01]'
                            : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-200'
                        }`}
                      >
                        {/* Progress Bar Background */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 transition-all duration-700 pointer-events-none rounded-xl ${
                            isOptionChecked
                              ? 'bg-gradient-to-r from-blush-200/50 to-pink-300/40'
                              : 'bg-slate-200/40'
                          }`}
                          style={{ width: `${opt.percent || 0}%` }}
                        />

                        {/* Content */}
                        <div className="relative z-10 flex items-center gap-3 flex-1 min-w-0">
                          {/* Checked Bubble */}
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            isOptionChecked
                              ? 'bg-blush-500 border-blush-600 text-white shadow-2xs'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {isOptionChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>

                          {/* Attached Photo if available */}
                          {opt.photo && (
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-rose-200/80 flex-shrink-0 shadow-2xs bg-white">
                              <img src={opt.photo} alt={opt.label} className="w-full h-full object-cover" />
                            </div>
                          )}

                          <span className={`text-xs font-black truncate ${
                            isOptionChecked ? 'text-blush-900 font-extrabold' : 'text-slate-700'
                          }`}>
                            {opt.label}
                          </span>
                        </div>

                        {/* Pourcentage de vote unique */}
                        <div className="relative z-10 flex items-center gap-1.5 flex-shrink-0">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                            isOptionChecked
                              ? 'bg-blush-500 text-white shadow-2xs'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}>
                            {opt.percent || 0}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 px-1">
                  <span>
                    {hasVotedAny
                      ? '✨ Vote comptabilisé (cliquez pour modifier)'
                      : '👉 Touchez un choix pour voter'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CRÉATION DE VOTE EN 2 ÉTAPES (CODE PARENT PUIS QUESTION ET CHOIX AVEC PHOTOS) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 shadow-2xl border-2 border-blush-200 flex flex-col max-h-[85vh] animate-in zoom-in-95 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blush-50 flex items-center justify-center text-blush-600">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-sm font-bold text-slate-800">
                  {pinStep ? "Accès Parents Requis" : "Créer un vote"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {pinStep ? (
              /* ÉTAPE 1 : DEMANDE DU CODE PARENT */
              <form onSubmit={handleVerifyPin} className="space-y-3 text-center py-4">
                <div className="w-10 h-10 mx-auto rounded-2xl bg-rose-50 flex items-center justify-center text-blush-600 border border-rose-200">
                  <Lock className="w-5 h-5" />
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-serif text-sm font-black text-slate-800">
                    Déverrouillage Parent
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Entrez votre code d'accès parent pour publier
                  </p>
                </div>

                <div>
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="Code secret (ex: 0812)"
                    value={secretPin}
                    onChange={(e) => setSecretPin(e.target.value)}
                    className="w-full text-center tracking-widest text-base font-mono px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blush-400"
                  />
                  {pinError && (
                    <p className="text-xs text-red-500 font-bold mt-1">{pinError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blush-500 to-rose-500 text-white font-bold py-2.5 rounded-xl shadow-md text-xs transition-all cursor-pointer active:scale-95"
                >
                  Valider mon code
                </button>
              </form>
            ) : (
              /* ÉTAPE 2 : FORMULAIRE QUESTION ET CHOIX LIBRES AVEC PHOTOS */
              <form id="poll-create-form" onSubmit={handleCreatePollSubmit} className="flex flex-col flex-1 min-h-0">
                {/* Scrollable Form Content */}
                <div className="overflow-y-auto flex-1 py-2.5 pr-1 space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Votre Question / Dilemme *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : Quelle couleur pour la chambre ?"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-blush-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blush-400"
                    />
                  </div>

                  {/* Toggle Choix Unique vs Choix Multiple */}
                  <div className="bg-rose-50/50 p-1.5 rounded-xl border border-rose-100 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-700">
                      Mode de vote :
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsMultipleChoice(false)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          !isMultipleChoice
                            ? 'bg-blush-500 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        Choix unique
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMultipleChoice(true)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isMultipleChoice
                            ? 'bg-purple-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        Choix multiple
                      </button>
                    </div>
                  </div>

                  {/* Choix libres avec option Photo */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-black text-slate-700">
                        Choix proposés :
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {optionsList.length} choix
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {optionsList.map((option, index) => (
                        <div key={option.id} className="p-2 rounded-xl border border-rose-100 bg-rose-50/30 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-blush-100 text-blush-700 font-black text-[9px] flex items-center justify-center flex-shrink-0">
                              {index + 1}
                            </span>
                            <input
                              type="text"
                              required
                              placeholder={`Choix ${index + 1}...`}
                              value={option.label}
                              onChange={(e) => handleOptionLabelChange(option.id, e.target.value)}
                              className="flex-1 px-2 py-1 rounded-lg border border-blush-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blush-400"
                            />
                            {optionsList.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOptionRow(option.id)}
                                className="text-slate-300 hover:text-red-500 p-0.5 cursor-pointer"
                                title="Supprimer ce choix"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Photo attachment for this option */}
                          <div className="flex items-center gap-2 pl-5">
                            {option.photo ? (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-blush-300">
                                  <img src={option.photo} alt="" className="w-full h-full object-cover" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOptionPhoto(option.id)}
                                  className="text-[10px] text-red-500 hover:underline font-bold"
                                >
                                  Retirer
                                </button>
                              </div>
                            ) : (
                              <label className="text-[10px] font-bold text-blush-600 bg-white hover:bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs">
                                <Camera className="w-3 h-3 text-blush-500" />
                                <span>+ Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleOptionPhotoUpload(option.id, e.target.files?.[0])}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddOptionRow}
                      className="w-full py-1.5 border-2 border-dashed border-blush-200 text-blush-600 hover:bg-rose-50/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter un choix</span>
                    </button>
                  </div>
                </div>

                {/* Fixed Modal Footer with Submit Button */}
                <div className="pt-2 border-t border-slate-100 flex-shrink-0 bg-white">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blush-500 to-rose-500 hover:from-blush-600 hover:to-rose-600 text-white font-black py-2.5 rounded-xl shadow-md text-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "Publication..." : "Publier"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
