import React, { useState, useEffect } from 'react';
import { HelpCircle, PlusCircle, CheckCircle2, Vote, Sparkles, Lock, X, Trash2, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PollsView({ voterName }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myVotes, setMyVotes] = useState(JSON.parse(localStorage.getItem('my_polls_votes') || '{}'));
  const [showAddModal, setShowAddModal] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [codeError, setCodeError] = useState('');

  // Form to add a new dilemma / poll
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Décoration 🎨');
  const [newDesc, setNewDesc] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');

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
    const newVotes = { ...myVotes, [pollId]: optionId };
    setMyVotes(newVotes);
    localStorage.setItem('my_polls_votes', JSON.stringify(newVotes));

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#ff708d', '#f63d65', '#d8b4fe', '#fde047']
    });

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionId,
          voter: voterName || 'Un proche'
        })
      });
      const data = await res.json();
      if (data.success) {
        setPolls(data.polls || []);
      }
    } catch (err) {
      console.error("Error voting on poll", err);
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !option1.trim() || !option2.trim()) return;

    const options = [
      { label: option1.trim(), emoji: '🌸' },
      { label: option2.trim(), emoji: '✨' }
    ];
    if (option3.trim()) {
      options.push({ label: option3.trim(), emoji: '💖' });
    }

    try {
      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          description: newDesc.trim(),
          options,
          secretCode
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        setPolls(data.polls || []);
        setShowAddModal(false);
        setNewTitle('');
        setNewDesc('');
        setOption1('');
        setOption2('');
        setOption3('');
        setSecretCode('');
      } else {
        setCodeError(data.error || "Code d'accès incorrect");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="px-5 space-y-5 pb-8">
      {/* Header Banner */}
      <div className="glass-card-pink rounded-3xl p-5 border border-blush-200/90 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blush-600">
              Sondages & Idées • Aidez les Parents !
            </span>
            <h2 className="font-serif text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span>Hésitations de Liza & Clément</span>
              <div className="w-7 h-7 rounded-xl bg-white text-amber-500 flex items-center justify-center shadow-2xs border border-amber-200">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-300" />
              </div>
            </h2>
            <p className="text-xs text-rose-500 font-medium">
              Vote sur leurs dilemmes : déco de chambre, achats, tenues et prénoms !
            </p>
          </div>
        </div>
      </div>

      {/* Button to add a dilemma (for Parents) */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full bg-white hover:bg-rose-50/60 text-blush-700 font-bold py-3 px-4 rounded-2xl shadow-xs border border-blush-200 transition-all flex items-center justify-center gap-2 text-xs"
      >
        <PlusCircle className="w-4 h-4 text-blush-500" />
        <span>Poser un nouveau dilemme (Réservé aux Parents)</span>
      </button>

      {/* Polls List */}
      {loading ? (
        <div className="text-center py-8 text-xs text-slate-400">Chargement des sondages...</div>
      ) : (
        <div className="space-y-4">
          {polls.map((p) => {
            const totalVotes = p.options.reduce((acc, o) => acc + (o.votes || 0), 0);
            const userChoice = myVotes[p.id];

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100/90 space-y-3.5 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Card Top: Category & Vote count & Delete */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-blush-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                      {p.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeletePoll(p.id, p.title)}
                      className="text-slate-300 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="Supprimer ce sondage"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {totalVotes} vote{totalVotes > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-serif text-sm font-bold text-slate-800 leading-tight">
                    {p.title}
                  </h3>
                  {p.description && (
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                </div>

                {/* Options & Votes */}
                <div className="space-y-2 pt-1">
                  {p.options.map((opt) => {
                    const isSelected = userChoice === opt.id;
                    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleVote(p.id, opt.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all relative overflow-hidden flex flex-col gap-1.5 ${
                          isSelected
                            ? 'border-blush-400 bg-blush-50/50 shadow-xs ring-2 ring-blush-200'
                            : 'border-slate-100 bg-rose-50/20 hover:bg-rose-50/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs relative z-10">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{opt.emoji || '🌸'}</span>
                            <span>{opt.label}</span>
                          </span>
                          <span className="font-black text-blush-600 text-xs">
                            {pct}% ({opt.votes || 0})
                          </span>
                        </div>

                        {/* Progress Bar under the option */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative z-10">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isSelected
                                ? 'bg-gradient-to-r from-blush-500 to-rose-400'
                                : 'bg-gradient-to-r from-purple-300 to-blush-300'
                            }`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to add a new dilemma */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-rose-200 relative animate-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto shadow-2xs">
                <Lightbulb className="w-6 h-6 fill-amber-300" />
              </div>
              <h3 className="font-serif text-lg font-black text-slate-800">
                Nouveau Dilemme des Parents
              </h3>
              <p className="text-xs text-slate-500">
                Posez une question à vos proches pour qu'ils votent !
              </p>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Code Secret Parents *
                </label>
                <input
                  type="password"
                  required
                  value={secretCode}
                  onChange={e => { setSecretCode(e.target.value); setCodeError(''); }}
                  placeholder="Votre code secret"
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-blush-300 bg-rose-50/20"
                />
                {codeError && <p className="text-[10px] text-red-500 font-bold mt-1">{codeError}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/20"
                >
                  <option value="Décoration 🎨">Décoration 🎨</option>
                  <option value="Achats & Équipement 🛒">Achats & Équipement 🛒</option>
                  <option value="Mode Bébé 👗">Mode Bébé 👗</option>
                  <option value="Idées Prénoms 💖">Idées Prénoms 💖</option>
                  <option value="Organisation 📋">Organisation 📋</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Titre du dilemme *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex: Quelle tapisserie pour le mur ?"
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Petite explication (facultatif)
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Ex: On hésite pour la chambre..."
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/20"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700">
                  Les choix possibles *
                </label>
                <input
                  type="text"
                  required
                  value={option1}
                  onChange={e => setOption1(e.target.value)}
                  placeholder="Option 1 (Ex: Fleurs champêtres)"
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/20"
                />
                <input
                  type="text"
                  required
                  value={option2}
                  onChange={e => setOption2(e.target.value)}
                  placeholder="Option 2 (Ex: Ciel étoilé & lune)"
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/20"
                />
                <input
                  type="text"
                  value={option3}
                  onChange={e => setOption3(e.target.value)}
                  placeholder="Option 3 (facultatif)"
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/20"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blush-500 text-white font-bold py-3 rounded-xl shadow-md text-xs hover:bg-blush-600 transition-colors"
              >
                Publier le Sondage pour la Famille ✨
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
