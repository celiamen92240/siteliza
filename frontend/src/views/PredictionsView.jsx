import React, { useState, useEffect } from 'react';
import { Target, PlusCircle, Trophy, Sparkles, Heart, Award, CheckCircle, HelpCircle, Trash2, Camera, ArrowRight, ChevronDown, MousePointerClick } from 'lucide-react';
import confetti from 'canvas-confetti';
import ParticipantSelector from '../components/ParticipantSelector';

export default function PredictionsView({ isBorn, actualBirth, onOpenAdmin }) {
  const [predictions, setPredictions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Form State
  const [formData, setFormData] = useState({
    author: '',
    avatar: '🌸',
    photo: null,
    date: '2026-12-08',
    time: '12:00',
    weightG: 3400,
    sizeCm: 50,
    nameGuess: '',
    hairColor: 'Châtains',
    eyeColor: 'Marrons',
    comment: ''
  });

  const fetchPredictions = () => {
    fetch('/api/predictions')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPredictions(data.predictions || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching predictions", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPredictions();
  }, [isBorn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.author.trim()) {
      alert("Merci de sélectionner qui participe ou de créer un nouveau joueur !");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f63d65', '#d8b4fe', '#e21d4c', '#ffa8b8']
        });
        setSuccessMsg("Pari enregistré avec succès ! 🎉");
        setShowForm(false);
        fetchPredictions();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePrediction = async (id, authorName) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le pronostic de ${authorName} ?`)) return;

    try {
      const res = await fetch(`/api/predictions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPredictions(data.predictions || []);
        setSuccessMsg("Pronostic supprimé.");
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error("Error deleting prediction", err);
    }
  };

  // Average calculations
  const avgWeight = predictions.length > 0 
    ? Math.round(predictions.reduce((acc, p) => acc + (Number(p.weightG) || 0), 0) / predictions.length)
    : 3400;
  const avgSize = predictions.length > 0
    ? (predictions.reduce((acc, p) => acc + (Number(p.sizeCm) || 0), 0) / predictions.length).toFixed(1)
    : 50.0;

  return (
    <div className="px-5 space-y-5 pb-6">
      {/* Header Banner */}
      <div className="glass-card-pink rounded-3xl p-5 border border-blush-200/90 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blush-600">
              Jeu Familial
            </span>
            <h2 className="font-serif text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span>Le Grand Pronostic</span>
            </h2>
            <p className="text-xs text-rose-500 font-medium">
              {isBorn 
                ? 'Les résultats sont tombés ! Découvrez le classement.'
                : 'Fais tes paris sur le jour J, le poids, la taille et le prénom !'}
            </p>
          </div>
          <img src="/logo.jpg" alt="Logo" className="w-10 h-10 rounded-2xl object-cover shadow-2xs border border-[#E7BEF8]" />
        </div>

        {/* Family Summary Stats */}
        {!isBorn && predictions.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 bg-white/80 rounded-2xl p-3 border border-blush-100 shadow-2xs">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Poids Moyen Prédit</p>
              <p className="text-sm font-extrabold text-blush-600">{avgWeight} g</p>
            </div>
            <div className="text-center border-l border-rose-100">
              <p className="text-[10px] uppercase font-bold text-slate-400">Taille Moyenne Prédite</p>
              <p className="text-sm font-extrabold text-blush-600">{avgSize} cm</p>
            </div>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="bg-blush-500 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-md flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. ÉTAPE PRÉLIMINAIRE : SÉLECTION DU JOUEUR AVANT LE PRONOSTIC */}
      {!isBorn && !showForm && (
        <div className="bg-white rounded-3xl p-5 shadow-lg border-2 border-[#E7BEF8] space-y-4 animate-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#F2619C]/20 via-[#FFE066]/40 to-[#E7BEF8]/50 border border-[#F2619C]/30 flex items-center justify-center text-[#F2619C] shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-black text-slate-800">
              Participer au Grand Pronostic
            </h3>
            <p className="text-xs text-rose-500 font-medium">
              Choisis ton profil ci-dessous pour faire tes pronostics sur la petite princesse !
            </p>
          </div>

          <div className="text-left pt-1">
            <ParticipantSelector
              selectedName={formData.author}
              onSelect={(name, photoOrAvatar) => {
                const isPhoto = photoOrAvatar && (photoOrAvatar.startsWith('data:') || photoOrAvatar.startsWith('http') || photoOrAvatar.startsWith('/'));
                setFormData(prev => ({
                  ...prev,
                  author: name,
                  photo: isPhoto ? photoOrAvatar : null,
                  avatar: !isPhoto ? (photoOrAvatar || '🌸') : '🌸'
                }));
              }}
              label="Qui participe au pronostic ?"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (!formData.author.trim()) {
                alert("Merci de sélectionner un participant ou de cliquer sur Créer un joueur !");
                return;
              }
              setShowForm(true);
            }}
            className="w-full bg-gradient-to-r from-[#F2619C] to-[#de3881] hover:from-[#d43f7d] hover:to-[#c52c6e] text-white font-bold py-3.5 rounded-2xl shadow-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 glow-pink"
          >
            <span>Commencer mon pronostic</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. FORMULAIRE DE PRONOSTIC (LANCÉ APRÈS LE CHOIX DU JOUEUR) */}
      {!isBorn && showForm && (
        <form onSubmit={handleSubmit} className="w-full max-w-full bg-white rounded-3xl p-5 shadow-xl border-2 border-[#E7BEF8] space-y-4 animate-in fade-in zoom-in-95 overflow-hidden box-border">
          {/* En-tête avec rappel du joueur et bouton Changer */}
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white p-0.5 border-2 border-[#F2619C] overflow-hidden flex items-center justify-center shadow-2xs">
                {formData.photo ? (
                  <img src={formData.photo} alt={formData.author} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-base">{formData.avatar || '🌸'}</span>
                )}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Pronostic de :</p>
                <h4 className="font-serif text-sm font-black text-slate-800 leading-tight">
                  {formData.author}
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[11px] font-bold text-slate-400 hover:text-[#F2619C] bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 cursor-pointer transition-colors"
            >
              Changer de joueur ✕
            </button>
          </div>

          {/* Date de naissance - Ligne complète même taille que prénom */}
          <div className="space-y-1 min-w-0 w-full">
            <label className="block text-[11px] font-bold text-slate-700">
              Date de naissance * :
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              className="w-full max-w-full block box-border min-w-0 px-3 py-2.5 rounded-2xl border-2 border-[#E7BEF8] bg-[#fdf8fb] text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#F2619C] shadow-2xs appearance-none"
            />
          </div>

          {/* Heure estimée - Ligne complète même taille que prénom */}
          <div className="space-y-1 min-w-0 w-full">
            <label className="block text-[11px] font-bold text-slate-700">
              Heure estimée :
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
              style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              className="w-full max-w-full block box-border min-w-0 px-3 py-2.5 rounded-2xl border-2 border-[#E7BEF8] bg-[#fdf8fb] text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#F2619C] shadow-2xs appearance-none"
            />
          </div>

          {/* Idée de Prénom */}
          <div className="space-y-1 min-w-0 w-full">
            <label className="block text-[11px] font-bold text-slate-700">
              Idée de prénom pour la petite fille (ou 1ère lettre) :
            </label>
            <input
              type="text"
              value={formData.nameGuess}
              onChange={e => setFormData({ ...formData, nameGuess: e.target.value })}
              placeholder="Ex: Romy, Juliette, Céleste..."
              style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              className="w-full max-w-full block box-border min-w-0 px-3 py-2.5 rounded-2xl border-2 border-[#E7BEF8] bg-[#fdf8fb] text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#F2619C] shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* Poids & Taille - 2 RECTANGLES BIEN DISTINCTS ET SÉPARÉS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 min-w-0">
              <label className="block text-[11px] font-bold text-slate-700">
                Poids (en grammes) *
              </label>
              <input
                type="number"
                min="1500"
                max="5500"
                step="10"
                required
                value={formData.weightG}
                onChange={e => setFormData({ ...formData, weightG: e.target.value })}
                placeholder="Ex: 3450 g"
                className="w-full box-border min-w-0 px-2.5 py-2 rounded-2xl border-2 border-[#E7BEF8] bg-[#fdf8fb] text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#F2619C] shadow-2xs"
              />
            </div>
            <div className="space-y-1 min-w-0">
              <label className="block text-[11px] font-bold text-slate-700">
                Taille (en cm) *
              </label>
              <input
                type="number"
                min="40"
                max="60"
                step="0.5"
                required
                value={formData.sizeCm}
                onChange={e => setFormData({ ...formData, sizeCm: e.target.value })}
                placeholder="Ex: 49.5 cm"
                className="w-full box-border min-w-0 px-2.5 py-2 rounded-2xl border-2 border-[#E7BEF8] bg-[#fdf8fb] text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#F2619C] shadow-2xs"
              />
            </div>
          </div>

          {/* Cheveux & Yeux - 2 RECTANGLES BIEN DISTINCTS ET SÉPARÉS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 min-w-0">
              <label className="block text-[11px] font-bold text-slate-700">
                Couleur cheveux :
              </label>
              <select
                value={formData.hairColor}
                onChange={e => setFormData({ ...formData, hairColor: e.target.value })}
                className="w-full box-border min-w-0 px-2.5 py-2 rounded-2xl border-2 border-[#E7BEF8] bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#F2619C] shadow-2xs"
              >
                <option value="Bruns">Bruns</option>
                <option value="Châtains">Châtains</option>
                <option value="Blonds">Blonds</option>
                <option value="Roux">Roux</option>
                <option value="Duvet fin">Duvet fin / Chauve</option>
              </select>
            </div>
            <div className="space-y-1 min-w-0">
              <label className="block text-[11px] font-bold text-slate-700">
                Couleur yeux :
              </label>
              <select
                value={formData.eyeColor}
                onChange={e => setFormData({ ...formData, eyeColor: e.target.value })}
                className="w-full box-border min-w-0 px-2.5 py-2 rounded-2xl border-2 border-[#E7BEF8] bg-white text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#F2619C] shadow-2xs"
              >
                <option value="Marrons">Marrons</option>
                <option value="Bleus">Bleus</option>
                <option value="Verts">Verts</option>
                <option value="Noisette">Noisette</option>
                <option value="Gris">Gris</option>
              </select>
            </div>
          </div>

          {/* Mot doux */}
          <div className="space-y-1 min-w-0">
            <label className="block text-[11px] font-bold text-slate-700">
              Un mot d'encouragement pour Liza & Clément :
            </label>
            <textarea
              rows="2"
              value={formData.comment}
              onChange={e => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Ex: Hâte de voir sa petite bouille d'amour !"
              className="w-full box-border min-w-0 px-3 py-2 rounded-2xl border-2 border-[#E7BEF8] bg-[#fdf8fb] text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F2619C] shadow-2xs placeholder:text-slate-400"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-[#F2619C] to-[#de3881] hover:from-[#d43f7d] hover:to-[#c52c6e] text-white font-bold py-3.5 rounded-2xl shadow-md text-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer mon pronostic'}
          </button>
        </form>
      )}

      {/* CLASSEMENT DES GAGNANTS SI NAISSANCE CONFIRMÉE */}
      {isBorn && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-black text-slate-800 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Podium & Classement Officiel</span>
            </h3>
            <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
              {predictions.length} participants
            </span>
          </div>

          {/* Podium 1, 2, 3 */}
          {predictions.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 items-end pt-6 pb-2 text-center">
              {/* 2nd Place */}
              <div className="bg-gradient-to-t from-slate-200 to-white rounded-2xl p-2.5 border border-slate-300 shadow-sm relative order-1">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black bg-slate-200 px-2 py-0.5 rounded-full shadow-2xs">#2</span>
                <div className="w-10 h-10 rounded-full mx-auto overflow-hidden mt-1 border border-slate-300">
                  {predictions[1]?.photo ? (
                    <img src={predictions[1]?.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <img src="/logo.jpg" alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="font-extrabold text-xs text-slate-800 truncate mt-1">{predictions[1]?.author}</p>
                <p className="text-[11px] font-black text-slate-600">{predictions[1]?.totalScore} pts</p>
              </div>

              {/* 1st Place (Grand Gagnant) */}
              <div className="bg-gradient-to-t from-rose-200 to-pink-50 rounded-3xl p-3 border-2 border-blush-400 shadow-lg relative order-2 transform -translate-y-2">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black bg-[#FFE066] text-[#78350f] px-2.5 py-0.5 rounded-full shadow-2xs">#1 Vainqueur</span>
                <div className="w-12 h-12 rounded-full mx-auto overflow-hidden mt-1 border-2 border-blush-400 shadow">
                  {predictions[0]?.photo ? (
                    <img src={predictions[0]?.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <img src="/logo.jpg" alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="font-black text-sm text-rose-950 truncate mt-1">{predictions[0]?.author}</p>
                <span className="inline-block bg-blush-500 text-white font-black text-xs px-2 py-0.5 rounded-full mt-1">
                  {predictions[0]?.totalScore} pts
                </span>
                <p className="text-[10px] text-rose-900 font-bold mt-1">Grand Vainqueur !</p>
              </div>

              {/* 3rd Place */}
              <div className="bg-gradient-to-t from-purple-100 to-white rounded-2xl p-2.5 border border-purple-200 shadow-sm relative order-3">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full shadow-2xs">#3</span>
                <div className="w-10 h-10 rounded-full mx-auto overflow-hidden mt-1 border border-purple-200">
                  {predictions[2]?.photo ? (
                    <img src={predictions[2]?.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <img src="/logo.jpg" alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="font-extrabold text-xs text-slate-800 truncate mt-1">{predictions[2]?.author}</p>
                <p className="text-[11px] font-black text-purple-700">{predictions[2]?.totalScore} pts</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wall of Predictions with Accordion Disclosure */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-slate-800 flex items-center gap-2">
            <span>Tous les pronostics</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {predictions.length} parieurs
          </span>
        </div>

        {/* Phrase d'indication design sur une seule ligne */}
        {predictions.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-50/50 rounded-xl border border-rose-100/70 shadow-2xs">
            <MousePointerClick className="w-3.5 h-3.5 text-blush-500 flex-shrink-0" />
            <span className="text-[11px] text-rose-500 font-medium italic truncate whitespace-nowrap">
              Clique sur un proche pour découvrir son pronostic secret !
            </span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400">Chargement des pronostics...</div>
        ) : predictions.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-3xl border border-rose-100 p-6 space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-[#F2619C]/20 via-[#FFE066]/40 to-[#E7BEF8]/50 border border-[#F2619C]/30 flex items-center justify-center text-[#F2619C] shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">Aucun pronostic pour le moment</p>
            <p className="text-[11px] text-slate-400">Sois le premier de la famille à pronostiquer !</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {predictions.map((p, idx) => {
              const cardId = p.id || idx;
              const isExpanded = !!expandedIds[cardId];

              return (
                <div
                  key={cardId}
                  className={`bg-white rounded-2xl shadow-sm border transition-all overflow-hidden ${
                    isExpanded ? 'border-blush-300 ring-2 ring-blush-100' : 'border-rose-100/80 hover:border-blush-200'
                  } ${
                    isBorn && idx === 0 
                      ? 'border-blush-300 bg-gradient-to-r from-rose-50/80 to-purple-50/60 ring-2 ring-blush-300' 
                      : ''
                  }`}
                >
                  {/* Entête cliquable du parieur (Toujours visible) */}
                  <div
                    onClick={() => toggleExpand(cardId)}
                    className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-rose-50/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Photo or Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-lg flex-shrink-0 shadow-2xs overflow-hidden">
                        {p.photo ? (
                          <img src={p.photo} alt={p.author} className="w-full h-full object-cover" />
                        ) : (
                          <img src="/logo.jpg" alt={p.author} className="w-full h-full object-cover" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-800 truncate">
                            {p.author}
                          </h4>
                          {isBorn && (
                            <span className="text-[10px] font-black text-blush-600 bg-rose-100 px-1.5 py-0.2 rounded-md flex-shrink-0">
                              #{idx + 1}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                          Prédit le {new Date(p.date || p.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} {p.time ? `à ${p.time}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isBorn && (
                        <span className="text-xs font-black text-blush-600 bg-blush-50 px-2 py-1 rounded-full border border-blush-200">
                          {p.totalScore} pts
                        </span>
                      )}

                      <div className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-100/80 flex items-center justify-center text-blush-500 transition-colors">
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blush-600' : ''}`} />
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePrediction(p.id, p.author);
                        }}
                        className="text-slate-300 hover:text-red-500 p-1 transition-colors cursor-pointer"
                        title="Supprimer ce pronostic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bet Details Grid - S'affiche uniquement au clic */}
                  {isExpanded && (
                    <div className="p-3.5 pt-0 border-t border-slate-100 animate-in fade-in-50 duration-200 space-y-2.5">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2.5 text-center">
                        {/* Poids */}
                        <div className="bg-[#fdf2f7] rounded-xl p-2 border border-[#F2619C]/20 shadow-2xs">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center justify-center gap-1">
                            <span>Poids</span>
                          </p>
                          <p className="text-xs font-black text-slate-800 mt-0.5">{p.weightG ? `${p.weightG} g` : `${p.weight || 3400} g`}</p>
                        </div>

                        {/* Taille */}
                        <div className="bg-[#fcf5ff] rounded-xl p-2 border border-[#E7BEF8]/50 shadow-2xs">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center justify-center gap-1">
                            <span>Taille</span>
                          </p>
                          <p className="text-xs font-black text-slate-800 mt-0.5">{p.sizeCm || p.height || 50} cm</p>
                        </div>

                        {/* Prénom */}
                        <div className="bg-[#f5f8fd] rounded-xl p-2 border border-[#93ABD9]/40 shadow-2xs col-span-2 sm:col-span-1">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center justify-center gap-1">
                            <span>Prénom</span>
                          </p>
                          <p className="text-xs font-black text-[#F2619C] truncate mt-0.5">{p.nameGuess || p.firstName || 'Non renseigné'}</p>
                        </div>

                        {/* Yeux */}
                        <div className="bg-[#fffdf0] rounded-xl p-2 border border-[#FFE066]/60 shadow-2xs">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center justify-center gap-1">
                            <span>Yeux</span>
                          </p>
                          <p className="text-xs font-black text-slate-800 mt-0.5">{p.eyeColor || 'Marrons'}</p>
                        </div>

                        {/* Cheveux */}
                        <div className="bg-[#fdf8fb] rounded-xl p-2 border border-rose-100 shadow-2xs">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center justify-center gap-1">
                            <span>Cheveux</span>
                          </p>
                          <p className="text-xs font-black text-slate-800 mt-0.5">{p.hairColor || 'Châtains'}</p>
                        </div>

                        {/* Date / Heure prédite */}
                        <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/70 shadow-2xs col-span-2 sm:col-span-1">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center justify-center gap-1">
                            <span>Jour J</span>
                          </p>
                          <p className="text-xs font-black text-slate-800 truncate mt-0.5">
                            {new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} {p.time ? `(${p.time})` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Score Breakdown if Born */}
                      {isBorn && p.scoreDetails && (
                        <div className="mt-2.5 bg-rose-50/70 rounded-xl p-2.5 border border-rose-200 text-[10px] space-y-1 text-slate-600">
                          <div className="flex justify-between font-medium">
                            <span>Date : {p.scoreDetails.dateNote}</span>
                            <span className="font-bold text-rose-800">+{p.scoreDetails.datePoints} pts</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Poids : {p.scoreDetails.weightNote}</span>
                            <span className="font-bold text-rose-800">+{p.scoreDetails.weightPoints} pts</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Taille : {p.scoreDetails.sizeNote}</span>
                            <span className="font-bold text-rose-800">+{p.scoreDetails.sizePoints} pts</span>
                          </div>
                          {p.scoreDetails.namePoints > 0 && (
                            <div className="flex justify-between font-bold text-blush-600">
                              <span>Prénom : {p.scoreDetails.nameNote}</span>
                              <span>+{p.scoreDetails.namePoints} pts</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Comment */}
                      {p.comment && (
                        <p className="text-[11px] text-slate-600 italic bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                          « {p.comment} »
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
