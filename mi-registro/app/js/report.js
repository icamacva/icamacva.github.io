// Informe en PDF para la psicóloga (jsPDF, todo se genera en el móvil).
import { DAY, nf1, fLong, fTime, fNum, fShort, startOfDay, franja, FRANJAS, groupAvg, avg, daysBetween, plural, fileDate, norm } from "./util.js";

// Paleta de Stímulo
const C = {
  brand: [110, 163, 119], strong: [69, 122, 79], soft: [214, 232, 180], tint: [238, 245, 227],
  ink: [46, 58, 43], ink2: [76, 91, 72], muted: [122, 134, 118], line: [226, 231, 218], grid: [233, 237, 226], white: [255, 255, 255],
};
const PAGE = { w: 210, h: 297, m: 16 };
const CW = PAGE.w - 2 * PAGE.m;          // ancho útil
const BOTTOM = PAGE.h - 20;              // límite antes del pie

/* ---------- Carga de recursos ---------- */
function bufToB64(buf) {
  const bytes = new Uint8Array(buf); let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
async function fetchB64(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("No se pudo cargar " + url);
  return bufToB64(await r.arrayBuffer());
}
let cache = null;
async function assets() {
  if (cache) return cache;
  const out = { font: null, logo: null, mark: null };
  try {
    const [reg, bold] = await Promise.all([fetchB64("fonts/Figtree_400Regular.ttf"), fetchB64("fonts/Figtree_700Bold.ttf")]);
    out.font = { reg, bold };
  } catch (e) { /* se usará Helvetica */ }
  try { out.logo = "data:image/png;base64," + (await fetchB64("img/logo-pdf.png")); } catch (e) {}
  try { out.mark = "data:image/png;base64," + (await fetchB64("img/logo-mark-pdf.png")); } catch (e) {}
  cache = out;
  return out;
}

// Quita emojis y símbolos que la tipografía no puede dibujar.
const clean = (s) => String(s || "")
  .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "")
  .replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();

