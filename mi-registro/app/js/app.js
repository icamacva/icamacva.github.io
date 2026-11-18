// Stímulo · Mi registro — lógica de la interfaz
import * as db from "./db.js";
import { isNative, setupNative, onBack, appVersion, shareFile } from "./platform.js";
import { buildReport } from "./report.js";
import {
  DAY, nf1, fShort, fTime, fLong, esc, startOfDay, endOfDay, norm, franja, FRANJAS, dayLabel,
  toLocalInput, toDateInput, fromDateInput, fileDate, groupAvg, avg, stats, uid, plural,
} from "./util.js";

const $ = (s) => document.querySelector(s);
let memory = [];                                   // todos los registros
const sorted = () => memory.slice().sort((a, b) => b.ts - a.ts);

/* ---------- Avisos ---------- */
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("on"), 2600);
}

/* ---------- Iconos ---------- */
const I = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
  pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  chev: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
};

/* ---------- Tarjeta de registro ---------- */
function entryHTML(e) {
  const bits = [e.donde, e.quien].filter(Boolean).map(esc).join(" · ");
  return `<button class="entry" data-id="${e.id}">
    <div class="score">${e.nota}<small>/10</small></div>
    <div class="body">
      <div class="meta">${fTime.format(e.ts)} · ${franja(e.ts)}</div>
      ${bits ? `<div class="where">${bits}</div>` : ""}
      ${e.pens ? `<div class="thought">${esc(e.pens)}</div>` : (!bits ? `<div class="thought muted">Sin más detalles</div>` : "")}
    </div>
  </button>`;
}

/* ---------- Inicio ---------- */
function renderInicio() {
  $("#todayLbl").textContent = fShort.format(Date.now());
  const s = stats(sorted()), el = $("#inicioBody");
  if (!s) {
    el.innerHTML = `<div class="card hero">
      <img class="welcome-logo" src="img/logo-full.png" alt="Stímulo, Centro de Psicología">
      <div class="cap">Aún no hay ningún registro</div>
      <div class="since">Cuando notes algo, apúntalo aquí. Solo te llevará un momento.</div>
      <button class="cta" data-new>${I.plus}Hacer mi primer registro</button>
    </div>`;
    return;
  }
  el.innerHTML = `<div class="card hero">
      <div class="lbl">Día</div>
      <div class="num">${s.dayN}</div>
      <div class="cap">desde tu primer registro</div>
      <div class="since">Empezaste el ${fLong.format(s.first)}</div>
      <button class="cta" data-new>${I.plus}Nuevo registro</button>
    </div>
    <div class="tiles">
      <div class="tile"><div class="v">${s.total}</div><div class="k">Registros</div></div>
      <div class="tile"><div class="v">${s.daysWith}</div><div class="k">Días con registro</div></div>
      <div class="tile"><div class="v">${s.streak}<small>${s.streak === 1 ? "día" : "días"}</small></div><div class="k">Seguidos registrando</div></div>
      <div class="tile"><div class="v">${s.avg7 == null ? "–" : nf1.format(s.avg7)}${s.avg7 == null ? "" : "<small>/10</small>"}</div><div class="k">Cómo te sentiste<br>(media 7 días)</div></div>
    </div>
    <button class="card report-card" data-report>
      <div class="ico">${I.pdf}</div>
      <div><b>Enviar informe</b><span>PDF para llevar a consulta</span></div>
      <div class="chev">${I.chev}</div>
    </button>
    <div class="day">Último registro · ${dayLabel(s.last.ts)}</div>
    ${entryHTML(s.last)}`;
}

/* ---------- Historial ---------- */
function renderHistorial() {
  const list = sorted(), el = $("#histBody");
  $("#histCount").textContent = list.length ? plural(list.length, "registro", "registros") : "";
  if (!list.length) {
    el.innerHTML = `<div class="card empty"><div class="ico">${I.note}</div><strong>Todavía no hay registros</strong><p>Pulsa el botón + para añadir el primero.</p></div>`;
    return;
  }
  let html = "", cur = null;
  for (const e of list) {
    const d = startOfDay(e.ts);
    if (d !== cur) { html += `<div class="day">${dayLabel(e.ts)}</div>`; cur = d; }
    html += entryHTML(e);
  }
  el.innerHTML = html;
}

