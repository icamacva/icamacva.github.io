// Diferencias entre la app de Android (Capacitor) y la versión de navegador (iPhone / PWA).
import { Capacitor, registerPlugin, SystemBars } from "./vendor/capacitor-core.js";

export const isNative = !!(Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());

const App = isNative ? registerPlugin("App") : null;
const Filesystem = isNative ? registerPlugin("Filesystem") : null;
const Share = isNative ? registerPlugin("Share") : null;

export async function setupNative() {
  if (!isNative) return;
  try { await SystemBars.setStyle({ style: "LIGHT" }); } catch (e) { /* opcional */ }
}

// Botón «atrás» de Android. handler() devuelve true si ha gestionado el gesto.
export function onBack(handler) {
  if (!isNative) return;
  App.addListener("backButton", () => {
    if (!handler()) App.exitApp();
  });
}

export async function appVersion() {
  if (!isNative) return "";
  try { const i = await App.getInfo(); return i.version; } catch (e) { return ""; }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

// Comparte un archivo (PDF, copia…). Devuelve "shared", "downloaded" o "cancelled".
export async function shareFile({ blob, filename, title, text }) {
  if (isNative) {
    const data = await blobToBase64(blob);
    const res = await Filesystem.writeFile({ path: filename, data, directory: "CACHE" });
    try {
      await Share.share({ title, text, files: [res.uri], dialogTitle: title });
      return "shared";
    } catch (e) {
      if (/cancel/i.test(String(e && (e.message || e)))) return "cancelled";
      throw e;
    }
  }

  // Navegador: hoja de compartir del sistema si admite archivos (Safari en iPhone, Chrome en Android)…
  const file = new File([blob], filename, { type: blob.type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text });
      return "shared";
    } catch (e) {
      if (e && e.name === "AbortError") return "cancelled";
      // si falla, seguimos con la descarga
    }
  }
  // …y si no, descarga normal.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  return "downloaded";
}
