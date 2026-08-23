import React, { useState } from 'react';
import { X, Sparkles, Trophy, RotateCcw, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminBirthModal({ isOpen, onClose, isBorn, actualBirth, onBirthSaved, onResetBirth }) {
  const [formData, setFormData] = useState({
    name: actualBirth?.name || '',
    date: actualBirth?.date || '2026-12-08',
    time: actualBirth?.time || '14:20',
    weightG: actualBirth?.weightG || 3350,
    sizeCm: actualBirth?.sizeCm || 49.5,
    hairColor: actualBirth?.hairColor || 'Châtains',
    eyeColor: actualBirth?.eyeColor || 'Marrons'
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/birth-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#ff708d', '#f63d65', '#fbdf8a', '#3b82f6', '#10b981']
        });
        onBirthSaved(data.actualBirth);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Voulez-vous repasser en mode 'Grossesse en cours' ?")) return;
    try {
      await fetch('/api/birth-result/reset', { method: 'POST' });
      onResetBirth();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-rose-200 relative animate-in zoom-in-95 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-inner">
            👑
          </div>
          <h3 className="font-serif text-lg font-black text-slate-800">
            Espace Parents (Liza & Clément)
          </h3>
          <p className="text-xs text-rose-500 font-semibold">
            {isBorn ? 'Bébé est né ! Modifier les informations' : 'Bébé est arrivé ? Déclenche le podium !'}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Prénom officiel de la petite fille *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Romy..."
              className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Date réelle *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full text-xs font-medium px-2.5 py-2 rounded-xl border border-amber-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Heure réelle
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="w-full text-xs font-medium px-2.5 py-2 rounded-xl border border-amber-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Poids exact (g) *
              </label>
              <input
                type="number"
                required
                value={formData.weightG}
                onChange={e => setFormData({ ...formData, weightG: e.target.value })}
                className="w-full text-xs font-medium px-2.5 py-2 rounded-xl border border-amber-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Taille exacte (cm) *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.sizeCm}
                onChange={e => setFormData({ ...formData, sizeCm: e.target.value })}
                className="w-full text-xs font-medium px-2.5 py-2 rounded-xl border border-amber-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-extrabold py-3 rounded-xl shadow-md text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span>{saving ? 'Calcul des scores...' : 'Enregistrer & Calculer les Vainqueurs 🏆'}</span>
          </button>
        </form>

        {isBorn && (
          <button
            onClick={handleReset}
            type="button"
            className="w-full text-slate-400 hover:text-slate-600 text-[11px] font-semibold flex items-center justify-center gap-1.5 pt-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Réinitialiser (Repasser en mode grossesse)</span>
          </button>
        )}
      </div>
    </div>
  );
}