/* ---------- Gráfica ---------- */
let range = "7";
function barsHTML(title, arr, limit) {
  if (!arr.length) return "";
  const extra = limit && arr.length > limit ? arr.length - limit : 0;
  const rows = (limit ? arr.slice(0, limit) : arr).map((g) => `<div class="row" title="${esc(g.label)}: media ${nf1.format(g.avg)} de 10 en ${plural(g.n, "registro", "registros")}">
      <div class="lab">${esc(g.label)}</div>
      <div class="track"><div class="fill" style="width:${Math.max(2, g.avg * 10)}%"></div></div>
      <div class="val">${nf1.format(g.avg)}<small>(${g.n})</small></div>
    </div>`).join("");
  return `<div class="card bars"><h2>${title}<small>Media de 0 a 10 · (nº de registros)</small></h2>${rows}
    <div class="scale-note"><span>0 · Mal</span><span>10 · Muy bien</span></div>
    ${extra ? `<div class="hint">Y ${extra} más con menos registros.</div>` : ""}</div>`;
}
function renderGrafica() {
  const all = sorted().reverse();
  const el = $("#chartBody");
  if (!all.length) {
    el.innerHTML = `<div class="card empty"><div class="ico">${I.chart}</div><strong>La gráfica aparecerá aquí</strong><p>En cuanto haya registros verás cómo te has sentido a lo largo del tiempo.</p></div>`;
    return;
  }
  const now = Date.now();
  let x0, x1 = now;
  if (range === "all") { x0 = startOfDay(all[0].ts); x1 = Math.max(now, all[all.length - 1].ts); if (x1 - x0 < DAY) x0 = x1 - DAY; }
  else x0 = startOfDay(now) - (parseInt(range, 10) - 1) * DAY;
  const list = all.filter((e) => e.ts >= x0);
  const label = range === "all" ? "Desde el principio" : `Últimos ${range} días`;
  let html = `<div class="card"><h2>Cómo te has sentido<small>${label}</small></h2>`;
  if (!list.length) {
    html += `<p class="note muted" style="padding:20px 0;text-align:center">No hay registros en este periodo.</p></div>`;
  } else {
    html += `<div class="note" style="margin:-4px 0 10px">${plural(list.length, "registro", "registros")} · media <strong style="color:var(--ink)">${nf1.format(avg(list))}</strong> de 10</div>
      <div class="chart" id="chart"><div class="tip" id="tip"></div></div></div>`;
  }
  html += barsHTML("Según el momento del día", groupAvg(list, (e) => franja(e.ts), FRANJAS));
  html += barsHTML("Según dónde estabas", groupAvg(list, (e) => e.donde), 8);
  html += barsHTML("Según con quién estabas", groupAvg(list, (e) => e.quien), 8);
  el.innerHTML = html;
  if (list.length) drawChart(list, x0, x1);
}
function drawChart(list, x0, x1) {
  const box = $("#chart"); if (!box) return;
  const W = Math.max(280, box.clientWidth), H = 230;
  const m = { l: 30, r: 12, t: 14, b: 28 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const X = (t) => m.l + ((t - x0) / (x1 - x0)) * iw;
  const Y = (v) => m.t + (1 - v / 10) * ih;
  let g = "";
  for (const v of [0, 2, 4, 6, 8, 10]) {
    g += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--grid)" stroke-width="1"/>`;
    g += `<text x="${m.l - 8}" y="${Y(v) + 4}" text-anchor="end">${v}</text>`;
  }
  const nT = Math.min(5, Math.max(2, Math.floor(iw / 85)));
  const seen = new Set();
  for (let i = 0; i < nT; i++) {
    const t = startOfDay(x0 + ((x1 - x0) * i) / (nT - 1));
    if (seen.has(t)) continue; seen.add(t);
    const anchor = i === 0 ? "start" : i === nT - 1 ? "end" : "middle";
    const xx = i === 0 ? m.l : i === nT - 1 ? W - m.r : X(t);
    g += `<text x="${xx}" y="${H - 8}" text-anchor="${anchor}">${fShort.format(t).replace(".", "")}</text>`;
  }
  const pts = list.map((e) => [X(e.ts), Y(e.nota), e]);
  if (pts.length > 1) g += `<polyline fill="none" stroke="var(--brand)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="${pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ")}"/>`;
  g += `<line id="cross" x1="0" x2="0" y1="${m.t}" y2="${m.t + ih}" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 3" opacity="0"/>`;
  for (const p of pts) g += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.5" fill="var(--brand-strong)" stroke="var(--surface)" stroke-width="2"/>`;
  g += `<circle id="hot" r="7" fill="var(--brand-strong)" stroke="var(--surface)" stroke-width="2.5" opacity="0"/>`;
  g += `<rect id="hit" x="${m.l - 10}" y="0" width="${iw + 20}" height="${H}" fill="transparent"/>`;
  box.insertAdjacentHTML("afterbegin", `<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="Gráfica de cómo te has sentido, de 0 (mal) a 10 (muy bien)">${g}</svg>`);
  const svg = box.querySelector("svg"), tip = $("#tip"), cross = svg.querySelector("#cross"), hot = svg.querySelector("#hot");
  const show = (ev) => {
    const r = svg.getBoundingClientRect();
    const mx = (ev.clientX - r.left) * (W / r.width);
    let best = pts[0];
    for (const p of pts) if (Math.abs(p[0] - mx) < Math.abs(best[0] - mx)) best = p;
    const e = best[2], sx = best[0] * (r.width / W), sy = best[1] * (r.height / H);
    cross.setAttribute("x1", best[0]); cross.setAttribute("x2", best[0]); cross.setAttribute("opacity", "1");
    hot.setAttribute("cx", best[0]); hot.setAttribute("cy", best[1]); hot.setAttribute("opacity", "1");
    const where = [e.donde, e.quien].filter(Boolean).map(esc).join(" · ");
    tip.innerHTML = `<b>${e.nota}</b> / 10<br>${dayLabel(e.ts)}, ${fTime.format(e.ts)}${where ? `<div class="t">${where}</div>` : ""}`;
    tip.style.left = Math.min(Math.max(sx, 90), r.width - 90) + "px";
    tip.style.top = sy + "px";
    tip.classList.add("on");
  };
  const hide = () => { tip.classList.remove("on"); cross.setAttribute("opacity", "0"); hot.setAttribute("opacity", "0"); };
  const hit = svg.querySelector("#hit");
  hit.addEventListener("pointermove", show);
  hit.addEventListener("pointerdown", show);
  hit.addEventListener("pointerleave", hide);
}
$("#rangeSeg").addEventListener("click", (ev) => {
  const b = ev.target.closest("button"); if (!b) return;
  range = b.dataset.r;
  document.querySelectorAll("#rangeSeg button").forEach((x) => x.classList.toggle("on", x === b));
  renderGrafica();
});
let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { if (current === "grafica") renderGrafica(); }, 150); });

