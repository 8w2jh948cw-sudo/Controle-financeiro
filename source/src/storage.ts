import type { AppState } from "./types";

const DB_NAME = "meu-dinheiro-inteligente";
const DB_VERSION = 1;
const STORE_NAME = "app";
const STATE_KEY = "current-state";
const FALLBACK_KEY = "meu-dinheiro-inteligente-state";

const openDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export const loadState = async (): Promise<AppState | null> => {
  try {
    const db = await openDatabase();
    const state = await new Promise<AppState | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(STATE_KEY);
      request.onsuccess = () => resolve((request.result as AppState | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    if (state) return state;
  } catch {
    // O fallback mantém o app utilizável quando o IndexedDB não estiver disponível.
  }
  try {
    const fallback = localStorage.getItem(FALLBACK_KEY);
    return fallback ? JSON.parse(fallback) as AppState : null;
  } catch {
    return null;
  }
};

export const saveState = async (state: AppState): Promise<void> => {
  let saved = false;
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(state));
    saved = true;
  } catch {
    // O localStorage é pequeno e pode ficar cheio. O IndexedDB ainda deve ser tentado.
  }
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(state, STATE_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
    saved = true;
  } catch {
    // Se o IndexedDB falhar, o localStorage ainda pode ter preservado os dados.
  }
  if (!saved) throw new Error("Não foi possível salvar os dados neste navegador.");
};
