import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Info & Config
app.get('/api/ping', (req, res) => {
  res.status(200).json({ success: true, status: 'awake', timestamp: new Date().toISOString() });
});

// Self-ping toutes les 8 minutes pour garder Render 100% éveillé et éliminer le temps de chargement
setInterval(() => {
  fetch('https://bebe-liza-clement-m85i.onrender.com/api/ping')
    .then(res => res.json())
    .then(d => console.log('[KeepAlive] Server pinged successfully:', d.timestamp))
    .catch(err => console.log('[KeepAlive] Ping info:', err.message));
}, 8 * 60 * 1000);

app.get('/api/config', (req, res) => {
  try {
    const config = db.getConfig();
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/database/dump', (req, res) => {
  try {
    const raw = db.getDatabaseDump();
    res.json({ success: true, data: raw });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/config/verify-pin', (req, res) => {
  try {
    const { pin } = req.body;
    const isValid = db.verifyParentPin(pin);
    if (!isValid) {
      return res.status(401).json({ success: false, error: "Code d'accès incorrect." });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/config/change-pin', (req, res) => {
  try {
    const { oldPin, newPin } = req.body;
    const result = db.changeParentPin(oldPin, newPin);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.json({ success: true, message: "Code secret modifié avec succès !" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/config/logo', (req, res) => {
  try {
    const { photo } = req.body;
    const customLogo = db.updateCustomLogo(photo);
    res.json({ success: true, customLogo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Daily Fact
app.get('/api/daily-fact', (req, res) => {
  try {
    const fact = db.getDailyFact();
    res.json({ success: true, fact });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fruits Progress
app.get('/api/fruits', (req, res) => {
  try {
    const fruits = db.getFruitsData();
    res.json({ success: true, fruits });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Participants Endpoints
app.get('/api/participants', (req, res) => {
  try {
    const participants = db.getParticipants();
    res.json({ success: true, participants });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/participants', (req, res) => {
  try {
    const { name, role, avatar, photo } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Le prénom est requis." });
    }
    const participants = db.addParticipant({
      name: name.trim(),
      role: role || "Proche",
      avatar: avatar || "🌸",
      photo: photo || null
    });
    res.json({ success: true, participants });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/participants/:id/photo', (req, res) => {
  try {
    const { photo } = req.body;
    const participants = db.updateParticipantPhoto(req.params.id, photo);
    res.json({ success: true, participants });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/participants/:id', (req, res) => {
  try {
    const participants = db.deleteParticipant(req.params.id);
    res.json({ success: true, participants });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Predictions Endpoints
app.get('/api/predictions', (req, res) => {
  try {
    const data = db.getPredictions();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/predictions', (req, res) => {
  try {
    const { author, avatar, photo, date, time, weightG, sizeCm, nameGuess, hairColor, eyeColor, comment } = req.body;
    if (!author || !date || !weightG || !sizeCm) {
      return res.status(400).json({ success: false, error: "Veuillez remplir tous les champs obligatoires." });
    }
    const newPrediction = db.addPrediction({
      author,
      avatar: avatar || "🌸",
      photo: photo || null,
      date,
      time: time || "12:00",
      weightG: Number(weightG),
      sizeCm: Number(sizeCm),
      nameGuess: nameGuess || "",
      hairColor: hairColor || "Châtains",
      eyeColor: eyeColor || "Marrons",
      comment: comment || ""
    });
    res.json({ success: true, prediction: newPrediction });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/predictions/:id', (req, res) => {
  try {
    const data = db.deletePrediction(req.params.id);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/quiz/votes/:voter', (req, res) => {
  try {
    const data = db.deleteQuizVotesByVoter(req.params.voter);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: Set Birth Details
app.post('/api/birth-result', (req, res) => {
  try {
    const { date, time, weightG, sizeCm, name, hairColor, eyeColor, photo, secretCode } = req.body;
    // Simple protection code or direct validation
    if (!date || !weightG || !sizeCm) {
      return res.status(400).json({ success: false, error: "Informations de naissance incomplètes." });
    }
    const result = db.setActualBirth({
      date,
      time: time || "12:00",
      weightG: Number(weightG),
      sizeCm: Number(sizeCm),
      name: name || "Bébé",
      hairColor: hairColor || "Châtains",
      eyeColor: eyeColor || "Marrons",
      photo: photo || null
    });
    const updated = db.getPredictions();
    res.json({ success: true, actualBirth: result, leaderboard: updated.predictions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/birth-result/reset', (req, res) => {
  try {
    db.resetActualBirth();
    res.json({ success: true, message: "Mode naissance réinitialisé." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Quiz Endpoints
app.get('/api/quiz/questions', (req, res) => {
  try {
    const questions = db.getQuizQuestions();
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/quiz/results', (req, res) => {
  try {
    const aggregates = db.getQuizAggregates();
    res.json({ success: true, ...aggregates });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/quiz/vote', (req, res) => {
  try {
    const { questionId, voter, choice } = req.body;
    if (!questionId || !choice) {
      return res.status(400).json({ success: false, error: "Données de vote manquantes." });
    }
    const updated = db.addQuizVote({
      questionId: Number(questionId),
      voter: voter || "Anonyme",
      choice // "Liza" or "Clément"
    });
    res.json({ success: true, ...updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/quiz/finish', (req, res) => {
  try {
    const { voter } = req.body;
    const updated = db.finishQuiz(voter);
    res.json({ success: true, ...updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mots Croisés & Fléchés Quotidiens (Points & Podium Évolutif)
app.get('/api/crosswords/daily', (req, res) => {
  try {
    const grid = db.getDailyCrosswordGrid(req.query.date);
    const leaderboards = db.getCrosswordLeaderboards(req.query.date);
    res.json({ success: true, grid, ...leaderboards });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/crosswords/leaderboard', (req, res) => {
  try {
    const leaderboards = db.getCrosswordLeaderboards(req.query.date);
    res.json({ success: true, ...leaderboards });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/crosswords/submit', (req, res) => {
  try {
    const { playerName, timeSeconds, timeFormatted, correctCount, totalWords, theme, date } = req.body;
    if (!playerName) {
      return res.status(400).json({ success: false, error: "Nom du joueur requis." });
    }
    const result = db.submitCrosswordScore({
      playerName,
      timeSeconds,
      timeFormatted,
      correctCount,
      totalWords,
      theme,
      date
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/crosswords/sync', (req, res) => {
  try {
    const { scores } = req.body;
    const leaderboards = db.syncCrosswordScores(scores || []);
    res.json({ success: true, ...leaderboards });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/crosswords/scores/:id', (req, res) => {
  try {
    const leaderboards = db.deleteCrosswordScore(req.params.id);
    res.json({ success: true, ...leaderboards });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Messages / Livre d'Or
app.get('/api/messages', (req, res) => {
  try {
    const messages = db.getMessages();
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/messages', (req, res) => {
  try {
    const { author, text, emoji } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: "Le message ne peut pas être vide." });
    }
    const newMsg = db.addMessage({ author, text, emoji });
    res.json({ success: true, message: newMsg });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/messages/:id', (req, res) => {
  try {
    const messages = db.deleteMessage(req.params.id);
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sondages & Hésitations Endpoints
app.get('/api/polls', (req, res) => {
  try {
    const polls = db.getPolls();
    res.json({ success: true, polls });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/polls', (req, res) => {
  try {
    const { title, category, description, options, multiple, secretCode } = req.body;
    if (!db.verifyParentPin(secretCode)) {
      return res.status(403).json({ success: false, error: "Code d'accès réservé aux parents." });
    }
    if (!title || !options || options.length < 2) {
      return res.status(400).json({ success: false, error: "Titre et au moins 2 options requis." });
    }
    const polls = db.addPoll({ title, category, description, multiple, options });
    res.json({ success: true, polls });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/polls/:id/vote', (req, res) => {
  try {
    const { optionId, voter } = req.body;
    const polls = db.votePoll(req.params.id, optionId, voter);
    if (!polls) return res.status(404).json({ success: false, error: "Sondage non trouvé" });
    res.json({ success: true, polls });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/polls/:id', (req, res) => {
  try {
    const polls = db.deletePoll(req.params.id);
    res.json({ success: true, polls });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Checklist Achats Endpoints
app.get('/api/checklists/purchases', (req, res) => {
  try {
    const data = db.getPurchases();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/checklists/purchases/:id/toggle', (req, res) => {
  try {
    const data = db.togglePurchase(req.params.id);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/checklists/purchases', (req, res) => {
  try {
    const { name, category, note, secretCode } = req.body;
    if (!db.verifyParentPin(secretCode)) {
      return res.status(403).json({ success: false, error: "Code d'accès réservé aux parents." });
    }
    if (!name) return res.status(400).json({ success: false, error: "Nom de l'article requis." });
    const data = db.addPurchase({ name, category, note });
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/checklists/purchases/:id', (req, res) => {
  try {
    const data = db.deletePurchase(req.params.id);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/checklists/purchases/categories', (req, res) => {
  try {
    const { category } = req.body;
    if (!category) return res.status(400).json({ success: false, error: "Nom de catégorie requis." });
    const data = db.addPurchaseCategory(category);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/checklists/purchases/categories/:category', (req, res) => {
  try {
    const data = db.deletePurchaseCategory(decodeURIComponent(req.params.category));
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Checklist Valise Maternité Endpoints
app.get('/api/checklists/maternity', (req, res) => {
  try {
    const data = db.getMaternityBag();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/checklists/maternity/:id/toggle', (req, res) => {
  try {
    const data = db.toggleMaternityItem(req.params.id);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/checklists/maternity', (req, res) => {
  try {
    const { name, category, secretCode } = req.body;
    if (!db.verifyParentPin(secretCode)) {
      return res.status(403).json({ success: false, error: "Code d'accès réservé aux parents." });
    }
    if (!name) return res.status(400).json({ success: false, error: "Nom de l'article requis." });
    const data = db.addMaternityItem({ name, category });
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Appointments / Calendrier Endpoints
app.get('/api/appointments', (req, res) => {
  try {
    const appointments = db.getAppointments();
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/appointments', (req, res) => {
  try {
    const { title, date, time, location, notes, secretCode } = req.body;
    if (!db.verifyParentPin(secretCode)) {
      return res.status(403).json({ success: false, error: "Code d'accès réservé aux parents." });
    }
    if (!title || !date) {
      return res.status(400).json({ success: false, error: "Titre et date requis pour le rendez-vous." });
    }
    const appointments = db.addAppointment({ title, date, time, location, notes });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/appointments/:id/toggle', (req, res) => {
  try {
    const appointments = db.toggleAppointment(req.params.id);
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/appointments/:id', (req, res) => {
  try {
    const { secretCode } = req.query;
    if (secretCode !== '0812') {
      return res.status(403).json({ success: false, error: "Code d'accès réservé aux parents (0812)." });
    }
    const appointments = db.deleteAppointment(req.params.id);
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve Frontend Static Build
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static build files (HTML is never cached so new builds show instantly)
app.use(express.static(path.join(__dirname, '../frontend/dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✨ Serveur Bébé Liza & Clément démarré sur http://localhost:${PORT}`);
});
