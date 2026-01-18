# Cosa Sceglieresti? 🎮

Un gioco mobile stile "Would You Rather" dove gli utenti scelgono tra due opzioni assurde, difficili o ironiche. L'app è veloce, colorata e divertente, pensata per giocare da soli o con amici!

## ✨ Caratteristiche

### 🎯 Modalità di Gioco
- **Storico** - Domande su eventi e personaggi storici
- **Calcistico** - Dilemmi sul mondo del calcio
- **NBA / Basket** - Scenari sul basket professionistico
- **Religione** - Domande filosofiche e spirituali
- **Random** - Mix casuale e divertente di tutte le categorie

### 🎨 Funzionalità
- ✅ Interfaccia mobile-first con design moderno
- ✅ Statistiche in tempo reale condivise tra tutti gli utenti
- ✅ Feedback tattile (vibrazione) per ogni interazione
- ✅ Tema chiaro e scuro
- ✅ Animazioni fluide e coinvolgenti
- ✅ Database MongoDB per domande e statistiche
- ✅ Generazione AI di nuove domande (GPT-5.2)
- ✅ Design responsive per tutti i dispositivi

## 🛠 Tech Stack

### Frontend
- **Expo** - Framework React Native per sviluppo mobile
- **Expo Router** - Navigazione file-based
- **React Native** - UI nativa cross-platform
- **TypeScript** - Type safety
- **Expo Haptics** - Feedback tattile
- **AsyncStorage** - Persistenza locale delle impostazioni
- **Expo Linear Gradient** - Gradienti per le categorie

### Backend
- **FastAPI** - Framework Python moderno per API
- **MongoDB** - Database NoSQL
- **Motor** - Driver async MongoDB
- **Emergent Integrations** - Integrazione LLM (OpenAI GPT-5.2)

## 🚀 Come Funziona

### Flusso di Gioco
1. **Home Screen**: Scegli una categoria tra le 5 disponibili
2. **Schermata di Gioco**: 
   - Due grandi pulsanti con le opzioni
   - Cerchio "O" centrale per separare visivamente
   - Tap su un'opzione per scegliere
3. **Statistiche**: Dopo la scelta, vedi le percentuali di voto degli altri utenti
4. **Prossima Domanda**: Continua a giocare nella stessa categoria

### Backend API Endpoints

```
GET  /api/                          - Health check
GET  /api/questions?category=...    - Ottieni domande per categoria
POST /api/choice                     - Registra una scelta utente
GET  /api/stats/:question_id        - Ottieni statistiche domanda
POST /api/generate-question         - Genera nuova domanda con AI
POST /api/seed                       - Seed iniziale del database
```

## 📱 Screenshot

```
┌─────────────────────┐
│  Cosa Sceglieresti? │
│                     │
│  ┌───────────────┐  │
│  │  🏛️ Storico   │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │  ⚽ Calcio     │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │  🏀 Basket     │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │  🙏 Religione  │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │  🎲 Random     │  │
│  └───────────────┘  │
└─────────────────────┘
```

## 🎯 Esempi di Domande

### Storico
- Preferiresti vivere nell'Impero Romano al suo apice o nell'Antico Egitto durante la costruzione delle piramidi?

### Calcistico
- Preferiresti vincere la Champions da panchinaro o perdere la finale da protagonista assoluto?

### Basket
- Preferiresti 10 anni da role player in NBA o 1 anno da MVP poi finire in Europa?

### Religione
- Preferiresti parlare direttamente con una divinità o ricevere una prova fisica e tangibile del soprannaturale?

### Random
- Preferiresti vivere senza internet per un anno con 1 milione di euro o vivere con internet ma guadagnare solo 1000 euro al mese?

## ⚙️ Impostazioni

- **Effetti Sonori**: Attiva/disattiva feedback audio (implementato con haptics per MVP)
- **Vibrazione**: Abilita/disabilita feedback tattile
- **Tema**: Scegli tra chiaro e scuro

## 🤖 Generazione AI

L'app utilizza OpenAI GPT-5.2 tramite Emergent LLM Key per generare nuove domande dinamicamente. Ogni categoria ha prompt specifici per generare domande coerenti con il tema.

## 🎨 Design System

### Colori delle Categorie
- **Storico**: Blu navy (#1e3a8a → #3b82f6)
- **Calcio**: Verde prato (#16a34a → #22c55e)
- **Basket**: Arancione (#ea580c → #f97316)
- **Religione**: Viola (#7c3aed → #a855f7)
- **Random**: Rosa (#ec4899 → #f472b6)

### Temi
- **Chiaro**: Background #F5F5F7, Card #FFFFFF
- **Scuro**: Background #000000, Card #1C1C1E

## 📦 Installazione e Sviluppo

### Prerequisiti
- Node.js 18+
- Python 3.11+
- MongoDB
- Yarn

### Backend
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

### Seed Database
```bash
curl -X POST http://localhost:8001/api/seed
```

## 🔮 Funzionalità Future (opzionali)
- [ ] Modalità Party con timer
- [ ] Sistema di livelli e punti
- [ ] Domande custom dall'utente
- [ ] Multilingua
- [ ] Condivisione su social
- [ ] Cloud save
- [ ] Modalità offline

## 📄 Licenza

© 2025 Cosa Sceglieresti - Sviluppato con ❤️

---

**Divertiti a giocare! 🎮**
