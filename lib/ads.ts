/**
 * Gestore pubblicità centralizzato.
 * - Banner: usato direttamente nei componenti
 * - Interstitial video: 1 ogni 50 domande risposte
 *
 * In sviluppo usa i TestIds di Google (nessun account AdMob necessario).
 * In produzione sostituisci le costanti AD_UNIT_* con i tuoi ID reali.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── ID Unità Pubblicitarie ───────────────────────────────────────────────────
// Sostituisci con i tuoi ID reali quando vai in produzione
const IS_DEV = __DEV__;

export const AD_UNIT_BANNER = IS_DEV
  ? "ca-app-pub-3940256099942544/6300978111"   // test banner Google
  : "ca-app-pub-XXXXXXXX/XXXXXXXXXX";           // ← metti il tuo ID qui

export const AD_UNIT_INTERSTITIAL = IS_DEV
  ? "ca-app-pub-3940256099942544/1033173712"   // test interstitial Google
  : "ca-app-pub-XXXXXXXX/XXXXXXXXXX";           // ← metti il tuo ID qui

// ─── Contatore domande ────────────────────────────────────────────────────────
const STORAGE_KEY    = "questions_answered_total";
const AD_EVERY       = 50; // mostra video ogni N domande

/**
 * Chiama questa funzione ogni volta che l'utente risponde a una domanda.
 * Restituisce true se è il momento di mostrare un video interstitial.
 */
export async function trackQuestionAndCheckAd(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const count = raw ? parseInt(raw) : 0;
    const newCount = count + 1;
    await AsyncStorage.setItem(STORAGE_KEY, newCount.toString());

    // Mostra ad ogni AD_EVERY domande (50, 100, 150, ...)
    return newCount % AD_EVERY === 0;
  } catch {
    return false;
  }
}

/**
 * Resetta il contatore (utile per test).
 */
export async function resetAdCounter(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, "0");
}