/* ---------- Ajustes ---------- */
async function loadSettings() {
  $("#s-nombre").value = await db.getSetting("nombre", "");
  $("#s-psico").value = await db.getSetting("psicologa", "");
  const v = await appVersion();
  $("#appVersion").textContent = v ? `· versión ${v}` : "";
}
for (const [id, key] of [["#s-nombre", "nombre"], ["#s-psico", "psicologa"]]) {
  $(id).addEventListener("change", () => db.setSetting(key, $(id).value.trim()));
}

/* ---------- Navegación ---------- */
const VIEWS = ["inicio", "historial", "grafica", "ajustes"];
let current = "inicio";
function route() {
  const h = (location.hash || "").replace("#", "");
  current = VIEWS.includes(h) ? h : "inicio";
  VIEWS.forEach((v) => $("#v-" + v).classList.toggle("on", v === current));
  document.querySelectorAll("nav.bar a").forEach((a) => a.classList.toggle("on", a.dataset.v === current));
  renderAll();
  window.scrollTo(0, 0);
}
function renderAll() {
  if (current === "inicio") renderInicio();
  if (current === "historial") renderHistorial();
  if (current === "grafica") renderGrafica();
}
window.addEventListener("hashchange", route);

/* ---------- Capas (hojas y diálogo) ---------- */
const stack = [];
function openLayer(id) { const el = $(id); el.classList.add("on"); stack.push(id); document.body.style.overflow = "hidden"; }
function closeLayer(id) {
  const el = $(id); el.classList.remove("on");
  const i = stack.lastIndexOf(id); if (i >= 0) stack.splice(i, 1);
  if (!stack.length) document.body.style.overflow = "";
}
document.querySelectorAll(".overlay").forEach((o) => {
  o.addEventListener("click", (ev) => {
    if (ev.target === o && o.id !== "dlgWrap") closeLayer("#" + o.id);
    if (ev.target.closest("[data-close]")) closeLayer("#" + o.id);
  });
});

