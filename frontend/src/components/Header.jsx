import React, { useState, useEffect, useRef } from 'react';
import { Heart, Plus, X, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { compressImage } from '../utils/imageCompressor';

export default function Header({ onAdminClick, isBorn }) {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [logoPhoto, setLogoPhoto] = useState(localStorage.getItem('app_custom_logo') || '/logo.jpg');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config?.customLogo) {
          setLogoPhoto(data.config.customLogo);
          localStorage.setItem('app_custom_logo', data.config.customLogo);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Compress and optimize photo for mobile instantly (works with iOS & Android photos)
      const base64Photo = await compressImage(file, 500, 0.85);
      setLogoPhoto(base64Photo);
      localStorage.setItem('app_custom_logo', base64Photo);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 },
        colors: ['#f63d65', '#d8b4fe', '#fbdf8a']
      });

      await fetch('/api/config/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: base64Photo })
      });
    } catch (err) {
      console.error("Error saving custom logo", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <header className="px-5 pt-4 pb-3 flex items-center justify-between relative">
        <div className="flex items-center gap-2.5">
          {/* Native Label wrapper for 100% reliable tap on iPhone / Android */}
          <label
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F2619C] via-[#E7BEF8] to-[#EDE986] p-0.5 shadow-md flex items-center justify-center transform -rotate-2 hover:rotate-0 transition-transform overflow-hidden relative group cursor-pointer"
            title="Changer la photo (Galerie ou Appareil photo)"
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />

            <img
              src={logoPhoto}
              alt="Logo Application"
              className={`w-full h-full object-cover rounded-[14px] transition-opacity ${
                uploading ? 'opacity-50' : 'opacity-100'
              }`}
            />

            {/* Subtle semi-transparent + badge */}
            <div className="absolute bottom-1 right-1 bg-[#812348]/80 text-white w-4 h-4 rounded-full flex items-center justify-center text-[11px] font-black leading-none backdrop-blur-2xs shadow-2xs pointer-events-none">
              {uploading ? '⏳' : '+'}
            </div>
          </label>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif text-xl font-black text-slate-800 tracking-tight leading-none">
                Liza & Clément
              </h1>
              <span className="inline-block animate-pulse">💖</span>
            </div>
            <p className="text-[11px] font-bold text-[#F2619C] flex items-center gap-1 mt-0.5">
              <Heart className="w-3 h-3 fill-[#F2619C] text-[#F2619C]" />
              <span>En attendant notre petite fille</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Clean Parents Space Lock Button */}
          <button
            type="button"
            onClick={onAdminClick}
            title="Espace Parents"
            className={`w-9 h-9 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer shadow-xs ${
              isBorn 
                ? 'bg-[#EDE986] text-[#812348] border-white animate-bounce-subtle' 
                : 'bg-white/90 hover:bg-[#fdf2f7] text-[#F2619C] border-[#E7BEF8]'
            }`}
          >
            {isBorn ? <span className="text-sm">🎉</span> : <Lock className="w-4 h-4 text-[#F2619C]" />}
          </button>
        </div>
      </header>

      {/* Modal Guide d'installation sur écran d'accueil */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-200 relative animate-in zoom-in-95 space-y-4 text-center">
            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-lg mx-auto border-2 border-blush-300 p-0.5 bg-gradient-to-tr from-blush-400 to-rose-300 relative group">
              <img src={logoPhoto} alt="Logo" className="w-full h-full object-cover rounded-[22px]" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-lg font-black text-slate-800">
                Installer l'application sur ton téléphone 📲
              </h3>
              <p className="text-xs text-rose-500 font-semibold">
                Pour l'avoir directement sur ton écran d'accueil avec le petit dinosaure rose !
              </p>
            </div>

            <div className="bg-rose-50/60 rounded-2xl p-4 text-left space-y-3 text-xs text-slate-700 border border-rose-100">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blush-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
                <p>Ouvre le site sur <strong>Safari (iPhone)</strong> ou <strong>Chrome (Android)</strong>.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blush-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
                <p>Appuie sur le bouton <strong>Partager ⬆️</strong> (en bas sur Safari ou 3 petits points sur Android).</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blush-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">3</span>
                <p>Choisis <strong>« Sur l'écran d'accueil » 📲</strong> puis clique sur <strong>Ajouter</strong>.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <label className="flex-1 bg-rose-100 hover:bg-rose-200 text-blush-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <span>Changer la photo</span>
              </label>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="flex-1 bg-blush-500 hover:bg-blush-600 text-white font-bold py-2.5 rounded-xl shadow text-xs transition-colors cursor-pointer"
              >
                Super ! ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
