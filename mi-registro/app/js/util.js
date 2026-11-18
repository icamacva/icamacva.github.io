// Utilidades compartidas por la app y el informe PDF.

export const DAY = 86400000;
export const nf1 = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const fDay = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });
export const fShort = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });
export const fTime = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" });
export const fLong = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" });
export const fNum = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });

export const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const endOfDay = (t) => startOfDay(t) + DAY - 1;
export const norm = (s) => (s || "").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
export const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY);
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Momento del día calculado a partir de la hora del registro.
export const FRANJAS = ["Mañana", "Mediodía", "Tarde", "Noche"];
export function franja(ts) {
  const h = new Date(ts).getHours();
  if (h >= 6 && h < 12) return "Mañana";
  if (h >= 12 && h < 16) return "Mediodía";
  if (h >= 16 && h < 21) return "Tarde";
  return "Noche";
}

export function dayLabel(ts) {
  const d = startOfDay(ts), t = startOfDay(Date.now());
  if (d === t) return "Hoy";
  if (d === t - DAY) return "Ayer";
  return fDay.format(ts);
}

const p2 = (n) => String(n).padStart(2, "0");
export function toLocalInput(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;
}
export function toDateInput(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}
export function fromDateInput(v) {
  const [y, m, d] = (v || "").split("-").map(Number);
  if (!y || !m || !d) return NaN;
  return new Date(y, m - 1, d).getTime();
}
export const fileDate = (ts = Date.now()) => toDateInput(ts);

// Media por grupo. order: lista fija de etiquetas (p. ej. franjas); si no, por nº de registros.
export function groupAvg(list, keyFn, order) {
  const m = new Map();
  for (const e of list) {
    const raw = keyFn(e);
    if (!raw) continue;
    const k = norm(raw);
    if (!m.has(k)) m.set(k, { label: raw.trim(), sum: 0, n: 0 });
    const g = m.get(k); g.sum += e.nota; g.n++;
  }
  const arr = [...m.values()].map((g) => ({ ...g, avg: g.sum / g.n }));
  if (order) arr.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
  else arr.sort((a, b) => b.n - a.n || a.label.localeCompare(b.label, "es"));
  return arr;
}

export const avg = (list) => (list.length ? list.reduce((s, e) => s + e.nota, 0) / list.length : null);

// Estadísticas de la pantalla de inicio. list: ordenada de más nueva a más antigua.
export function stats(list) {
  if (!list.length) return null;
  const first = list[list.length - 1].ts;
  const days = new Set(list.map((e) => startOfDay(e.ts)));
  let streak = 0, d = startOfDay(Date.now());
  if (!days.has(d)) d -= DAY;
  while (days.has(d)) { streak++; d -= DAY; }
  const week = list.filter((e) => e.ts >= startOfDay(Date.now()) - 6 * DAY);
  return {
    total: list.length,
    dayN: daysBetween(first, Date.now()) + 1,
    first,
    daysWith: days.size,
    streak,
    avg7: avg(week),
    last: list[0],
  };
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