/* ---------- Hoja de registro ---------- */
let editing = null, nota = null;
const rate = $("#rate");
for (let i = 0; i <= 10; i++) rate.insertAdjacentHTML("beforeend", `<button type="button" data-n="${i}" aria-label="${i} de 10">${i}</button>`);
rate.addEventListener("click", (ev) => {
  const b = ev.target.closest("button"); if (!b) return;
  nota = parseInt(b.dataset.n, 10);
  rate.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
  $("#rateErr").classList.remove("on");
});
// Sugerencias: solo lo que la propia persona ha escrito antes.
function suggestions(field) {
  const m = new Map();
  for (const e of memory) {
    const v = (e[field] || "").trim(); if (!v) continue;
    const k = norm(v); if (!m.has(k)) m.set(k, { v, n: 0 }); m.get(k).n++;
  }
  return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 8).map((x) => x.v);
}
function renderChips(field) {
  const input = $("#f-" + field), box = $("#c-" + field), cur = norm(input.value);
  box.innerHTML = suggestions(field).map((v) => `<button type="button" class="chip${cur && norm(v) === cur ? " on" : ""}" data-v="${esc(v)}">${esc(v)}</button>`).join("");
}
for (const f of ["donde", "quien"]) {
  $("#c-" + f).addEventListener("click", (ev) => {
    const b = ev.target.closest(".chip"); if (!b) return;
    const input = $("#f-" + f);
    input.value = norm(input.value) === norm(b.dataset.v) ? "" : b.dataset.v;
    renderChips(f);
  });
  $("#f-" + f).addEventListener("input", () => renderChips(f));
}
function openEntry(id) {
  editing = id ? memory.find((e) => e.id === id) : null;
  $("#sheetTitle").textContent = editing ? "Editar registro" : "Nuevo registro";
  $("#btnDel").hidden = !editing;
  $("#f-ts").value = toLocalInput(editing ? editing.ts : Date.now());
  $("#f-donde").value = editing ? editing.donde || "" : "";
  $("#f-quien").value = editing ? editing.quien || "" : "";
  $("#f-pens").value = editing ? editing.pens || "" : "";
  $("#f-desp").value = editing ? editing.desp || "" : "";
  nota = editing ? editing.nota : null;
  rate.querySelectorAll("button").forEach((x) => x.classList.toggle("on", nota !== null && +x.dataset.n === nota));
  $("#rateErr").classList.remove("on");
  renderChips("donde"); renderChips("quien");
  openLayer("#sheetWrap");
  $("#form").scrollTop = 0;
}
$("#navPlus").addEventListener("click", () => openEntry());
document.addEventListener("click", (ev) => {
  if (ev.target.closest("[data-new]")) openEntry();
  if (ev.target.closest("[data-report]")) openReport();
  const en = ev.target.closest(".entry"); if (en) openEntry(en.dataset.id);
});
$("#form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  if (nota === null) { $("#rateErr").classList.add("on"); $("#rateErr").scrollIntoView({ block: "center", behavior: "smooth" }); return; }
  const tsVal = $("#f-ts").value;
  let ts = tsVal ? new Date(tsVal).getTime() : Date.now();
  if (isNaN(ts)) ts = Date.now();
  const data = {
    ts,
    donde: $("#f-donde").value.trim(),
    quien: $("#f-quien").value.trim(),
    pens: $("#f-pens").value.trim(),
    desp: $("#f-desp").value.trim(),
    nota,
    updated: Date.now(),
  };
  const wasEdit = !!editing;
  const entry = wasEdit ? Object.assign(editing, data) : { id: uid(), created: Date.now(), ...data };
  if (!wasEdit) memory.push(entry);
  try {
    await db.putEntry(entry);
    toast(wasEdit ? "Registro actualizado" : "Registro guardado");
  } catch (e) {
    toast("No se ha podido guardar. Inténtalo de nuevo.");
    return;
  }
  closeLayer("#sheetWrap"); editing = null; renderAll();
});

