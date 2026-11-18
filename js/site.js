/* Pinta la portada y la ficha de cada app a partir de js/apps.js */
(function () {
  "use strict";
  const S = window.SITE, APPS = window.APPS || [];
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fDate = (iso) => { if (!iso) return ""; const [y, m, d] = iso.split("-").map(Number); return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(new Date(y, m - 1, d)); };

  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const device = isIOS ? "ios" : isAndroid ? "android" : "desktop";

  const ICO = {
    android: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 9.48l1.84-3.18a.38.38 0 0 0-.66-.38l-1.86 3.22a11.5 11.5 0 0 0-9.84 0L5.22 5.92a.38.38 0 0 0-.66.38L6.4 9.48A10.8 10.8 0 0 0 1 18h22a10.8 10.8 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/></svg>',
    apple: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.77-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.27-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.65zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.58.67-1.1 1.76-.96 2.8 1.02.08 2.06-.52 2.69-1.28z"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
    open: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2.8v18.4c0 .5.5.8 1 .6l11.2-9.2c.4-.3.4-.9 0-1.2L5 2.2c-.5-.2-1 .1-1 .6z"/></svg>',
    share: '<svg class="ios-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>',
    addhome: '<svg class="ios-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
    chev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  };

  const iconHTML = (a) => `<div class="icon"><span class="ph">${esc(a.name.charAt(0))}</span>${a.icon ? `<img src="${esc(a.icon)}" alt="" onerror="this.remove()">` : ""}</div>`;
  const hasAndroid = (a) => !!(a.android && (a.android.apk || a.android.play));
  const hasIOS = (a) => !!(a.ios && (a.ios.web || a.ios.appStore));
  function badges(a) {
    const b = [];
    if (a.status === "soon") b.push('<span class="badge gray">Próximamente</span>');
    if (a.status === "beta") b.push('<span class="badge">En pruebas</span>');
    if (hasAndroid(a)) b.push('<span class="badge gray">Android</span>');
    if (hasIOS(a)) b.push('<span class="badge gray">iPhone</span>');
    return `<div class="badges">${b.join("")}</div>`;
  }
  const appStyle = (a) => `--app:${a.color || "var(--accent)"};--app-tint:${a.tint || "var(--accent-soft)"}`;

  function chrome() {
    document.querySelectorAll("[data-owner]").forEach((el) => (el.textContent = S.owner));
    document.querySelectorAll("[data-mono]").forEach((el) => (el.textContent = S.owner.charAt(0)));
    document.querySelectorAll("[data-sitetitle]").forEach((el) => (el.textContent = S.title));
    const y = $("#year"); if (y) y.textContent = new Date().getFullYear();
    const c = $("#contact");
    if (c) c.innerHTML = S.contactEmail ? `Contacto: <a href="mailto:${esc(S.contactEmail)}">${esc(S.contactEmail)}</a>` : "";
  }

  /* ---------- Portada ---------- */
  function renderHome() {
    $("#tagline").textContent = S.tagline;
    $("#aboutText").textContent = S.about;
    $("#apps").innerHTML = APPS.map((a) => `
      <a class="card" href="app.html?id=${encodeURIComponent(a.id)}" style="${appStyle(a)}">
        <div class="head">${iconHTML(a)}<div><h3>${esc(a.name)}</h3><div class="by">${esc(a.by)}</div></div></div>
        <p>${esc(a.short)}</p>
        <div class="foot">${badges(a)}<span class="go">Ver ${ICO.chev}</span></div>
      </a>`).join("");
  }

  /* ---------- Ficha ---------- */
  function qrSVG(text) {
    if (typeof window.qrcode !== "function") return "";
    const q = window.qrcode(0, "M"); q.addData(text); q.make();
    return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  }

  function androidBlock(a) {
    const A = a.android, rows = [];
    if (A.play) rows.push(`<a class="btn" href="${esc(A.play)}" rel="noopener">${ICO.play}Descargar en Google Play</a>`);
    if (A.apk) rows.push(`<a class="btn ${A.play ? "alt" : ""}" href="${esc(A.apk)}" download>${ICO.download}<span>Descargar APK${A.size ? ` <small>· ${esc(A.size)}</small>` : ""}</span></a>`);
    let steps = "";
    if (A.apk && !A.play) steps = `<ol class="steps">
        <li><span>Pulsa <b>Descargar APK</b> y abre el archivo cuando termine.</span></li>
        <li><span>Si te lo pide, permite <b>«Instalar aplicaciones desconocidas»</b> para tu navegador y vuelve atrás.</span></li>
        <li><span>Si aparece un aviso de Play Protect, pulsa <b>Más detalles → Instalar de todas formas</b>. Sale porque la app no viene de Google Play.</span></li>
      </ol>`;
    return `<div class="plat"><h3>${ICO.android}Android</h3>${rows.join("")}${steps}</div>`;
  }
  function iosBlock(a) {
    const I = a.ios, rows = [];
    if (I.appStore) rows.push(`<a class="btn" href="${esc(I.appStore)}" rel="noopener">${ICO.apple}Descargar en la App Store</a>`);
    if (I.web) rows.push(`<a class="btn ${I.appStore ? "alt" : ""}" href="${esc(I.web)}">${ICO.open}Abrir la versión para iPhone</a>`);
    let steps = "";
    if (I.web && !I.appStore) steps = `<ol class="steps">
        <li><span>Ábrela con <b>Safari</b> (no desde Instagram, WhatsApp ni otro navegador).</span></li>
        <li><span>Pulsa el botón <b>Compartir</b> ${ICO.share} de la barra de Safari.</span></li>
        <li><span>Elige <b>Añadir a pantalla de inicio</b> ${ICO.addhome} y pulsa <b>Añadir</b>.</span></li>
        ${I.keepsData ? `<li><span>Ábrela siempre desde ese icono: ahí se guardan tus datos.</span></li>` : ""}
      </ol>`;
    return `<div class="plat"><h3>${ICO.apple}iPhone</h3>${rows.join("")}${steps}</div>`;
  }

  function renderApp() {
    const id = new URLSearchParams(location.search).get("id");
    const a = APPS.find((x) => x.id === id);
    const main = $("#app");
    if (!a) { main.innerHTML = `<div class="box"><h2>No encontramos esa app</h2><p><a href="./">Ver todas las apps</a></p></div>`; return; }
    document.title = `${a.name} · ${S.title}`;
    document.body.setAttribute("style", appStyle(a));

    // Caja de instalación según el dispositivo
    let install = "";
    if (a.status === "soon" || (!hasAndroid(a) && !hasIOS(a))) {
      install = `<div class="box soon"><b>Próximamente</b><p>Estamos terminando esta app. Vuelve pronto.</p></div>`;
    } else {
      const blocks = { android: hasAndroid(a) ? androidBlock(a) : "", ios: hasIOS(a) ? iosBlock(a) : "" };
      let first = "", rest = "";
      if (device === "desktop") {
        const url = location.href;
        first = `<div class="qr"><div class="code">${qrSVG(url)}</div><p><b>Escanéalo con la cámara del móvil</b> para abrir esta página y descargarla allí.</p></div>${blocks.android}${blocks.ios}`;
      } else {
        first = blocks[device] || "";
        rest = device === "android" ? blocks.ios : blocks.android;
        if (!first) { first = blocks.android + blocks.ios; rest = ""; }
      }
      install = `<div class="box"><h2>Instálala</h2>${first}
        ${rest ? `<button class="more" id="moreBtn">¿Otro móvil? Ver ${device === "android" ? "iPhone" : "Android"}</button><div id="moreBox" hidden>${rest}</div>` : ""}
        ${a.status === "beta" ? `<p class="note">Versión de pruebas: puede tener cambios antes de la versión definitiva.</p>` : ""}
      </div>`;
    }

    const info = [
      a.version && ["Versión", esc(a.version)],
      a.updated && ["Actualizada", fDate(a.updated)],
      ["Desarrollo", esc(S.owner)],
      a.by && ["Para", esc(a.by)],
      a.android && a.android.size && ["Tamaño (Android)", esc(a.android.size)],
      a.android && a.android.sha256 && ["Huella SHA-256 del APK", `<span class="hash">${esc(a.android.sha256)}</span>`],
    ].filter(Boolean);

    main.innerHTML = `
      <a class="back" href="./">‹ Todas las apps</a>
      <div class="app-head">${iconHTML(a)}<div><h1>${esc(a.name)}</h1><div class="by">${esc(a.by)}</div>${badges(a)}</div></div>
      <div class="layout">
        <div>
          <div class="box">
            ${a.description.map((p, i) => `<p class="${i === 0 ? "lead" : ""}">${esc(p)}</p>`).join("")}
            ${a.features && a.features.length ? `<ul class="feat">${a.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
          </div>
          ${a.screenshots && a.screenshots.length ? `<div class="box"><h2>Capturas</h2><div class="shots">${a.screenshots.map((s, i) => `<img src="${esc(s)}" alt="Captura ${i + 1} de ${esc(a.name)}" loading="lazy" onerror="this.remove()">`).join("")}</div></div>` : ""}
          ${a.changelog && a.changelog.length ? `<div class="box"><h2>Novedades${a.version ? ` de la versión ${esc(a.version)}` : ""}</h2><ul class="feat">${a.changelog.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>` : ""}
          <div class="box"><h2>Información</h2><table class="info">${info.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>
            ${a.privacy ? `<a class="privacy-link" href="${esc(a.privacy)}">Política de privacidad</a>` : ""}</div>
        </div>
        <aside class="install">${install}</aside>
      </div>`;

    const mb = $("#moreBtn");
    if (mb) mb.addEventListener("click", () => { $("#moreBox").hidden = false; mb.remove(); });
  }

  chrome();
  if (document.body.dataset.page === "home") renderHome();
  if (document.body.dataset.page === "app") renderApp();
})();
