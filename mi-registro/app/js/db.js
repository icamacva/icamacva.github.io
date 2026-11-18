// Almacenamiento local en IndexedDB (con copia en memoria si el navegador no lo permite).
// Nada sale del dispositivo.

const DB_NAME = "stimulo-mi-registro";
const DB_VERSION = 1;
let dbp = null;
let fallback = null; // { entries: Map, settings: Map } cuando no hay IndexedDB

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("entries")) {
          const s = db.createObjectStore("entries", { keyPath: "id" });
          s.createIndex("ts", "ts");
        }
        if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings");
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  }).then((db) => {
    if (!db) fallback = { entries: new Map(), settings: new Map() };
    return db;
  });
  return dbp;
}

function tx(db, store, mode, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const out = fn(s);
    t.oncomplete = () => resolve(out && "result" in out ? out.result : undefined);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

export const isPersistent = async () => !!(await open());

export async function allEntries() {
  const db = await open();
  if (!db) return [...fallback.entries.values()];
  return tx(db, "entries", "readonly", (s) => s.getAll());
}

export async function putEntry(e) {
  const db = await open();
  if (!db) { fallback.entries.set(e.id, e); return; }
  await tx(db, "entries", "readwrite", (s) => s.put(e));
}

export async function putEntries(list) {
  const db = await open();
  if (!db) { list.forEach((e) => fallback.entries.set(e.id, e)); return; }
  await tx(db, "entries", "readwrite", (s) => { list.forEach((e) => s.put(e)); });
}

export async function deleteEntry(id) {
  const db = await open();
  if (!db) { fallback.entries.delete(id); return; }
  await tx(db, "entries", "readwrite", (s) => s.delete(id));
}

export async function clearEntries() {
  const db = await open();
  if (!db) { fallback.entries.clear(); return; }
  await tx(db, "entries", "readwrite", (s) => s.clear());
}

export async function getSetting(key, def = "") {
  const db = await open();
  if (!db) return fallback.settings.has(key) ? fallback.settings.get(key) : def;
  const v = await tx(db, "settings", "readonly", (s) => s.get(key));
  return v === undefined ? def : v;
}

export async function setSetting(key, value) {
  const db = await open();
  if (!db) { fallback.settings.set(key, value); return; }
  await tx(db, "settings", "readwrite", (s) => s.put(value, key));
}

// Pide al navegador que no borre los datos por falta de espacio (sobre todo en iPhone).
export async function askPersist() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const already = await navigator.storage.persisted();
      if (!already) await navigator.storage.persist();
    }
  } catch (e) { /* sin soporte */ }
}
