import React, { useState, useEffect, useRef } from 'react';
import { Plus, Camera, Check, User, Sparkles, ChevronDown, UserPlus, X, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { compressImage } from '../utils/imageCompressor';

const RELATION_PRESETS = [
  'Tatie',
  'Tonton',
  'Mamie',
  'Papi',
  'Marraine',
  'Parrain',
  'Maman',
  'Papa',
  'Cousine',
  'Cousin',
  'Ami(e) des parents',
  'Autre proche'
];

export default function ParticipantSelector({ selectedName, onSelect, label = "Qui participe ?" }) {
  const [participants, setParticipants] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Tatie');
  const [customRole, setCustomRole] = useState('');
  const [newPhoto, setNewPhoto] = useState(null);
  const dropdownRef = useRef(null);

  const fetchParticipants = () => {
    fetch('/api/participants')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const list = data.participants || [];
          setParticipants(list);
          if (selectedName) {
            const found = list.find(p => p.name?.toLowerCase() === selectedName?.toLowerCase());
            if (found && onSelect) {
              onSelect(found.name, found.photo || found.avatar);
            }
          }
        }
      })
      .catch(err => console.error("Error fetching participants", err));
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Photo = await compressImage(file, 400, 0.85);
      setNewPhoto(base64Photo);
    } catch (err) {
      console.error("Error processing photo", err);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const finalRole = newRole === 'Autre proche' && customRole.trim() ? customRole.trim() : newRole;

    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          role: finalRole,
          avatar: '🌸',
          photo: newPhoto
        })
      });
      const data = await res.json();
      if (data.success) {
        setParticipants(data.participants || []);
        if (onSelect) {
          onSelect(newName.trim(), newPhoto || '🌸');
        }
        setShowAddModal(false);
        setIsOpen(false);
        setNewName('');
        setNewRole('Tatie');
        setCustomRole('');
        setNewPhoto(null);
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error("Error adding participant", err);
    }
  };

  const handleDeleteParticipant = async (e, p) => {
    e.stopPropagation();
    if (!window.confirm(`Supprimer le profil de joueur « ${p.name} » ?`)) return;
    try {
      const res = await fetch(`/api/participants/${encodeURIComponent(p.id || p.name)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setParticipants(data.participants || []);
        if (selectedName?.toLowerCase() === p.name?.toLowerCase() && onSelect) {
          onSelect('', null);
        }
      }
    } catch (err) {
      console.error("Error deleting participant", err);
    }
  };

  const currentSelectedParticipant = participants.find(
    p => p.name?.toLowerCase() === selectedName?.toLowerCase()
  );

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 px-0.5">
          <User className="w-3.5 h-3.5 text-blush-500" />
          <span>{label}</span>
        </label>
      )}

      {/* Trigger Bar : Custom Dropdown Card + Button "+ Nouveau" */}
      <div className="flex items-center gap-2">
        {/* Custom Dropdown Trigger */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white hover:bg-rose-50/40 border border-blush-200 hover:border-blush-300 rounded-2xl py-2 px-3 flex items-center justify-between shadow-2xs transition-all cursor-pointer text-left group"
          >
            {currentSelectedParticipant ? (
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Miniature Photo */}
                <div className="w-8 h-8 rounded-full bg-rose-50 border-2 border-blush-300 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
                  {currentSelectedParticipant.photo ? (
                    <img
                      src={currentSelectedParticipant.photo}
                      alt={currentSelectedParticipant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">{currentSelectedParticipant.avatar || '🌸'}</span>
                  )}
                </div>

                {/* Name & Role Badge */}
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-800 truncate">
                      {currentSelectedParticipant.name}
                    </span>
                    {currentSelectedParticipant.role && (
                      <span className="text-[9px] font-bold text-blush-600 bg-rose-50 px-1.5 py-0.2 rounded-md border border-rose-100/80 flex-shrink-0">
                        {currentSelectedParticipant.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-xs font-medium text-slate-500">Choisir qui participe...</span>
              </div>
            )}

            <ChevronDown className={`w-4 h-4 text-blush-400 transition-transform duration-200 flex-shrink-0 ml-1.5 ${isOpen ? 'rotate-180 text-blush-600' : ''}`} />
          </button>

          {/* Floating Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border-2 border-blush-200 p-1.5 space-y-1 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95">
              {participants.length === 0 ? (
                <div className="text-center py-3 text-xs text-slate-400 font-medium">
                  Aucun joueur pour le moment
                </div>
              ) : (
                participants.map((p) => {
                  const isSelected = p.name?.toLowerCase() === selectedName?.toLowerCase();
                  return (
                    <div
                      key={p.id || p.name}
                      className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-rose-50 text-blush-700 font-bold border border-rose-200 shadow-2xs'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelect) onSelect(p.name, p.photo || p.avatar);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-full bg-white border border-blush-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
                          {p.photo ? (
                            <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">{p.avatar || '🌸'}</span>
                          )}
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold block truncate">{p.name}</span>
                          {p.role && (
                            <span className="text-[9px] text-slate-400 font-medium block">
                              {p.role}
                            </span>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-1.5">
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-blush-600 stroke-[3px]" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteParticipant(e, p)}
                          className="p-1 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50 cursor-pointer transition-colors"
                          title={`Supprimer ${p.name}`}
                        >
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Bottom option to add inside dropdown */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowAddModal(true);
                }}
                className="w-full mt-1 pt-1.5 border-t border-rose-100 text-blush-600 hover:bg-rose-50/60 p-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                <span>Nouveau joueur</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Button "+ Nouveau" at the right end */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blush-500 to-rose-500 hover:from-blush-600 hover:to-rose-600 text-white text-xs font-bold px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-2xs hover:shadow-sm active:scale-95 transition-all cursor-pointer flex-shrink-0 h-[44px]"
          title="Ajouter un nouveau participant"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nouveau</span>
        </button>
      </div>

      {/* MODAL DE CRÉATION DE JOUEUR AVEC PHOTO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 shadow-2xl border-2 border-blush-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-rose-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center text-blush-600">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-sm font-black text-slate-800">
                  Nouveau Joueur
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddParticipant} className="space-y-3.5">
              {/* Photo Upload Preview */}
              <div className="flex flex-col items-center gap-1.5">
                <label className="w-16 h-16 rounded-2xl border-2 border-dashed border-blush-300 flex flex-col items-center justify-center cursor-pointer bg-rose-50/40 hover:bg-rose-50 relative overflow-hidden shadow-2xs transition-all group">
                  {newPhoto ? (
                    <img src={newPhoto} alt="Aperçu" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-1">
                      <Camera className="w-5 h-5 text-blush-500 mx-auto mb-0.5" />
                      <span className="text-[9px] font-bold text-blush-600 block">+ Photo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  {newPhoto ? '✅ Photo prête' : 'Ajouter une photo (facultatif)'}
                </span>
              </div>

              {/* Prénom */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Célia, Julien, Mamie..."
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-blush-200 bg-rose-50/20 focus:outline-none focus:ring-2 focus:ring-blush-400"
                />
              </div>

              {/* Lien de Parenté */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Lien de parenté / Rôle
                </label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-blush-200 bg-rose-50/20 focus:outline-none focus:ring-2 focus:ring-blush-400 cursor-pointer"
                >
                  {RELATION_PRESETS.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>

                {newRole === 'Autre proche' && (
                  <input
                    type="text"
                    required
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                    placeholder="Préciser le lien (ex: Voisin...)"
                    className="w-full text-xs font-bold px-3 py-1.5 mt-1.5 rounded-xl border border-blush-200 bg-rose-50/20 focus:outline-none focus:ring-2 focus:ring-blush-400"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blush-500 to-rose-500 text-white font-black text-xs py-2.5 rounded-xl shadow-md hover:shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enregistrer ✨</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
