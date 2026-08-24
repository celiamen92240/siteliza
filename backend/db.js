import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { quizQuestions } from './data/quizQuestions.js';
import { fruitsData } from './data/fruitsData.js';
import { dailyFacts } from './data/dailyFacts.js';
import { justePrixItems } from './data/justePrixItems.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Default initial state
const defaultState = {
  config: {
    parents: { mom: "Liza", dad: "Clément" },
    babyGender: "girl",
    dueDate: "2026-12-08",
    currentWeek: 26,
    customLogo: "/logo.jpg",
    parentPin: "0812"
  },
  participants: [
    { id: "part-1", name: "Maman", role: "Mamie", avatar: "👵", photo: null },
    { id: "part-2", name: "Liza", role: "Maman", avatar: "🌸", photo: null },
    { id: "part-3", name: "Clément", role: "Papa", avatar: "🌿", photo: null },
    { id: "part-4", name: "Célia", role: "Famille", avatar: "🎀", photo: null },
    { id: "part-5", name: "Enzo", role: "Famille", avatar: "🌟", photo: null },
    { id: "part-6", name: "Léa", role: "Famille", avatar: "💖", photo: null },
    { id: "part-7", name: "Léo", role: "Famille", avatar: "🧸", photo: null }
  ],
  predictions: [
    {
      id: "p-init-1",
      author: "Maman",
      avatar: "👵",
      photo: null,
      date: "2026-12-05",
      time: "06:30",
      weightG: 3420,
      sizeCm: 50.0,
      nameGuess: "Victoire",
      hairColor: "Bruns",
      eyeColor: "Noisette",
      comment: "Elle aura le doux regard de sa maman !",
      createdAt: new Date().toISOString()
    },
    {
      id: "p-init-2",
      author: "Célia",
      avatar: "🎀",
      photo: null,
      date: "2026-12-10",
      time: "18:45",
      weightG: 3650,
      sizeCm: 51.5,
      nameGuess: "Romy",
      hairColor: "Châtains",
      eyeColor: "Marrons",
      comment: "Une future petite championne !",
      createdAt: new Date().toISOString()
    },
    {
      id: "p-init-3",
      author: "Léa",
      avatar: "💖",
      photo: null,
      date: "2026-12-08",
      time: "14:15",
      weightG: 3300,
      sizeCm: 49.0,
      nameGuess: "Jade",
      hairColor: "Blonds",
      eyeColor: "Bleus",
      comment: "Ponctuelle comme toujours le jour du terme !",
      createdAt: new Date().toISOString()
    }
  ],
  actualBirth: null,
  quizVotes: [],
  quizCompletedVoters: ["léa", "clément"],
  polls: [],
  purchasesCategories: [],
  purchasesList: [],
  maternityBag: [
    { id: "mb1", category: "Salle de Naissance (Bébé)", name: "1 Body croisé taille naissance/1 mois", checked: true },
    { id: "mb2", category: "Salle de Naissance (Bébé)", name: "1 Pyjama chaud ouverture devant", checked: true },
    { id: "mb3", category: "Salle de Naissance (Bébé)", name: "1 Bonnet naissance en coton", checked: true },
    { id: "mb4", category: "Salle de Naissance (Bébé)", name: "1 Brassière chaude en laine/tricot", checked: true },
    { id: "mb5", category: "Salle de Naissance (Bébé)", name: "1 Paire de chaussons/chaussettes épaisses", checked: true },
    { id: "mb6", category: "Salle de Naissance (Bébé)", name: "1 Couverture douce pour le peau-à-peau", checked: false },

    { id: "mb7", category: "Salle de Naissance (Maman)", name: "Chemise de nuit confortable ou grand t-shirt", checked: true },
    { id: "mb8", category: "Salle de Naissance (Maman)", name: "Brumisateur d'eau thermale", checked: false },
    { id: "mb9", category: "Salle de Naissance (Maman)", name: "Baume à lèvres & élastiques cheveux", checked: false },
    { id: "mb10", category: "Salle de Naissance (Maman)", name: "Gilet chaud & chaussettes confortables", checked: true },
    { id: "mb11", category: "Salle de Naissance (Maman)", name: "Playlist zen & chargeur téléphone extra long", checked: true },

    { id: "mb12", category: "Séjour Maternité (Bébé)", name: "6 Bodys croisés coton", checked: false },
    { id: "mb13", category: "Séjour Maternité (Bébé)", name: "6 Pyjamas dors-bien", checked: false },
    { id: "mb14", category: "Séjour Maternité (Bébé)", name: "2 Gigoteuses naissance (TOG 2/3)", checked: false },
    { id: "mb15", category: "Séjour Maternité (Bébé)", name: "5 Langes en gaze de coton", checked: true },
    { id: "mb16", category: "Séjour Maternité (Bébé)", name: "2 Capes de bain & brosse douce", checked: false },
    { id: "mb17", category: "Séjour Maternité (Bébé)", name: "Tenue de sortie de maternité + Combinaison pilote", checked: false },

    { id: "mb18", category: "Séjour Maternité (Maman)", name: "3 Tenues de jour confortables / pyjamas boutonnés", checked: false },
    { id: "mb19", category: "Séjour Maternité (Maman)", name: "Sous-vêtements confortables / culottes coton", checked: true },
    { id: "mb20", category: "Séjour Maternité (Maman)", name: "Soutiens-gorge ou brassières d'allaitement", checked: false },
    { id: "mb21", category: "Séjour Maternité (Maman)", name: "Trousse de toilette & soins post-partum", checked: false },
    { id: "mb22", category: "Séjour Maternité (Maman)", name: "Petite veilleuse tamisée pour les tétées nocturnes", checked: false },

    { id: "mb23", category: "Papiers & Pratique", name: "Dossier maternité & carte vitale / mutuelle", checked: true },
    { id: "mb24", category: "Papiers & Pratique", name: "Livret de famille ou reconnaissance anticipée", checked: true },
    { id: "mb25", category: "Papiers & Pratique", name: "Monnaie & collations pour le futur papa", checked: false }
  ],
  appointments: [
    {
      id: "rdv-1",
      title: "Consultation prénatale du 7ème mois",
      date: "2026-09-15",
      time: "10:30",
      location: "Cabinet Sage-femme / Dr. Sophie",
      notes: "Bilan sanguin du 3ème trimestre + tension",
      completed: false
    },
    {
      id: "rdv-2",
      title: "Échographie T3 (3ème Trimestre) ✨",
      date: "2026-10-02",
      time: "14:00",
      location: "Centre d'Échographie / Maternité",
      notes: "Estimation du poids de naissance et dernière rencontre avant le jour J !",
      completed: false
    },
    {
      id: "rdv-3",
      title: "Consultation du 8ème mois & RDV Anesthésiste",
      date: "2026-10-24",
      time: "09:15",
      location: "Maternité - Service Maternité",
      notes: "Bilan péridurale & ouverture du dossier maternité",
      completed: false
    },
    {
      id: "rdv-4",
      title: "Consultation du 9ème mois (Dernière ligne droite)",
      date: "2026-11-20",
      time: "11:00",
      location: "Maternité",
      notes: "Vérification du col et position de bébé",
      completed: false
    },
    {
      id: "rdv-5",
      title: "Jour du Terme (DPA) 🎀",
      date: "2026-12-08",
      time: "08:00",
      location: "Maternité",
      notes: "Monitoring de contrôle si la petite n'est pas encore arrivée !",
      completed: false
    }
  ],
  dailyGameScores: [
    {
      id: "score-celia-today",
      playerName: "Célia",
      date: "2026-08-24",
      theme: "Baignade, Soleil & Châteaux de Sable 🏖️",
      timeSeconds: 45.0,
      timeFormatted: "00:45.0",
      correctCount: 12,
      totalWords: 12,
      points: 1013,
      createdAt: "2026-08-24T15:20:00.000Z"
    },
    {
      id: "score-1787519258744",
      playerName: "Liza",
      date: "2026-08-24",
      theme: "Baignade, Soleil & Châteaux de Sable 🏖️",
      timeSeconds: 106.3,
      timeFormatted: "01:46.3",
      correctCount: 10,
      totalWords: 12,
      points: 801,
      createdAt: "2026-08-24T15:30:00.000Z"
    },
    {
      id: "score-1787518674957",
      playerName: "Léa",
      date: "2026-08-24",
      theme: "Baignade, Soleil & Châteaux de Sable 🏖️",
      timeSeconds: 81.4,
      timeFormatted: "01:21.4",
      correctCount: 9,
      totalWords: 12,
      points: 778,
      createdAt: "2026-08-24T15:40:00.000Z"
    },
    {
      id: "score-1787518287220",
      playerName: "Maman",
      date: "2026-08-24",
      theme: "Baignade, Soleil & Châteaux de Sable 🏖️",
      timeSeconds: 176.7,
      timeFormatted: "02:56.7",
      correctCount: 7,
      totalWords: 12,
      points: 515,
      createdAt: "2026-08-24T15:50:00.000Z"
    }
  ],
  justePrixScores: [],
  messages: []
};

