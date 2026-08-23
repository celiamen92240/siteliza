import React, { useState, useEffect } from 'react';
import { HeartHandshake, Send, Heart, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import ParticipantSelector from '../components/ParticipantSelector';

export default function GuestbookView() {
  const [messages, setMessages] = useState([]);
  const [author, setAuthor] = useState(localStorage.getItem('guestbook_author') || 'Célia');
  const [authorPhoto, setAuthorPhoto] = useState(null);
  const [text, setText] = useState('');
  const [emoji, setEmoji] = useState('💖');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const emojiList = ['🌸', '💕', '✨', '🍼', '👶', '🧸', '💖', '⭐', '🌈', '💐'];

  const fetchMessages = () => {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => {
        if (data.success) setMessages(data.messages || []);
      });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSelectAuthor = (name, photoOrAvatar) => {
    setAuthor(name);
    setAuthorPhoto(photoOrAvatar);
    localStorage.setItem('guestbook_author', name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: author.trim() || 'Un proche bienveillant',
          text: text.trim(),
          emoji
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        setText('');
        setStatusMsg("Mot doux déposé dans la capsule d'amour ! 💖");
        fetchMessages();
        setTimeout(() => setStatusMsg(''), 3500);
      }
    } catch (err) {
      console.error("Error sending message", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMessage = async (id, authorName) => {
    if (!window.confirm(`Supprimer ce message de ${authorName || 'ce proche'} ?`)) return;

    try {
      const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setStatusMsg("Message supprimé.");
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error("Error deleting message", err);
    }
  };

  return (
    <div className="px-5 space-y-5 pb-8">
      {/* Header Banner */}
      <div className="glass-card-pink rounded-3xl p-5 border border-blush-200/90 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blush-600">
              Capsule d'Amour 💌
            </span>
            <h2 className="font-serif text-xl font-extrabold text-slate-800">
              Livre d'or & Mots Doux
            </h2>
            <p className="text-xs text-rose-500 font-medium">
              Laisse un mot d'amour et de tendresse pour Liza, Clément et leur petite fille !
            </p>
          </div>
          <span className="text-3xl">💌</span>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-blush-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow animate-bounce flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Message Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 shadow-sm border border-rose-100 space-y-3.5">
        <h3 className="font-serif text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>Écrire un mot doux</span>
        </h3>

        {/* Participant Selector */}
        <ParticipantSelector
          selectedName={author}
          onSelect={handleSelectAuthor}
          label="Qui écrit le mot doux ?"
        />

        <div>
          <textarea
            rows="3"
            required
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Ton message d'amour, tes vœux de bonheur, tes encouragements..."
            className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/20 focus:outline-none focus:ring-2 focus:ring-blush-400 resize-none"
          ></textarea>
        </div>

        {/* Emoji Selector & Submit */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {emojiList.map(em => (
              <button
                type="button"
                key={em}
                onClick={() => setEmoji(em)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-transform cursor-pointer ${
                  emoji === em ? 'bg-blush-500 text-white scale-110 shadow' : 'bg-rose-50 hover:bg-rose-100'
                }`}
              >
                {em}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="bg-blush-500 hover:bg-blush-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5 disabled:opacity-50 transition-all flex-shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Déposer</span>
          </button>
        </div>
      </form>

      {/* Wall of Notes with Delete Button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-slate-800 flex items-center gap-2">
            <span>💖 Les Mots de la Famille ({messages.length})</span>
          </h3>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-3xl border border-rose-100 p-6 space-y-2">
            <span className="text-3xl">💌</span>
            <p className="text-xs font-bold text-slate-700">La capsule d'amour est encore vide</p>
            <p className="text-[11px] text-slate-400">Sois le premier à laisser un mot doux à la petite merveille !</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {messages.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-4 shadow-2xs border border-rose-100/90 space-y-2 relative group hover:border-blush-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{m.emoji || '💖'}</span>
                    <p className="font-bold text-xs text-slate-800">{m.author}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(m.createdAt).toLocaleDateString('fr-FR')}
                    </span>

                    {/* Delete message button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(m.id, m.author)}
                      className="text-slate-300 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="Supprimer ce mot doux"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-7 font-serif italic">
                  « {m.text} »
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