/* ---------- Diálogo de confirmación ---------- */
function confirmDlg(t, p, yes = "Borrar", danger = true) {
  $("#dlgT").textContent = t; $("#dlgP").textContent = p;
  const y = $("#dlgYes"); y.textContent = yes; y.classList.toggle("ok", !danger);
  openLayer("#dlgWrap");
  return new Promise((res) => {
    const done = (v) => { closeLayer("#dlgWrap"); y.onclick = $("#dlgNo").onclick = null; confirmDlg.cancel = null; res(v); };
    y.onclick = () => done(true);
    $("#dlgNo").onclick = () => done(false);
    confirmDlg.cancel = () => done(false);
  });
}
$("#btnDel").addEventListener("click", async () => {
  if (!editing) return;
  const id = editing.id;
  if (await confirmDlg("¿Borrar este registro?", "Se eliminará del historial, de la gráfica y de los informes.")) {
    await db.deleteEntry(id);
    memory = memory.filter((e) => e.id !== id);
    closeLayer("#sheetWrap"); editing = null; renderAll(); toast("Registro borrado");
  }
});
$("#btnWipe").addEventListener("click", async () => {
  if (!memory.length) { toast("No hay registros que borrar"); return; }
  if (await confirmDlg("¿Borrar todos los registros?", `Se eliminarán ${plural(memory.length, "registro", "registros")} de este móvil. Si no tienes una copia de seguridad, no se podrán recuperar.`, "Borrar todo")) {
    await db.clearEntries(); memory = []; renderAll(); toast("Registros borrados");
  }
});

/* ---------- Informe PDF ---------- */
let repRange = "30";
function reportPeriod() {
  const now = Date.now();
  if (repRange === "all") {
    const first = memory.length ? Math.min(...memory.map((e) => e.ts)) : now;
    return { from: startOfDay(first), to: endOfDay(now), label: "Todos los registros" };
  }
  if (repRange === "custom") {
    let a = fromDateInput($("#r-from").value), b = fromDateInput($("#r-to").value);
    if (isNaN(a) || isNaN(b)) return null;
    if (a > b) [a, b] = [b, a];
    return { from: startOfDay(a), to: endOfDay(b), label: "Periodo elegido" };
  }
  const n = parseInt(repRange, 10);
  return { from: startOfDay(now) - (n - 1) * DAY, to: endOfDay(now), label: `Últimos ${n} días` };
}
function updateRepCount() {
  const p = reportPeriod();
  $("#repErr").classList.remove("on");
  if (!p) { $("#repCount").textContent = "Elige las dos fechas."; return; }
  const n = memory.filter((e) => e.ts >= p.from && e.ts <= p.to).length;
  $("#repCount").textContent = n ? `Entrarán ${plural(n, "registro", "registros")}.` : "No hay registros en este periodo.";
}
function openReport() {
  if (!memory.length) { toast("Aún no hay registros para el informe"); return; }
  const now = Date.now();
  if (!$("#r-from").value) $("#r-from").value = toDateInput(now - 29 * DAY);
  if (!$("#r-to").value) $("#r-to").value = toDateInput(now);
  updateRepCount();
  openLayer("#reportWrap");
}
$("#repRange").addEventListener("click", (ev) => {
  const b = ev.target.closest(".opt"); if (!b) return;
  repRange = b.dataset.r;
  document.querySelectorAll("#repRange .opt").forEach((x) => x.classList.toggle("on", x === b));
  $("#repDates").hidden = repRange !== "custom";
  updateRepCount();
});
$("#r-from").addEventListener("change", updateRepCount);
$("#r-to").addEventListener("change", updateRepCount);
$("#btnMakeReport").addEventListener("click", async () => {
  const p = reportPeriod();
  const err = $("#repErr");
  if (!p) { err.textContent = "Elige las dos fechas."; err.classList.add("on"); return; }
  const list = memory.filter((e) => e.ts >= p.from && e.ts <= p.to).sort((a, b) => a.ts - b.ts);
  if (!list.length) { err.textContent = "No hay registros en este periodo."; err.classList.add("on"); return; }
  const btn = $("#btnMakeReport"), label = btn.querySelector("span"), ico = btn.querySelector("svg");
  btn.disabled = true; ico.hidden = true; btn.insertAdjacentHTML("afterbegin", '<span class="spin"></span>'); label.textContent = "Creando el informe…";
  try {
    const { blob, filename } = await buildReport({
      entries: list,
      period: p,
      includeTexts: $("#r-texts").checked,
      nombre: await db.getSetting("nombre", ""),
      psicologa: await db.getSetting("psicologa", ""),
    });
    const r = await shareFile({ blob, filename, title: "Informe de Mi registro", text: "Te envío mi informe de autorregistro." });
    if (r === "shared") { closeLayer("#reportWrap"); toast("Informe listo"); }
    if (r === "downloaded") { closeLayer("#reportWrap"); toast("Informe descargado"); }
  } catch (e) {
    console.error(e);
    err.textContent = "No se ha podido crear el informe. Inténtalo de nuevo."; err.classList.add("on");
  } finally {
    btn.disabled = false; ico.hidden = false; btn.querySelector(".spin")?.remove(); label.textContent = "Crear y compartir";
  }
});