export async function buildReport({ entries, period, includeTexts, nombre, psicologa }) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const A = await assets();
  let FONT = "helvetica";
  if (A.font) {
    doc.addFileToVFS("Figtree-Regular.ttf", A.font.reg);
    doc.addFileToVFS("Figtree-Bold.ttf", A.font.bold);
    doc.addFont("Figtree-Regular.ttf", "Figtree", "normal");
    doc.addFont("Figtree-Bold.ttf", "Figtree", "bold");
    FONT = "Figtree";
  }
  doc.setProperties({ title: "Informe de autorregistro", subject: "Mi registro · Stímulo Centro de Psicología", creator: "Mi registro" });
  doc.setLineHeightFactor(1.3);

  /* ---------- Ayudas de dibujo ---------- */
  const font = (size, bold = false, color = C.ink) => { doc.setFont(FONT, bold ? "bold" : "normal"); doc.setFontSize(size); doc.setTextColor(...color); };
  const fill = (c) => doc.setFillColor(...c);
  const stroke = (c, w = 0.3) => { doc.setDrawColor(...c); doc.setLineWidth(w); };
  const T = (s, x, y, o = {}) => doc.text(String(s), x, y, o);
  const lh = (size) => size * 0.3528 * 1.3;          // alto de línea en mm
  const fit = (s, w) => {                             // recorta con «…» para que quepa en w
    s = clean(s); if (doc.getTextWidth(s) <= w) return s;
    while (s.length > 1 && doc.getTextWidth(s + "…") > w) s = s.slice(0, -1);
    return s + "…";
  };
  let y = PAGE.m;
  const newPage = () => { doc.addPage(); y = PAGE.m + 14; };
  const ensure = (h) => { if (y + h > BOTTOM) { newPage(); return true; } return false; };
  const sectionTitle = (title, sub) => {
    ensure(sub ? 16 : 11);
    font(12.5, true); T(title, PAGE.m, y + 4.5);
    y += 7;
    if (sub) { font(8.5, false, C.muted); T(sub, PAGE.m, y + 2); y += 5.5; }
    y += 1.5;
  };

  /* ---------- Datos del periodo ---------- */
  const n = entries.length;
  const nDays = daysBetween(period.from, period.to) + 1;
  const daysWith = new Set(entries.map((e) => startOfDay(e.ts))).size;
  const media = avg(entries);
  const notas = entries.map((e) => e.nota);
  const minN = Math.min(...notas), maxN = Math.max(...notas);
  const generated = Date.now();

  /* ---------- Cabecera de la primera página ---------- */
  if (A.logo) doc.addImage(A.logo, "PNG", PAGE.m, y - 2, 44, 44 * 680 / 885, "logo", "FAST");
  font(19, true); T("Informe de autorregistro", PAGE.w - PAGE.m, y + 10, { align: "right" });
  font(10, false, C.ink2); T("Mi registro", PAGE.w - PAGE.m, y + 16.5, { align: "right" });
  font(9, false, C.muted); T(`Creado el ${fLong.format(generated)} a las ${fTime.format(generated)}`, PAGE.w - PAGE.m, y + 22, { align: "right" });
  y += 40;
  stroke(C.soft, 0.8); doc.line(PAGE.m, y, PAGE.w - PAGE.m, y);
  y += 7;

  // Ficha
  const ficha = [
    ["Paciente", clean(nombre) || "Sin indicar"],
    ["Psicóloga/o", clean(psicologa) || "Sin indicar"],
    ["Periodo", `${fLong.format(period.from)} – ${fLong.format(period.to)} (${plural(nDays, "día", "días")})`],
  ];
  for (const [k, v] of ficha) {
    font(9.5, false, C.muted); T(k, PAGE.m, y);
    font(10.5, true, C.ink); T(fit(v, CW - 32), PAGE.m + 32, y);
    y += 6;
  }
  y += 3;

  // Resumen en 4 recuadros
  const tiles = [
    [String(n), n === 1 ? "registro" : "registros"],
    [`${daysWith}`, `de ${plural(nDays, "día", "días")} con registro`],
    [`${nf1.format(media)}`, "media de cómo se sintió (0-10)"],
    [`${minN} – ${maxN}`, "valoración más baja y más alta"],
  ];
  const gap = 4, tw = (CW - gap * 3) / 4, th = 23;
  tiles.forEach(([v, k], i) => {
    const x = PAGE.m + i * (tw + gap);
    fill(C.tint); doc.roundedRect(x, y, tw, th, 3, 3, "F");
    font(17, true, C.strong); T(v, x + 4, y + 10);
    font(8, false, C.ink2); doc.text(doc.splitTextToSize(k, tw - 8), x + 4, y + 15.5);
  });
  y += th + 10;

  /* ---------- Gráfica ---------- */
  sectionTitle("Cómo se ha sentido a lo largo del periodo", "Cada punto es un registro. Escala de 0 (mal) a 10 (muy bien).");
  {
    const ch = 58, x0p = PAGE.m + 8, x1p = PAGE.w - PAGE.m - 2, y0p = y + 2, y1p = y + ch - 8;
    const tx0 = period.from, tx1 = Math.max(period.to, tx0 + DAY);
    const X = (t) => x0p + ((t - tx0) / (tx1 - tx0)) * (x1p - x0p);
    const Y = (v) => y1p - (v / 10) * (y1p - y0p);
    font(7.5, false, C.muted);
    for (const v of [0, 2, 4, 6, 8, 10]) {
      stroke(v === 0 ? C.line : C.grid, v === 0 ? 0.35 : 0.2); doc.line(x0p, Y(v), x1p, Y(v));
      T(String(v), x0p - 2.5, Y(v) + 1, { align: "right" });
    }
    const nT = Math.min(7, Math.max(2, nDays));
    for (let i = 0; i < nT; i++) {
      const t = tx0 + ((tx1 - tx0) * i) / (nT - 1);
      const align = i === 0 ? "left" : i === nT - 1 ? "right" : "center";
      T(fShort.format(t).replace(".", ""), i === 0 ? x0p : i === nT - 1 ? x1p : X(t), y1p + 5, { align });
    }
    const pts = entries.map((e) => [X(e.ts), Y(e.nota)]);
    stroke(C.brand, 0.55); doc.setLineJoin("round"); doc.setLineCap("round");
    for (let i = 1; i < pts.length; i++) doc.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]);
    const r = pts.length > 90 ? 0.55 : 0.95;
    fill(C.strong); stroke(C.white, 0.35);
    for (const [px, py] of pts) doc.circle(px, py, r, "FD");
    // media del periodo
    stroke(C.muted, 0.25); doc.setLineDashPattern([1, 1], 0); doc.line(x0p, Y(media), x1p, Y(media)); doc.setLineDashPattern([], 0);
    font(7.5, false, C.ink2); T(`media ${nf1.format(media)}`, x1p, Y(media) - 1.2, { align: "right" });
    y += ch + 4;
  }

  /* ---------- Desgloses ---------- */
  const bars = (title, groups, limit = 8) => {
    if (!groups.length) return;
    const rows = groups.slice(0, limit);
    ensure(16 + rows.length * 7 + (groups.length > limit ? 5 : 0));
    sectionTitle(title, "Media de cómo se sintió (0-10) y número de registros.");
    const labW = 52, trackX = PAGE.m + labW + 2, trackW = CW - labW - 2 - 30, rowH = 7;
    for (const g of rows) {
      ensure(rowH);
      font(9.5, false, C.ink); T(fit(g.label, labW - 2), PAGE.m, y + 3.6);
      fill(C.grid); doc.roundedRect(trackX, y + 0.8, trackW, 3.6, 1.2, 1.2, "F");
      fill(C.brand); doc.roundedRect(trackX, y + 0.8, Math.max(1.5, trackW * g.avg / 10), 3.6, 1.2, 1.2, "F");
      font(9.5, true, C.ink); const vt = nf1.format(g.avg); T(vt, PAGE.w - PAGE.m - 12, y + 3.6, { align: "right" });
      font(8.5, false, C.muted); T(`(${g.n})`, PAGE.w - PAGE.m, y + 3.6, { align: "right" });
      y += rowH;
    }
    if (groups.length > limit) { font(8, false, C.muted); T(`Y ${groups.length - limit} más con menos registros (ver el detalle).`, PAGE.m, y + 2.5); y += 5; }
    y += 5;
  };
  bars("Según el momento del día", groupAvg(entries, (e) => franja(e.ts), FRANJAS));
  bars("Según dónde estaba", groupAvg(entries, (e) => e.donde));
  bars("Según con quién estaba", groupAvg(entries, (e) => e.quien));

  // Valoraciones más bajas
  {
    const low = entries.slice().sort((a, b) => a.nota - b.nota || a.ts - b.ts).slice(0, Math.min(5, n));
    ensure(16 + low.length * 7);
    sectionTitle("Valoraciones más bajas del periodo", `Los ${low.length === 1 ? "registro" : low.length + " registros"} con la nota más baja.`);
    for (const e of low) {
      ensure(7);
      fill(C.tint); doc.roundedRect(PAGE.m, y, 11, 5.6, 1.5, 1.5, "F");
      font(9.5, true, C.strong); T(String(e.nota), PAGE.m + 5.5, y + 4, { align: "center" });
      font(9.5, false, C.ink);
      const where = [e.donde, e.quien].map(clean).filter(Boolean).join(" · ");
      T(fit(`${fNum.format(e.ts)}, ${fTime.format(e.ts)} (${franja(e.ts).toLowerCase()})${where ? " — " + where : ""}`, CW - 14), PAGE.m + 14, y + 4);
      y += 7;
    }
    y += 4;
  }

  /* ---------- Detalle de todos los registros ---------- */
  y += 4;
  ensure(16 + 9 + 30);
  sectionTitle("Detalle de los registros", `${plural(n, "registro", "registros")}, del más antiguo al más reciente.`);
  const cols = [
    { k: "Fecha y hora", w: 30 }, { k: "Momento", w: 22 }, { k: "Dónde", w: 52 }, { k: "Con quién", w: 52 }, { k: "Nota", w: CW - 156, align: "center" },
  ];
  const tableHead = () => {
    fill(C.strong); doc.roundedRect(PAGE.m, y, CW, 7, 1.5, 1.5, "F");
    font(8.5, true, C.white);
    let x = PAGE.m;
    for (const c of cols) { T(c.k, c.align === "center" ? x + c.w / 2 : x + 2.5, y + 4.7, c.align === "center" ? { align: "center" } : {}); x += c.w; }
    y += 9;
  };
  tableHead();
  const textBlock = (label, text) => {
    font(9, false, C.ink);
    const lines = doc.splitTextToSize(clean(text), CW - 12);
    const lineH = lh(9);
    ensure(lineH * Math.min(lines.length, 3) + 6) && tableHead();
    font(8, true, C.strong); T(label, PAGE.m + 4, y + 3); y += 4.6;
    font(9, false, C.ink);
    for (const ln of lines) {
      if (ensure(lineH)) { tableHead(); font(9, false, C.ink); }
      T(ln, PAGE.m + 4, y + 3); y += lineH;
    }
    y += 1.5;
  };
  entries.forEach((e, idx) => {
    font(9, false, C.ink);
    const cells = [
      [fNum.format(e.ts), fTime.format(e.ts)],
      [franja(e.ts)],
      doc.splitTextToSize(clean(e.donde) || "—", cols[2].w - 5),
      doc.splitTextToSize(clean(e.quien) || "—", cols[3].w - 5),
    ];
    const lines = Math.max(...cells.map((c) => c.length));
    const rowH = Math.max(9, lines * lh(9) + 4);
    const hasT = includeTexts && (clean(e.pens) || clean(e.desp));
    if (ensure(rowH + (hasT ? 12 : 0))) tableHead();
    if (idx % 2 === 0) { fill(C.tint); doc.rect(PAGE.m, y - 1, CW, rowH + (hasT ? 0 : 0), "F"); }
    let x = PAGE.m;
    cells.forEach((c, i) => {
      font(9, i === 0, i === 1 ? C.ink2 : C.ink);
      c.forEach((ln, j) => T(ln, x + 2.5, y + 3.6 + j * lh(9)));
      x += cols[i].w;
    });
    // nota
    const nx = x + cols[4].w / 2;
    fill(C.white); stroke(C.brand, 0.35); doc.roundedRect(nx - 6, y + 0.3, 12, 6, 1.6, 1.6, "FD");
    font(10, true, C.strong); T(String(e.nota), nx, y + 4.6, { align: "center" });
    y += rowH;
    if (hasT) {
      if (clean(e.pens)) textBlock("Qué pensó", e.pens);
      if (clean(e.desp)) textBlock("Qué pasó después", e.desp);
      y += 1;
    }
    stroke(C.line, 0.2); doc.line(PAGE.m, y - 0.5, PAGE.w - PAGE.m, y - 0.5);
    y += 1.5;
  });

  /* ---------- Cabeceras y pies de página ---------- */
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    if (i > 1) {
      if (A.mark) doc.addImage(A.mark, "PNG", PAGE.m, 9, 7, 7 * 380 / 390, "mark", "FAST");
      font(8.5, true, C.ink2); T("Informe de autorregistro" + (clean(nombre) ? " · " + fit(nombre, 70) : ""), PAGE.m + 9.5, 13.6);
      font(8.5, false, C.muted); T(`${fNum.format(period.from)} – ${fNum.format(period.to)}`, PAGE.w - PAGE.m, 13.6, { align: "right" });
      stroke(C.line, 0.3); doc.line(PAGE.m, 18, PAGE.w - PAGE.m, 18);
    }
    stroke(C.line, 0.3); doc.line(PAGE.m, PAGE.h - 14, PAGE.w - PAGE.m, PAGE.h - 14);
    font(7.5, false, C.muted);
    T("Stímulo · Centro de Psicología — Documento confidencial con datos personales de salud.", PAGE.m, PAGE.h - 9.5);
    T(`Página ${i} de ${pages}`, PAGE.w - PAGE.m, PAGE.h - 9.5, { align: "right" });
  }

  const slug = norm(nombre).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const filename = `informe-mi-registro${slug ? "-" + slug : ""}-${fileDate()}.pdf`;
  return { blob: doc.output("blob"), filename };
}
