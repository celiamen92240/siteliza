import React, { useState, useEffect } from 'react';
import { X, Sparkles, Trophy, RotateCcw, Check, Camera, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminBirthModal({ isOpen, onClose, isBorn, actualBirth, onBirthSaved, onResetBirth }) {
  const [formData, setFormData] = useState({
    name: actualBirth?.name || '',
    date: actualBirth?.date || '2026-12-08',
    time: actualBirth?.time || '14:20',
    weightG: actualBirth?.weightG || 3350,
    sizeCm: actualBirth?.sizeCm || 49.5,
    hairColor: actualBirth?.hairColor || 'Châtains',
    eyeColor: actualBirth?.eyeColor || 'Marrons',
    photo: actualBirth?.photo || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (actualBirth) {
      setFormData({
        name: actualBirth.name || '',
        date: actualBirth.date || '2026-12-08',
        time: actualBirth.time || '14:20',
        weightG: actualBirth.weightG || 3350,
        sizeCm: actualBirth.sizeCm || 49.5,
        hairColor: actualBirth.hairColor || 'Châtains',
        eyeColor: actualBirth.eyeColor || 'Marrons',
        photo: actualBirth.photo || ''
      });
    }
  }, [actualBirth]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setFormData(prev => ({ ...prev, photo: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

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

            {/* Photo de Bébé */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                Photo de bébé 📸
              </label>
              {formData.photo ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-rose-200">
                  <img src={formData.photo} alt="Bébé" className="w-full h-36 object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="w-full border-2 border-dashed border-rose-200 hover:border-blush-400 bg-rose-50/20 rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer">
                  <Camera className="w-4 h-4 text-rose-500" />
                  <span className="text-[11px] font-bold text-slate-700">Ajouter la photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
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