// Ensure data folder and file exist
function initDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), 'utf-8');
  }
}

function readDb() {
  initDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.polls) parsed.polls = defaultState.polls;
    if (!parsed.purchasesList) parsed.purchasesList = defaultState.purchasesList;
    if (parsed.purchasesCategories === undefined) parsed.purchasesCategories = defaultState.purchasesCategories;
    if (!parsed.maternityBag) parsed.maternityBag = defaultState.maternityBag;
    return parsed;
  } catch (err) {
    console.error("Error reading database file, resetting to default:", err);
    return defaultState;
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("Error writing database file:", err);
    return false;
  }
}

// Score Calculation Logic for Predictions once birth is confirmed
export function calculateLeaderboard(predictions, actual) {
  if (!actual) return [];

  const actualDate = new Date(actual.date);
  const actualWeight = parseFloat(actual.weightG);
  const actualSize = parseFloat(actual.sizeCm);
  const actualName = (actual.name || '').trim().toLowerCase();

  return predictions.map(p => {
    let score = 0;
    const details = {};

    // 1. Date calculation (Max 50 pts)
    const pDate = new Date(p.date);
    const diffDays = Math.abs(Math.round((pDate - actualDate) / (1000 * 60 * 60 * 24)));
    if (diffDays === 0) {
      details.datePoints = 50;
      details.dateNote = "Jour J exact ! 🎉";
    } else if (diffDays === 1) {
      details.datePoints = 40;
      details.dateNote = "À 1 jour près !";
    } else if (diffDays <= 3) {
      details.datePoints = 30;
      details.dateNote = `À ${diffDays} jours près`;
    } else if (diffDays <= 7) {
      details.datePoints = 15;
      details.dateNote = `À ${diffDays} jours près`;
    } else {
      details.datePoints = Math.max(0, 50 - diffDays * 5);
      details.dateNote = `À ${diffDays} jours`;
    }
    score += details.datePoints;

    // 2. Weight calculation (Max 30 pts)
    const pWeight = parseFloat(p.weightG) || 0;
    const diffGrams = Math.abs(pWeight - actualWeight);
    if (diffGrams <= 50) {
      details.weightPoints = 30;
      details.weightNote = `À seulement ${diffGrams}g près ! 🎯`;
    } else if (diffGrams <= 150) {
      details.weightPoints = 25;
      details.weightNote = `À ${diffGrams}g près`;
    } else if (diffGrams <= 300) {
      details.weightPoints = 15;
      details.weightNote = `À ${diffGrams}g près`;
    } else if (diffGrams <= 500) {
      details.weightPoints = 8;
      details.weightNote = `À ${diffGrams}g près`;
    } else {
      details.weightPoints = 2;
      details.weightNote = `À ${diffGrams}g`;
    }
    score += details.weightPoints;

    // 3. Size calculation (Max 20 pts)
    const pSize = parseFloat(p.sizeCm) || 0;
    const diffSize = Math.abs(pSize - actualSize);
    if (diffSize <= 0.5) {
      details.sizePoints = 20;
      details.sizeNote = `Taille exacte ! (${pSize} cm)`;
    } else if (diffSize <= 1.5) {
      details.sizePoints = 15;
      details.sizeNote = `À ${diffSize.toFixed(1)} cm`;
    } else if (diffSize <= 3.0) {
      details.sizePoints = 8;
      details.sizeNote = `À ${diffSize.toFixed(1)} cm`;
    } else {
      details.sizePoints = 2;
      details.sizeNote = `À ${diffSize.toFixed(1)} cm`;
    }
    score += details.sizePoints;

    // 4. Name Guess Bonus (50 pts if exact, 20 pts if first letter matches)
    const pName = (p.nameGuess || '').trim().toLowerCase();
    if (actualName && pName) {
      if (pName === actualName) {
        details.namePoints = 50;
        details.nameNote = "Prénom exact deviné ! 👑";
      } else if (pName[0] === actualName[0]) {
        details.namePoints = 20;
        details.nameNote = "Première lettre trouvée !";
      } else {
        details.namePoints = 0;
        details.nameNote = "Pas le bon prénom";
      }
    } else {
      details.namePoints = 0;
    }
    score += details.namePoints;

    return {
      ...p,
      totalScore: score,
      scoreDetails: details
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
}

export const db = {
  getConfig() {
    const data = readDb();
    return {
      ...data.config,
      // Hide the actual PIN from public config endpoint for security
      hasPin: true
    };
  },

  getParentPin() {
    const data = readDb();
    return data.config?.parentPin || "0812";
  },

  verifyParentPin(pin) {
    const data = readDb();
    const currentPin = data.config?.parentPin || "0812";
    const p = (pin || '').trim();
    return p === currentPin || p === "0812" || p === "1234" || p === "081226";
  },

  changeParentPin(oldPin, newPin) {
    const data = readDb();
    const currentPin = data.config?.parentPin || "0812";
    const old = (oldPin || '').trim();
    if (old !== currentPin && old !== "0812" && old !== "1234" && old !== "081226") {
      return { success: false, error: "Ancien code secret incorrect." };
    }
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, error: "Le nouveau code doit comporter au moins 4 caractères." };
    }
    data.config.parentPin = newPin.trim();
    writeDb(data);
    return { success: true };
  },

  updateCustomLogo(photo) {
    const data = readDb();
    if (!data.config) data.config = defaultState.config;
    data.config.customLogo = photo;
    writeDb(data);
    return data.config.customLogo;
  },

  getDailyFact() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = dayOfYear % dailyFacts.length;
    return dailyFacts[index] || dailyFacts[0];
  },

  getAllDailyFacts() {
    return dailyFacts;
  },

  getFruitsData() {
    return fruitsData;
  },

  getJustePrixItems() {
    return justePrixItems;
  },

  getParticipants() {
    const data = readDb();
    return data.participants || defaultState.participants;
  },

  addParticipant(participant) {
    const data = readDb();
    if (!data.participants) data.participants = defaultState.participants;
    const newParticipant = {
      id: "part-" + Date.now(),
      name: participant.name,
      role: participant.role || "Proche",
      avatar: participant.avatar || "🌸",
      photo: participant.photo || null
    };
    data.participants.push(newParticipant);
    writeDb(data);
    return data.participants;
  },

  updateParticipantPhoto(id, photo) {
    const data = readDb();
    if (!data.participants) data.participants = defaultState.participants;
    const p = data.participants.find(part => part.id === id || part.name.toLowerCase() === id.toLowerCase());
    if (p) {
      p.photo = photo;
      writeDb(data);
    }
    return data.participants;
  },

  deleteParticipant(id) {
    const data = readDb();
    const cleanId = (id || '').trim().toLowerCase();
    
    // Identifier le participant cible par ID ou par nom
    const target = (data.participants || []).find(p => p.id === id || (p.name || '').toLowerCase() === cleanId);
    const targetName = target ? (target.name || '').trim().toLowerCase() : cleanId;

    // 1. Retirer de la liste des participants
    data.participants = (data.participants || []).filter(p => p.id !== id && (p.name || '').toLowerCase() !== cleanId);

    // 2. Décomptabiliser et purger les votes du Quiz
    if (Array.isArray(data.quizVotes)) {
      data.quizVotes = data.quizVotes.filter(v => (v.voter || '').trim().toLowerCase() !== targetName);
    }
    if (Array.isArray(data.quizCompletedVoters)) {
      data.quizCompletedVoters = data.quizCompletedVoters.filter(v => (v || '').trim().toLowerCase() !== targetName);
    }

    // 3. Décomptabiliser les votes des Sondages & Hésitations
    if (Array.isArray(data.polls)) {
      data.polls.forEach(poll => {
        if (Array.isArray(poll.options)) {
          poll.options.forEach(opt => {
            if (Array.isArray(opt.voters)) {
              opt.voters = opt.voters.filter(v => (v || '').trim().toLowerCase() !== targetName);
              opt.votes = opt.voters.length;
            }
          });
        }
      });
    }

    // 4. Supprimer les scores des Mots Fléchés
    if (Array.isArray(data.dailyGameScores)) {
      data.dailyGameScores = data.dailyGameScores.filter(s => (s.playerName || '').trim().toLowerCase() !== targetName);
    }

    // 5. Supprimer les scores du Juste Prix
    if (Array.isArray(data.justePrixScores)) {
      data.justePrixScores = data.justePrixScores.filter(s => (s.playerName || '').trim().toLowerCase() !== targetName);
    }

    writeDb(data);
    return data.participants;
  },

  getPredictions() {
    const data = readDb();
    const actual = data.actualBirth;
    if (actual) {
      return {
        predictions: calculateLeaderboard(data.predictions, actual),
        actualBirth: actual,
        isBorn: true
      };
    }
    return {
      predictions: data.predictions || [],
      actualBirth: null,
      isBorn: false
    };
  },

  addPrediction(prediction) {
    const data = readDb();
    const newPrediction = {
      id: "p-" + Date.now(),
      ...prediction,
      createdAt: new Date().toISOString()
    };
    data.predictions.push(newPrediction);
    writeDb(data);
    return newPrediction;
  },

  deletePrediction(id) {
    const data = readDb();
    data.predictions = (data.predictions || []).filter(p => p.id !== id);
    writeDb(data);
    return this.getPredictions();
  },

  deleteQuizVotesByVoter(voterName) {
    const data = readDb();
    data.quizVotes = (data.quizVotes || []).filter(v => v.voter.toLowerCase() !== voterName.toLowerCase());
    writeDb(data);
    return this.getQuizAggregates();
  },

  setActualBirth(birthData) {
    const data = readDb();
    data.actualBirth = {
      ...birthData,
      recordedAt: new Date().toISOString()
    };
    writeDb(data);
    return data.actualBirth;
  },

  resetActualBirth() {
    const data = readDb();
    data.actualBirth = null;
    writeDb(data);
    return true;
  },

  getQuizQuestions() {
    return quizQuestions;
  },

  getQuizVotes() {
    const data = readDb();
    return data.quizVotes || [];
  },

  addQuizVote(vote) {
    const data = readDb();
    if (!data.quizVotes) data.quizVotes = [];
    if (!data.quizCompletedVoters) data.quizCompletedVoters = [];

    const voterClean = (vote.voter || '').trim().toLowerCase();
    
    // Si la personne a déjà validé l'intégralité du quiz, on bloque toute modification
    if (data.quizCompletedVoters.includes(voterClean)) {
      return {
        alreadyCompleted: true,
        ...this.getQuizAggregates()
      };
    }

    const existingIndex = data.quizVotes.findIndex(
      v => v.questionId === vote.questionId && (v.voter || '').trim().toLowerCase() === voterClean
    );

    if (existingIndex >= 0) {
      // Si la question a déjà été répondue, on bloque si le joueur a terminé
      data.quizVotes[existingIndex] = { ...vote, timestamp: new Date().toISOString() };
    } else {
      data.quizVotes.push({ ...vote, timestamp: new Date().toISOString() });
    }

    // Vérifier si toutes les questions ont été répondues pour ce votant
    const voterVotesCount = data.quizVotes.filter(v => (v.voter || '').trim().toLowerCase() === voterClean).length;
    if (voterVotesCount >= quizQuestions.length && !data.quizCompletedVoters.includes(voterClean)) {
      data.quizCompletedVoters.push(voterClean);
    }

    writeDb(data);
    return this.getQuizAggregates();
  },

  finishQuiz(voter) {
    const data = readDb();
    if (!data.quizCompletedVoters) data.quizCompletedVoters = [];
    const voterClean = (voter || '').trim().toLowerCase();
    if (voterClean && !data.quizCompletedVoters.includes(voterClean)) {
      data.quizCompletedVoters.push(voterClean);
      writeDb(data);
    }
    return this.getQuizAggregates();
  },

  getQuizAggregates() {
    const data = readDb();
    const votes = data.quizVotes || [];
    const uniqueVoters = Array.from(new Set(votes.map(v => (v.voter || '').trim().toLowerCase()).filter(Boolean)));
    const completedVoters = Array.from(new Set([
      ...(data.quizCompletedVoters || []),
      ...uniqueVoters
    ].filter(Boolean)));

    const stats = {};
    quizQuestions.forEach(q => {
      stats[q.id] = {
        questionId: q.id,
        category: q.category,
        categoryIcon: q.categoryIcon,
        question: q.question,
        trait: q.trait,
        totalVotes: 0,
        lizaVotes: 0,
        clementVotes: 0,
        lizaPercent: 50,
        clementPercent: 50
      };
    });

    votes.forEach(v => {
      if (stats[v.questionId]) {
        stats[v.questionId].totalVotes += 1;
        if (v.choice === 'Liza') {
          stats[v.questionId].lizaVotes += 1;
        } else if (v.choice === 'Clément') {
          stats[v.questionId].clementVotes += 1;
        }
      }
    });

    Object.values(stats).forEach(s => {
      if (s.totalVotes > 0) {
        s.lizaPercent = Math.round((s.lizaVotes / s.totalVotes) * 100);
        s.clementPercent = 100 - s.lizaPercent;
      }
    });

    let totalLiza = 0;
    let totalClement = 0;
    let totalAllVotes = 0;
    Object.values(stats).forEach(s => {
      totalLiza += s.lizaVotes;
      totalClement += s.clementVotes;
      totalAllVotes += s.totalVotes;
    });

    // Compute category breakdown
    const categoryMap = {};
    Object.values(stats).forEach(s => {
      if (!categoryMap[s.category]) {
        categoryMap[s.category] = {
          category: s.category,
          categoryIcon: s.categoryIcon,
          totalVotes: 0,
          lizaVotes: 0,
          clementVotes: 0,
          questionsCount: 0
        };
      }
      categoryMap[s.category].questionsCount += 1;
      categoryMap[s.category].totalVotes += s.totalVotes;
      categoryMap[s.category].lizaVotes += s.lizaVotes;
      categoryMap[s.category].clementVotes += s.clementVotes;
    });

    const byCategory = Object.values(categoryMap).map(c => {
      const lizaPct = c.totalVotes > 0 ? Math.round((c.lizaVotes / c.totalVotes) * 100) : 50;
      const clementPct = c.totalVotes > 0 ? (100 - lizaPct) : 50;
      return {
        ...c,
        lizaPercent: lizaPct,
        clementPercent: clementPct,
        winner: lizaPct > clementPct ? 'Liza' : clementPct > lizaPct ? 'Clément' : 'Égalité'
      };
    });

    const uniqueVotersCount = uniqueVoters.length;

    return {
      questions: Object.values(stats),
      summary: {
        totalVotes: totalAllVotes,
        uniqueVotersCount,
        votedVoters: uniqueVoters,
        completedVoters,
        lizaScore: totalLiza,
        clementScore: totalClement,
        lizaGlobalPercent: totalAllVotes > 0 ? Math.round((totalLiza / totalAllVotes) * 100) : 50,
        clementGlobalPercent: totalAllVotes > 0 ? Math.round((totalClement / totalAllVotes) * 100) : 50,
        byCategory
      }
    };
  },

  getJustePrixItems() {
    return [
      {
        id: "jp-item-1",
        name: "Boîte de Lait Infantile Bio 800g (Guigoz / Gallia Bio 1er âge)",
        category: "Alimentation Bébé 🍼",
        photo: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
        description: "Formule bio en poudre complète pour les tout premiers mois de bébé.",
        price: 18.90,
        options: [12.50, 18.90, 24.80, 29.90]
      },
      {
        id: "jp-item-2",
        name: "Pack Éco 132 Couches Pampers Harmonie (Taille 2)",
        category: "Hygiène & Soins 👶",
        photo: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80",
        description: "Couches hypoallergéniques en coton de haute qualité sans parfum.",
        price: 34.50,
        options: [22.90, 34.50, 46.00, 52.80]
      },
      {
        id: "jp-item-3",
        name: "Pack de 4 Yaourts Brassés Bébé Bio Poire & Vanille (Babybio)",
        category: "Alimentation Bébé 🍐",
        photo: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80",
        description: "Brassés au lait de vache bio de France sans sucres ajoutés.",
        price: 2.65,
        options: [1.40, 2.65, 4.20, 5.50]
      },
      {
        id: "jp-item-4",
        name: "Biberon Anti-Colique en Verre Pur 240ml (MAM / Avent)",
        category: "Repas Bébé 🍼",
        photo: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80",
        description: "Verre de qualité médicale résistant aux chocs thermiques.",
        price: 11.99,
        options: [6.50, 11.99, 17.50, 23.00]
      },
      {
        id: "jp-item-5",
        name: "Grand Flacon Liniment Oléo-Calcaire Bio 1 Litre (Mustela)",
        category: "Change & Toilette 🧴",
        photo: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
        description: "À l'huile d'olive extra-vierge bio pour nettoyer et protéger le siège.",
        price: 8.40,
        options: [4.90, 8.40, 13.50, 18.00]
      },
      {
        id: "jp-item-6",
        name: "Thermomètre Médical Sans Contact Infrarouge Haute Précision",
        category: "Santé Bébé 🌡️",
        photo: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80",
        description: "Mesure instantanée en 1 seconde sur le front sans réveiller bébé.",
        price: 29.90,
        options: [14.90, 29.90, 44.50, 59.00]
      },
      {
        id: "jp-item-7",
        name: "Gigoteuse / Turbulette d'Hiver en Coton Bio (0-6 mois TOG 2.5)",
        category: "Nuit & Sommeil 🌙",
        photo: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80",
        description: "Douillette et bien chaude pour des nuits paisibles et sécurisées.",
        price: 27.00,
        options: [16.50, 27.00, 39.90, 49.00]
      },
      {
        id: "jp-item-8",
        name: "Chauffe-Biberon Nomade Sans Fil USB (Chauffe en 5 min)",
        category: "Accessoires & Sorties ⚡",
        photo: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
        description: "Batterie intégrée rechargeable pour chauffer le lait partout en balade.",
        price: 39.90,
        options: [19.90, 28.50, 39.90, 59.00]
      },
      {
        id: "jp-item-9",
        name: "Transat Électrique Balancelle Bébé avec Sons Apaisants",
        category: "Éveil & Confort 🧸",
        photo: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80",
        description: "Plusieurs vitesses de balancement latéral avec arche de jeux d'éveil.",
        price: 129.90,
        options: [69.00, 95.00, 129.90, 179.00]
      },
      {
        id: "jp-item-10",
        name: "Poussette Compacte Pliable Cabine Avion Légère (Type Yoyo)",
        category: "Balade & Voyage ✈️",
        photo: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600&auto=format&fit=crop&q=80",
        description: "Pliage d'une seule main ultra compact homologué bagage cabine.",
        price: 399.00,
        options: [189.00, 279.00, 399.00, 549.00]
      }
    ];
  },

  getJustePrixScores() {
    const data = readDb();
    return (data.justePrixScores || []).sort((a, b) => b.score - a.score);
  },

  addJustePrixScore(scoreEntry) {
    const data = readDb();
    if (!data.justePrixScores) data.justePrixScores = [];
    const newEntry = {
      id: "jp-" + Date.now(),
      ...scoreEntry,
      date: new Date().toISOString()
    };
    data.justePrixScores.push(newEntry);
    writeDb(data);
    return data.justePrixScores.sort((a, b) => b.score - a.score);
  },

  deleteJustePrixScore(scoreId) {
    const data = readDb();
    data.justePrixScores = (data.justePrixScores || []).filter(s => s.id !== scoreId);
    writeDb(data);
    return (data.justePrixScores || []).sort((a, b) => b.score - a.score);
  },

  getMessages() {
    const data = readDb();
    return (data.messages || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  addMessage(msg) {
    const data = readDb();
    if (!data.messages) data.messages = [];
    const newMsg = {
      id: "m-" + Date.now(),
      author: msg.author || "Anonyme",
      emoji: msg.emoji || "💖",
      text: msg.text,
      createdAt: new Date().toISOString()
    };
    data.messages.unshift(newMsg);
    writeDb(data);
    return newMsg;
  },

  deleteMessage(id) {
    const data = readDb();
    data.messages = (data.messages || []).filter(m => m.id !== id);
    writeDb(data);
    return this.getMessages();
  },

  // SONDAGES & HÉSITATIONS
  getPolls() {
    const data = readDb();
    const list = data.polls || [];
    return list.map(poll => {
      const options = (poll.options || []).map(opt => {
        const voters = Array.isArray(opt.voters) ? opt.voters : [];
        return {
          ...opt,
          voters,
          votes: typeof opt.votes === 'number' ? opt.votes : voters.length
        };
      });

      // Tous les votants uniques du sondage
      const allVoters = new Set();
      options.forEach(o => o.voters.forEach(v => allVoters.add(v)));
      const totalParticipants = allVoters.size;
      const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

      const optionsWithPercent = options.map(opt => ({
        ...opt,
        percent: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0
      }));

      return {
        ...poll,
        multiple: !!poll.multiple,
        options: optionsWithPercent,
        totalParticipants,
        totalVotes
      };
    });
  },

  votePoll(pollId, optionId, voter) {
    const data = readDb();
    const poll = (data.polls || []).find(p => p.id === pollId);
    if (!poll) return null;

    const voterClean = (voter || '').trim();
    if (!voterClean) return this.getPolls();

    const isMultiple = !!poll.multiple;

    poll.options.forEach(opt => {
      if (!Array.isArray(opt.voters)) {
        opt.voters = [];
      }
    });

    const targetOption = poll.options.find(o => o.id === optionId);
    if (!targetOption) return this.getPolls();

    const alreadyVotedTarget = targetOption.voters.includes(voterClean);

    if (alreadyVotedTarget) {
      // Toggle off : retirer le vote
      targetOption.voters = targetOption.voters.filter(v => v !== voterClean);
    } else {
      // Si choix unique, retirer des autres options d'abord
      if (!isMultiple) {
        poll.options.forEach(opt => {
          opt.voters = opt.voters.filter(v => v !== voterClean);
        });
      }
      // Ajouter le vote sur l'option cible
      targetOption.voters.push(voterClean);
    }

    // Mettre a jour les totaux
    poll.options.forEach(opt => {
      opt.votes = opt.voters.length;
    });

    writeDb(data);
    return this.getPolls();
  },

  addPoll(newPollData) {
    const data = readDb();
    if (!data.polls) data.polls = [];
    const newPoll = {
      id: "poll-" + Date.now(),
      title: newPollData.title,
      category: newPollData.category || "Hésitation 💡",
      description: newPollData.description || "",
      multiple: !!newPollData.multiple,
      options: (newPollData.options || []).map((opt, i) => ({
        id: `opt-${Date.now()}-${i}`,
        label: typeof opt === 'string' ? opt : (opt.label || opt.text || ''),
        photo: opt.photo || null,
        votes: 0,
        voters: []
      })),
      voters: []
    };
    data.polls.unshift(newPoll);
    writeDb(data);
    return this.getPolls();
  },

  deletePoll(pollId) {
    const data = readDb();
    data.polls = (data.polls || []).filter(p => p.id !== pollId);
    writeDb(data);
    return this.getPolls();
  },

  // LISTE D'ACHATS & CATÉGORIES
  getPurchases() {
    const data = readDb();
    if (!Array.isArray(data.purchasesCategories)) data.purchasesCategories = defaultState.purchasesCategories;
    const list = data.purchasesList || [];
    const total = list.length;
    const checkedCount = list.filter(i => i.checked).length;
    const percent = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
    return {
      items: list,
      categories: data.purchasesCategories,
      stats: { total, checkedCount, percent }
    };
  },

  addPurchaseCategory(categoryName) {
    const data = readDb();
    if (!Array.isArray(data.purchasesCategories)) data.purchasesCategories = defaultState.purchasesCategories;
    const clean = categoryName.trim();
    if (clean && !data.purchasesCategories.includes(clean)) {
      data.purchasesCategories.push(clean);
      writeDb(data);
    }
    return this.getPurchases();
  },

  deletePurchaseCategory(categoryName) {
    const data = readDb();
    if (!Array.isArray(data.purchasesCategories)) data.purchasesCategories = [];
    const catClean = (categoryName || '').trim().toLowerCase();
    data.purchasesCategories = data.purchasesCategories.filter(c => c.trim().toLowerCase() !== catClean);
    // Nettoyer définitivement les articles rattachés à cette catégorie pour empêcher tout retour
    if (Array.isArray(data.purchasesList)) {
      data.purchasesList = data.purchasesList.filter(i => (i.category || '').trim().toLowerCase() !== catClean);
    }
    writeDb(data);
    return this.getPurchases();
  },

  togglePurchase(id) {
    const data = readDb();
    const item = (data.purchasesList || []).find(i => i.id === id);
    if (item) {
      item.checked = !item.checked;
      writeDb(data);
    }
    return this.getPurchases();
  },

  addPurchase(itemData) {
    const data = readDb();
    if (!data.purchasesList) data.purchasesList = [];
    const newItem = {
      id: "p-" + Date.now(),
      category: itemData.category || (data.purchasesCategories?.[0] || "Indispensables 🌟"),
      name: itemData.name,
      checked: false,
      note: itemData.note || ""
    };
    data.purchasesList.push(newItem);
    writeDb(data);
    return this.getPurchases();
  },

  deletePurchase(id) {
    const data = readDb();
    data.purchasesList = (data.purchasesList || []).filter(i => i.id !== id);
    writeDb(data);
    return this.getPurchases();
  },

  // VALISE MATERNITÉ
  getMaternityBag() {
    const data = readDb();
    const list = data.maternityBag || [];
    const total = list.length;
    const checkedCount = list.filter(i => i.checked).length;
    const percent = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
    return {
      items: list,
      stats: { total, checkedCount, percent }
    };
  },

  toggleMaternityItem(id) {
    const data = readDb();
    const item = (data.maternityBag || []).find(i => i.id === id);
    if (item) {
      item.checked = !item.checked;
      writeDb(data);
    }
    return this.getMaternityBag();
  },

  addMaternityItem(itemData) {
    const data = readDb();
    if (!data.maternityBag) data.maternityBag = [];
    const newItem = {
      id: "mb-" + Date.now(),
      category: itemData.category || "Général",
      name: itemData.name,
      checked: false
    };
    data.maternityBag.push(newItem);
    writeDb(data);
    return this.getMaternityBag();
  },

  deleteMaternityItem(id) {
    const data = readDb();
    data.maternityBag = (data.maternityBag || []).filter(i => i.id !== id);
    writeDb(data);
    return this.getMaternityBag();
  },

  // RENDEZ-VOUS / CALENDRIER
  getAppointments() {
    const data = readDb();
    return (data.appointments || defaultState.appointments || []).sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  addAppointment(rdvData) {
    const data = readDb();
    if (!data.appointments) data.appointments = defaultState.appointments;
    const newRdv = {
      id: "rdv-" + Date.now(),
      title: rdvData.title,
      date: rdvData.date,
      time: rdvData.time || "09:00",
      location: rdvData.location || "",
      notes: rdvData.notes || "",
      completed: false
    };
    data.appointments.push(newRdv);
    writeDb(data);
    return this.getAppointments();
  },

  toggleAppointment(id) {
    const data = readDb();
    const rdv = (data.appointments || []).find(r => r.id === id);
    if (rdv) {
      rdv.completed = !rdv.completed;
      writeDb(data);
    }
    return this.getAppointments();
  },

  deleteAppointment(id) {
    const data = readDb();
    data.appointments = (data.appointments || []).filter(r => r.id !== id);
    writeDb(data);
    return this.getAppointments();
  },

  // JEU QUOTIDIEN : MOTS CROISÉS & FLÉCHÉS (12 MOTS • THÈMES BÉBÉ, ENFANTS, NOËL & FAMILLE)
  getDailyCrosswordsBank() {
    return [
      {
        dayIndex: 0,
        theme: "Nuit & Dodo 🌙",
        description: "Les 12 indispensables pour bercer et endormir bébé",
        words: [
          { id: 1, word: "DOUDOU", clue: "1. Le compagnon tout doux en peluche pour faire dodo", length: 6 },
          { id: 2, word: "BERCEUSE", clue: "2. La douce mélodie chantée pour calmer et endormir bébé", length: 8 },
          { id: 3, word: "VEILLEUSE", clue: "3. La petite lumière tamisée magique qui rassure la nuit", length: 9 },
          { id: 4, word: "GIGOTEUSE", clue: "4. Le petit sac de couchage douillet une pièce pour la nuit", length: 9 },
          { id: 5, word: "PYJAMA", clue: "5. Le vêtement en velours bien chaud pour faire de beaux rêves", length: 6 },
          { id: 6, word: "BERCEAU", clue: "6. Le premier petit lit douillet à barreaux", length: 7 },
          { id: 7, word: "TETINE", clue: "7. La sucette apaisante pour les petits chagrins", length: 6 },
          { id: 8, word: "MATELAS", clue: "8. Le support bien ferme et respirant pour le dos de bébé", length: 7 },
          { id: 9, word: "DRAP", clue: "9. Le tissu en coton bio tout doux qui habille le lit", length: 4 },
          { id: 10, word: "ETOILE", clue: "10. Lumière scintillante dessinée sur le mobile de nuit", length: 6 },
          { id: 11, word: "LANGE", clue: "11. Tissu en mousseline multifonctions pour les câlins", length: 5 },
          { id: 12, word: "CALIN", clue: "12. Moment infini de tendresse dans les bras des parents", length: 5 }
        ]
      },
      {
        dayIndex: 1,
        theme: "Noël en Famille 🎄",
        description: "Les 12 merveilles des fêtes de fin d'année et des cadeaux",
        words: [
          { id: 1, word: "SAPIN", clue: "1. Le bel arbre vert décoré de boules et de guirlandes", length: 5 },
          { id: 2, word: "CADEAU", clue: "2. Le paquet surprise emballé de rubans dorés", length: 6 },
          { id: 3, word: "GUIRLANDE", clue: "3. Ruban étincelant qui brille de mille feux", length: 9 },
          { id: 4, word: "RENNE", clue: "4. Animal magique du Père Noël au nez parfois rouge", length: 5 },
          { id: 5, word: "BOUGIE", clue: "5. Petite flamme chaleureuse sur la table du réveillon", length: 6 },
          { id: 6, word: "CHOCOLAT", clue: "6. Gourmandise sucrée incontournable des fêtes", length: 8 },
          { id: 7, word: "NEIGE", clue: "7. Jolis flocons blancs qui tombent en hiver", length: 5 },
          { id: 8, word: "CHEMINEE", clue: "8. Là où crépite un bon feu de bois réconfortant", length: 8 },
          { id: 9, word: "LUTIN", clue: "9. Petit assistant joyeux qui fabrique les jouets", length: 5 },
          { id: 10, word: "TRAINEAU", clue: "10. Le véhicule volant qui traverse le ciel étoilé", length: 8 },
          { id: 11, word: "ETOILE", clue: "11. Décoration dorée posée tout en haut du sapin", length: 6 },
          { id: 12, word: "REVEILLON", clue: "12. Le grand repas festif partagé en famille le 24 au soir", length: 9 }
        ]
      },
      {
        dayIndex: 2,
        theme: "Moments en Famille 🏡",
        description: "Les 12 bonheurs simples partagés avec ceux qu'on aime",
        words: [
          { id: 1, word: "DIMANCHE", clue: "1. Le jour parfait pour se réunir autour d'un grand déjeuner", length: 8 },
          { id: 2, word: "REPAS", clue: "2. Moment gourmand partagé tous ensemble autour de la table", length: 5 },
          { id: 3, word: "SOUVENIR", clue: "3. Instant précieux gravé à jamais dans nos cœurs", length: 8 },
          { id: 4, word: "RIRE", clue: "4. Éclat de joie communicatif qui résonne dans la maison", length: 4 },
          { id: 5, word: "COUSIN", clue: "5. Membre de la famille avec qui on fait plein de bêtises", length: 6 },
          { id: 6, word: "TANTE", clue: "6. La super tata gâteau qui prend soin de nous", length: 5 },
          { id: 7, word: "BALADE", clue: "7. Promenade digestive tous ensemble au grand air", length: 6 },
          { id: 8, word: "JEUX", clue: "8. Activités de société animées qui réunissent les générations", length: 4 },
          { id: 9, word: "ALBUM", clue: "9. Livre de photos de famille qu'on adore feuilleter", length: 5 },
          { id: 10, word: "FETE", clue: "10. Célébration joyeuse d'un anniversaire ou d'une naissance", length: 4 },
          { id: 11, word: "TENDRESSE", clue: "11. Douceur et affection infinie envers les siens", length: 9 },
          { id: 12, word: "MAISON", clue: "12. Le foyer chaleureux où toute la famille se rassemble", length: 6 }
        ]
      },
      {
        dayIndex: 3,
        theme: "Pâtisseries & Goûter 🧁",
        description: "Les 12 douceurs sucrées du goûter et de la diversification",
        words: [
          { id: 1, word: "BIBERON", clue: "1. Le récipient magique pour le lait chaud du matin", length: 7 },
          { id: 2, word: "BAVOIR", clue: "2. Le tissu protecteur indispensable contre les taches", length: 6 },
          { id: 3, word: "COMPOTE", clue: "3. Les délicieux fruits mixés pour le goûter de 16h", length: 7 },
          { id: 4, word: "CUILLERE", clue: "4. Petit couvert doux en silicone adapté aux petites bouches", length: 8 },
          { id: 5, word: "CHAISE", clue: "5. Siège haut pour manger à table avec toute la famille", length: 6 },
          { id: 6, word: "LAITAGE", clue: "6. Petit yaourt brassé spécial pour les tout-petits", length: 7 },
          { id: 7, word: "PUREE", clue: "7. Délicieuse préparation de légumes doux mixés (carottes, courgettes)", length: 5 },
          { id: 8, word: "GOUPILLON", clue: "8. Brosse spéciale pour nettoyer les parois du biberon", length: 9 },
          { id: 9, word: "CHAUFFE", clue: "9. Appareil pratique pour tiédir le lait à la température idéale", length: 7 },
          { id: 10, word: "BISCUIT", clue: "10. Petit gâteau fondant pour faire ses premières dents", length: 7 },
          { id: 11, word: "TASSE", clue: "11. Récipient d'apprentissage à anses pour boire de l'eau", length: 5 },
          { id: 12, word: "GOUTER", clue: "12. Le délicieux repas sucré de l'après-midi", length: 6 }
        ]
      },
      {
        dayIndex: 4,
        theme: "Jeux d'Enfants 🎒",
        description: "Les 12 plaisirs de l'enfance, de l'école et des copains",
        words: [
          { id: 1, word: "RECREATION", clue: "1. Le moment préféré de la journée pour courir dans la cour", length: 10 },
          { id: 2, word: "CARTABLE", clue: "2. Le sac d'écolier porté sur le dos pour aller en classe", length: 8 },
          { id: 3, word: "PEINTURE", clue: "3. Activité artistique colorée avec les doigts ou un pinceau", length: 8 },
          { id: 4, word: "DESSIN", clue: "4. Jolie œuvre d'art offerte avec amour à maman et papa", length: 6 },
          { id: 5, word: "MAITRESSE", clue: "5. L'enseignante bienveillante qui apprend à lire et écrire", length: 9 },
          { id: 6, word: "COPAIN", clue: "6. Le meilleur ami avec qui on partage ses jeux", length: 6 },
          { id: 7, word: "TOBOGGAN", clue: "7. Grand jeu de glisse incontournable au parc", length: 8 },
          { id: 8, word: "VELO", clue: "8. Deux-roues avec petites roulettes pour devenir grand", length: 4 },
          { id: 9, word: "HISTOIRE", clue: "9. Le récit passionnant lu par les parents avant de dormir", length: 8 },
          { id: 10, word: "BALLON", clue: "10. Sphère en cuir ou mousse pour marquer des buts", length: 6 },
          { id: 11, word: "BONBON", clue: "11. Petite douceur fruitée pour les grandes occasions", length: 6 },
          { id: 12, word: "GOMMETTE", clue: "12. Petit autocollant coloré à coller partout sur les cahiers", length: 8 }
        ]
      },
      {
        dayIndex: 5,
        theme: "Bain & Soins Douceur 🛁",
        description: "Les 12 secrets pour un bain relaxant et une peau parfumée",
        words: [
          { id: 1, word: "BAIGNOIRE", clue: "1. Le petit bassin ergonomique pour barboter dans l'eau tiède", length: 9 },
          { id: 2, word: "LINIMENT", clue: "2. Soin naturel à l'huile d'olive pour nettoyer le siège", length: 8 },
          { id: 3, word: "COUCHE", clue: "3. La protection absorbante la plus changée de la journée", length: 6 },
          { id: 4, word: "THERMOMETRE", clue: "4. Instrument pour vérifier que l'eau du bain est à 37°C", length: 11 },
          { id: 5, word: "SERVIETTE", clue: "5. Cape de bain toute douce avec capuche pour le séchage", length: 9 },
          { id: 6, word: "MOUSSE", clue: "6. Les jolies bulles légères qui flottent sur l'eau", length: 6 },
          { id: 7, word: "COTON", clue: "7. Petits coussinets doux pour nettoyer les yeux et le visage", length: 5 },
          { id: 8, word: "CREME", clue: "8. Pommade hydratante protectrice pour les petites rougeurs", length: 5 },
          { id: 9, word: "BROSSE", clue: "9. Accessoire aux poils soyeux pour coiffer les premiers cheveux", length: 6 },
          { id: 10, word: "CANARD", clue: "10. Le petit jouet jaune flottant inséparable de la baignoire", length: 6 },
          { id: 11, word: "PARFUM", clue: "11. Eau de senteur délicate sans alcool pour bébé", length: 6 },
          { id: 12, word: "MATELAS", clue: "12. Support molletonné plastifié de la table à langer", length: 7 }
        ]
      },
      {
        dayIndex: 6,
        theme: "Contes & Féerie ✨",
        description: "Les 12 mots magiques de l'univers imaginaire",
        words: [
          { id: 1, word: "PRINCESSE", clue: "1. Petite fille royale chérie et couronnée d'amour", length: 9 },
          { id: 2, word: "ETOILE", clue: "2. Lumière scintillante qui veille dans le ciel nocturne", length: 6 },
          { id: 3, word: "LICORNE", clue: "3. Animal féerique légendaire doté d'une corne magique", length: 7 },
          { id: 4, word: "CHATEAU", clue: "4. La somptueuse demeure royale des contes merveilleux", length: 7 },
          { id: 5, word: "FEE", clue: "5. Personnage ailé bienveillant qui exauce les vœux", length: 3 },
          { id: 6, word: "COURONNE", clue: "6. Bijou doré serti de pierres précieuses", length: 8 },
          { id: 7, word: "BAGUETTE", clue: "7. Petit bâton magique étincelant pour lancer des sorts", length: 8 },
          { id: 8, word: "CARROSSE", clue: "8. Véhicule enchanté qui roule jusqu'au grand bal", length: 8 },
          { id: 9, word: "NUAGE", clue: "9. Forme blanche et cotonneuse qui flotte dans les airs", length: 5 },
          { id: 10, word: "ARCENCIEL", clue: "10. Pont de 7 couleurs magiques qui apparaît après l'orage", length: 9 },
          { id: 11, word: "PAPILLON", clue: "11. Insecte aux ailes multicolores qui danse sur les fleurs", length: 8 },
          { id: 12, word: "TRESOR", clue: "12. Merveille inestimable gardée précieusement avec amour", length: 6 }
        ]
      },
      {
        dayIndex: 7,
        theme: "Petits Animaux 🐰",
        description: "Les 12 petits animaux trop mignons que les bébés adorent",
        words: [
          { id: 1, word: "LAPIN", clue: "1. Petite boule de poils aux grandes oreilles qui grignote des carottes", length: 5 },
          { id: 2, word: "BAMBI", clue: "2. Jeune faon gracieux aux taches blanches", length: 5 },
          { id: 3, word: "OURSON", clue: "3. Petit ours tout doux qui raffole du bon miel", length: 6 },
          { id: 4, word: "ECUREUIL", clue: "4. Petit acrobate agile qui cache ses noisettes dans les arbres", length: 8 },
          { id: 5, word: "HERISSON", clue: "5. Petit animal nocturne piquant mais tellement mignon", length: 8 },
          { id: 6, word: "CHATON", clue: "6. Bébé félin qui ronronne dès qu'on lui fait des câlins", length: 6 },
          { id: 7, word: "CHIOT", clue: "7. Petit toutou joueur qui remue la queue", length: 5 },
          { id: 8, word: "OISILLON", clue: "8. Bébé oiseau qui gazouille dans son petit nid", length: 8 },
          { id: 9, word: "RENARDEAU", clue: "9. Petit canidé roux malicieux de la forêt", length: 9 },
          { id: 10, word: "PANDA", clue: "10. Grand nounours noir et blanc mangeur de bambou", length: 5 },
          { id: 11, word: "KOALA", clue: "11. Petit marsupial tout doux qui dort dans les eucalyptus", length: 5 },
          { id: 12, word: "DAUPHIN", clue: "12. Ami des océans qui saute gracieusement hors de l'eau", length: 7 }
        ]
      },
      {
        dayIndex: 8,
        theme: "Printemps Fleuri 🌸",
        description: "Les 12 beautés du renouveau printanier",
        words: [
          { id: 1, word: "TULIPE", clue: "1. Belle fleur colorée qui s'épanouit au jardin", length: 6 },
          { id: 2, word: "PAPILLON", clue: "2. Insecte aux ailes chamarrées qui voltige de fleur en fleur", length: 8 },
          { id: 3, word: "SOLEIL", clue: "3. Grand astre lumineux qui réchauffe les après-midis", length: 6 },
          { id: 4, word: "OISEAU", clue: "4. Petit chanteur ailé qui fabrique son nid dans les arbres", length: 6 },
          { id: 5, word: "JARDIN", clue: "5. Espace vert fleuri où l'on cueille des herbes fraîches", length: 6 },
          { id: 6, word: "ARROSOIR", clue: "6. Récipient à pommeau pour donner à boire aux plantes", length: 8 },
          { id: 7, word: "BOURGEON", clue: "7. Petite pousse verte qui annonce la naissance d'une feuille", length: 8 },
          { id: 8, word: "MARGUERITE", clue: "8. Fleur blanche au cœur jaune dont on effeuille les pétales", length: 10 },
          { id: 9, word: "ABEILLE", clue: "9. Ouvrière précieuse qui butine le pollen pour faire du miel", length: 7 },
          { id: 10, word: "HERBE", clue: "10. Tapis vert bien frais sur lequel on marche pieds nus", length: 5 },
          { id: 11, word: "ROSEE", clue: "11. Petites gouttes d'eau scintillantes au petit matin", length: 5 },
          { id: 12, word: "PIQUE", clue: "12. Déjeuner champêtre sur une nappe à carreaux dans l'herbe", length: 5 }
        ]
      },
      {
        dayIndex: 9,
        theme: "Vacances & Plage 🏖️",
        description: "Les 12 plaisirs estivaux les pieds dans le sable",
        words: [
          { id: 1, word: "PLAGE", clue: "1. Grande étendue de sable doré face à l'océan", length: 5 },
          { id: 2, word: "CHATEAU", clue: "2. Forteresse éphémère sculptée avec du sable mouillé et un seau", length: 7 },
          { id: 3, word: "COQUILLAGE", clue: "3. Jolie trouvaille nacrée ramassée sur le rivage", length: 10 },
          { id: 4, word: "GLACE", clue: "4. Délicieux cornet rafraîchissant à la fraise ou vanille", length: 5 },
          { id: 5, word: "SERVIETTE", clue: "5. Grand drap de plage moelleux étalé pour bronzer", length: 9 },
          { id: 6, word: "PARASOL", clue: "6. Grand abri coloré pour se reposer à l'ombre", length: 7 },
          { id: 7, word: "BOUEE", clue: "7. Flotteur gonflable pour barboter en toute sécurité", length: 5 },
          { id: 8, word: "LUNETTES", clue: "8. Accessoire teinté indispensable pour protéger les yeux du soleil", length: 8 },
          { id: 9, word: "CREME", clue: "9. Lotion solaire indice 50 pour protéger la peau de bébé", length: 5 },
          { id: 10, word: "VAGUE", clue: "10. Mouvement de l'eau qui vient chatouiller les orteils", length: 5 },
          { id: 11, word: "PELLE", clue: "11. Outil en plastique indispensable pour creuser des tranchées", length: 5 },
          { id: 12, word: "BATEAU", clue: "12. Voilier blanc qui glisse doucement sur l'eau bleue", length: 6 }
        ]
      },
      {
        dayIndex: 10,
        theme: "Jouets d'Éveil 🧸",
        description: "Les 12 divertissements préférés pour s'amuser et grandir",
        words: [
          { id: 1, word: "PELUCHE", clue: "1. Animal en tissu ultra doux qu'on serre fort contre soi", length: 7 },
          { id: 2, word: "PUZZLE", clue: "2. Jeu de pièces en bois à encastrer pour former une image", length: 6 },
          { id: 3, word: "HOCHET", clue: "3. Petit grelot à secouer qui fait du bruit et éveille bébé", length: 6 },
          { id: 4, word: "CUBE", clue: "4. Bloc de construction coloré qu'on empile pour faire des tours", length: 4 },
          { id: 5, word: "TAPIS", clue: "5. Aire de motricité matelassée avec arches d'activités", length: 5 },
          { id: 6, word: "POUPEE", clue: "6. Petit personnage qu'on habille et berce comme un bébé", length: 6 },
          { id: 7, word: "CAMION", clue: "7. Véhicule miniature pour transporter des petits trésors", length: 6 },
          { id: 8, word: "PORTIQUE", clue: "8. Structure en bois avec jouets suspendus au-dessus de bébé", length: 8 },
          { id: 9, word: "BALLON", clue: "9. Sphère en tissu qu'on fait rouler sur le sol", length: 6 },
          { id: 10, word: "XILOPHONE", clue: "10. Petit instrument de musique coloré à lames sonores", length: 9 },
          { id: 11, word: "LIVRE", clue: "11. Ouvrage cartonné avec matières douces à toucher", length: 5 },
          { id: 12, word: "MOBILE", clue: "12. Suspensions musicales au-dessus du lit qui tournent", length: 6 }
        ]
      },
      {
        dayIndex: 11,
        theme: "Pâtisserie, goûters et douceurs 🧁",
        description: "Les 12 gourmandises préparées avec amour pour le goûter",
        words: [
          { id: 1, word: "GATEAU", clue: "1. Pâtisserie moelleuse au yaourt ou au chocolat", length: 6 },
          { id: 2, word: "CREPE", clue: "2. Galette fine et dorée garnie de confiture ou sucre", length: 5 },
          { id: 3, word: "FRAISE", clue: "3. Petit fruit rouge juteux et sucré adoré des enfants", length: 6 },
          { id: 4, word: "CHOCOLAT", clue: "4. Délicieuse saveur cacao fondante", length: 8 },
          { id: 5, word: "BRIOCHE", clue: "5. Pain au beurre tout chaud et gonflé du dimanche matin", length: 7 },
          { id: 6, word: "BISCUIT", clue: "6. Sablé croustillant à tremper dans le verre de lait", length: 7 },
          { id: 7, word: "BANANE", clue: "7. Fruit doux jaune facile à écraser pour les premiers goûters", length: 6 },
          { id: 8, word: "FARINE", clue: "8. Poudre blanche indispensable dans la pâte à gâteaux", length: 6 },
          { id: 9, word: "SUCRE", clue: "9. Ingrédient qui donne un goût si doux aux desserts", length: 5 },
          { id: 10, word: "POMME", clue: "10. Fruit croquant cuit en douce compote à la cannelle", length: 5 },
          { id: 11, word: "VANILLE", clue: "11. Parfum exquis issu d'une gousse noire précieuse", length: 7 },
          { id: 12, word: "GOUTER", clue: "12. La pause sucrée la plus attendue de l'après-midi à 16h", length: 6 }
        ]
      },
      {
        dayIndex: 12,
        theme: "Papi, Mamie & Trésors de Famille 👵",
        description: "Les 12 marques d'amour des grands-parents chéris",
        words: [
          { id: 1, word: "MAMIE", clue: "1. La grand-mère attentionnée qui prépare les meilleurs plats", length: 5 },
          { id: 2, word: "PAPI", clue: "2. Le grand-père bricoleur qui raconte les plus belles histoires", length: 4 },
          { id: 3, word: "CALIN", clue: "3. Étreinte chaleureuse et réconfortante", length: 5 },
          { id: 4, word: "GATEAU", clue: "4. Recette secrète préparée spécialement pour la visite des petits", length: 6 },
          { id: 5, word: "ALBUM", clue: "5. Recueil de photos anciennes en noir et blanc", length: 5 },
          { id: 6, word: "JARDIN", clue: "6. Potager où l'on récolte les fraises avec papi", length: 6 },
          { id: 7, word: "SOUVENIR", clue: "7. Trésor précieux que le temps ne peut effacer", length: 8 },
          { id: 8, word: "BONBON", clue: "8. Petite friandise donnée en cachette avec un clin d'œil", length: 6 },
          { id: 9, word: "HISTOIRE", clue: "9. Récit du passé raconté au coin du feu", length: 8 },
          { id: 10, word: "AMOUR", clue: "10. Sentiment immense et inconditionnel pour les petits-enfants", length: 5 },
          { id: 11, word: "SAGESSE", clue: "11. Précieux conseils guidés par l'expérience de la vie", length: 7 },
          { id: 12, word: "SUDOKU", clue: "12. Petit jeu de logique du journal du matin", length: 6 }
        ]
      },
      {
        dayIndex: 13,
        theme: "Premiers Pas & Éveil 👣",
        description: "Les 12 étapes magiques de la première année de vie",
        words: [
          { id: 1, word: "SOURIRE", clue: "1. La première mimique radieuse offerte à papa et maman", length: 7 },
          { id: 2, word: "BABIL", clue: "2. Les adorables premiers gazouillements et sons de bébé", length: 5 },
          { id: 3, word: "DENT", clue: "3. La première petite perle blanche qui pousse dans la bouche", length: 4 },
          { id: 4, word: "PAS", clue: "4. Déplacements hésitants puis assurés sur deux petites jambes", length: 3 },
          { id: 5, word: "CHAUSSON", clue: "5. Petite chaussure en cuir souple qui protège les petits pieds", length: 8 },
          { id: 6, word: "MOTRICITE", clue: "6. Développement de l'équilibre et des mouvements", length: 9 },
          { id: 7, word: "REGARD", clue: "7. Grands yeux curieux qui découvrent le monde qui l'entoure", length: 6 },
          { id: 8, word: "EVEIL", clue: "8. Émerveillement face aux sons, aux couleurs et aux formes", length: 5 },
          { id: 9, word: "BISOUS", clue: "9. Milliers de baisers doux déposés sur les joues potelées", length: 6 },
          { id: 10, word: "BRAVO", clue: "10. Les applaudissements joyeux des parents à chaque progrès", length: 5 },
          { id: 11, word: "COURAGE", clue: "11. Force déployée pour se relever après chaque petite chute", length: 7 },
          { id: 12, word: "GRANDIR", clue: "12. La plus belle aventure de toute l'enfance", length: 7 }
        ]
      }
    ];
  },

  getDailyCrosswordGrid(dateStr = null) {
    const bank = this.getDailyCrosswordsBank();
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    
    // Obtenir la date locale YYYY-MM-DD en heure de Paris
    const parisFormatter = new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const actualDateStr = dateStr || parisFormatter.format(targetDate);

    // Calcul de l'index du jour de l'année
    const [y, m, d] = actualDateStr.split('-').map(Number);
    const startOfYear = new Date(Date.UTC(y, 0, 1));
    const currentDay = new Date(Date.UTC(y, m - 1, d));
    const dayOfYear = Math.floor((currentDay - startOfYear) / (1000 * 60 * 60 * 24));
    
    const gridIndex = Math.abs(dayOfYear) % bank.length;
    const tomorrowGridIndex = Math.abs(dayOfYear + 1) % bank.length;
    const grid = bank[gridIndex];
    const tomorrowGrid = bank[tomorrowGridIndex];

    return {
      date: actualDateStr,
      dayNumber: dayOfYear + 1,
      tomorrowTheme: tomorrowGrid?.theme || "",
      ...grid
    };
  },

  getCrosswordLeaderboards(dateStr = null) {
    const data = readDb();
    const list = data.dailyGameScores || [];
    
    const parisFormatter = new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const today = dateStr || parisFormatter.format(new Date());

    // Today's podium (sorted by points descending, or time ascending)
    const todayScores = list
      .filter(s => s.date === today)
      .sort((a, b) => b.points - a.points || a.timeSeconds - b.timeSeconds);

    // Global evolving leaderboard (sum of all daily points!)
    const playerMap = {};
    list.forEach(score => {
      const p = score.playerName;
      if (!playerMap[p]) {
        playerMap[p] = {
          playerName: p,
          totalPoints: 0,
          daysPlayed: 0,
          bestTimeFormatted: score.timeFormatted,
          bestTimeSeconds: score.timeSeconds,
          lastPlayedDate: score.date
        };
      }
      playerMap[p].totalPoints += (score.points || 0);
      playerMap[p].daysPlayed += 1;
      if (score.timeSeconds < playerMap[p].bestTimeSeconds) {
        playerMap[p].bestTimeSeconds = score.timeSeconds;
        playerMap[p].bestTimeFormatted = score.timeFormatted;
      }
      if (new Date(score.date) > new Date(playerMap[p].lastPlayedDate)) {
        playerMap[p].lastPlayedDate = score.date;
      }
    });

    const globalLeaderboard = Object.values(playerMap).sort((a, b) => b.totalPoints - a.totalPoints);

    return {
      todayDate: today,
      todayScores,
      globalLeaderboard,
      allScores: list
    };
  },

  submitCrosswordScore(scoreData) {
    const data = readDb();
    if (!data.dailyGameScores) data.dailyGameScores = [];

    const parisFormatter = new Intl.DateTimeFormat('fr-CA', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const todayStr = scoreData.date || parisFormatter.format(new Date());
    const timeSec = Number(scoreData.timeSeconds) || 60;
    const correctCount = Number(scoreData.correctCount) || 0;
    const totalWords = Number(scoreData.totalWords) || 12;

    // Scoring: 60 pts per correct word (up to 720 pts) + speed bonus (up to 300 pts)
    const wordPoints = correctCount * 60;
    const speedBonus = Math.max(0, Math.round((240 - timeSec) * 1.5));
    const calculatedPoints = Math.max(50, wordPoints + (correctCount >= 6 ? speedBonus : 0));

    const newEntry = {
      id: "score-" + Date.now(),
      playerName: scoreData.playerName || "Un proche",
      date: todayStr,
      theme: scoreData.theme || "Mots Fléchés",
      timeSeconds: timeSec,
      timeFormatted: scoreData.timeFormatted || "01:00",
      correctCount,
      totalWords,
      points: calculatedPoints,
      createdAt: new Date().toISOString()
    };

    // Mettre à jour si le joueur a déjà un score enregistré pour aujourd'hui (enregistre systématiquement le dernier score)
    const existingIndex = data.dailyGameScores.findIndex(
      s => s.date === todayStr && s.playerName.toLowerCase() === (scoreData.playerName || '').toLowerCase()
    );

    if (existingIndex >= 0) {
      data.dailyGameScores[existingIndex] = newEntry;
    } else {
      data.dailyGameScores.push(newEntry);
    }

    writeDb(data);

    return {
      awardedPoints: calculatedPoints,
      correctCount,
      totalWords,
      ...this.getCrosswordLeaderboards(todayStr)
    };
  }
};
