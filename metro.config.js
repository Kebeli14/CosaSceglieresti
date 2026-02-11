const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Rimuoviamo la configurazione manuale di FileStore che causava l'errore di permessi.
// Expo gestirà automaticamente la cache nel modo più appropriato per l'ambiente (locale o cloud).

// Manteniamo il limite dei workers se il tuo PC ha poche risorse, 
// ma su EAS questo non influenzerà negativamente il build.
config.maxWorkers = 2;

module.exports = config;