/* ---------- Copia de seguridad ---------- */
$("#btnBackup").addEventListener("click", async () => {
  if (!memory.length) { toast("Aún no hay registros"); return; }
  const payload = {
    app: "stimulo-mi-registro", version: 1, exported: new Date().toISOString(),
    settings: { nombre: await db.getSetting("nombre", ""), psicologa: await db.getSetting("psicologa", "") },
    entries: sorted().reverse(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 1)], { type: "application/json" });
  try {
    const r = await shareFile({ blob, filename: `mi-registro-copia-${fileDate()}.json`, title: "Copia de seguridad de Mi registro" });
    if (r === "shared") toast("Copia lista. Guárdala en un sitio seguro.");
    if (r === "downloaded") toast("Copia descargada");
  } catch (e) { toast("No se ha podido crear la copia"); }
});
$("#btnRestore").addEventListener("click", () => $("#restoreFile").click());
$("#restoreFile").addEventListener("change", async (ev) => {
  const f = ev.target.files && ev.target.files[0]; ev.target.value = "";
  if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (!data || data.app !== "stimulo-mi-registro" || !Array.isArray(data.entries)) throw new Error("formato");
    const valid = data.entries.filter((e) => e && typeof e.id === "string" && Number.isFinite(e.ts) && Number.isInteger(e.nota) && e.nota >= 0 && e.nota <= 10)
      .map((e) => ({ id: e.id, ts: e.ts, donde: String(e.donde || ""), quien: String(e.quien || ""), pens: String(e.pens || ""), desp: String(e.desp || ""), nota: e.nota, created: e.created || e.ts, updated: e.updated || e.ts }));
    const known = new Set(memory.map((e) => e.id));
    const nuevos = valid.filter((e) => !known.has(e.id));
    if (!nuevos.length) { toast("Esa copia no tiene registros nuevos"); return; }
    if (!(await confirmDlg("¿Recuperar la copia?", `Se añadirán ${plural(nuevos.length, "registro", "registros")}. Los que ya tienes no se tocan.`, "Recuperar", false))) return;
    await db.putEntries(nuevos);
    memory = memory.concat(nuevos);
    if (data.settings) {
      if (!$("#s-nombre").value && data.settings.nombre) { $("#s-nombre").value = data.settings.nombre; await db.setSetting("nombre", data.settings.nombre); }
      if (!$("#s-psico").value && data.settings.psicologa) { $("#s-psico").value = data.settings.psicologa; await db.setSetting("psicologa", data.settings.psicologa); }
    }
    renderAll(); toast(`Recuperados ${plural(nuevos.length, "registro", "registros")}`);
  } catch (e) {
    toast("Ese archivo no es una copia válida de Mi registro");
  }
});

/* ---------- Botón atrás (Android) ---------- */
onBack(() => {
  if (stack.length) {
    const top = stack[stack.length - 1];
    if (top === "#dlgWrap" && confirmDlg.cancel) confirmDlg.cancel(); else closeLayer(top);
    return true;
  }
  if (current !== "inicio") { location.hash = "#inicio"; return true; }
  return false;
});

/* ---------- Aviso para instalar en iPhone (solo versión web) ---------- */
function iosTip() {
  const ua = navigator.userAgent || "";
  const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  let dismissed = false;
  try { dismissed = sessionStorage.getItem("iosTipX") === "1"; } catch (e) {}
  if (isNative || !ios || standalone || dismissed) return;
  $("#iosTip").hidden = false;
  $("#iosTipX").addEventListener("click", () => {
    $("#iosTip").hidden = true;
    try { sessionStorage.setItem("iosTipX", "1"); } catch (e) {}
  });
}

/* ---------- Arranque ---------- */
(async function start() {
  if (isNative) document.documentElement.classList.add("native");
  setupNative();
  db.askPersist();
  try { memory = await db.allEntries(); } catch (e) { memory = []; }
  await loadSettings();
  route();
  iosTip();
  if (!isNative && "serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
