/* ============================================================
   DATOS DE LA WEB Y DE LAS APPS
   Para añadir una app nueva: copia un bloque { ... } de la lista
   APPS, cambia los datos y sube su icono a apps/<id>/icon.png.
   Para publicar una versión nueva: sube el APK a descargas/ y
   cambia version, updated, android.apk (y android.sha256).
   ============================================================ */

window.SITE = {
  owner: "Nacho",
  title: "Mis aplicaciones",
  tagline: "Apps sencillas y útiles para el día a día. Descárgalas gratis para Android o úsalas en el iPhone.",
  about: "Desarrollador de aplicaciones desde 2011. Técnico Superior en Desarrollo de Aplicaciones Multiplataforma.",
  contactEmail: "",        // p. ej. "nacho@tucorreo.com" (opcional)
};

window.APPS = [
  {
    id: "mi-registro",
    name: "Mi registro",
    by: "Stímulo · Centro de Psicología",
    status: "beta",                       // "ok", "beta" o "soon"
    icon: "apps/mi-registro/icon.png",
    color: "#457A4F",                     // color de la app
    tint: "#EEF5E3",                      // fondo suave de la app
    short: "Autorregistro para pacientes: apunta cómo te sientes y envía un informe en PDF a tu psicóloga.",
    description: [
      "Mi registro sustituye a la hoja de autorregistro en papel. Cada vez que notas algo, apuntas cuándo fue, dónde estabas, con quién, qué pensaste, qué pasó después y cómo te sentiste del 0 al 10.",
      "La app te enseña tu evolución en una gráfica y crea un informe en PDF para llevar a consulta o enviárselo a tu psicóloga por correo o WhatsApp.",
    ],
    features: [
      "Registro rápido, sin opciones impuestas: escribes con tus palabras",
      "Gráfica de cómo te has sentido a lo largo del tiempo",
      "Informe en PDF detallado para tu psicóloga",
      "Tus datos se guardan solo en tu móvil: sin cuentas ni servidores",
      "Copia de seguridad para cambiar de teléfono",
    ],
    version: "1.0",
    updated: "2026-11-18",
    changelog: ["Primera versión de prueba."],
    android: {
      apk: "descargas/MiRegistro-Stimulo-1.0.apk",   // sube aquí el APK con este nombre
      size: "",                                      // p. ej. "5 MB"
      sha256: "",                                    // huella del APK (opcional, ver README)
      play: "",                                      // enlace de Google Play cuando esté publicada
    },
    ios: {
      web: "mi-registro/app/",                       // versión para iPhone (navegador)
      appStore: "",
    },
    privacy: "mi-registro/app/privacidad.html",
    screenshots: [
      "apps/mi-registro/captura-1.png",
      "apps/mi-registro/captura-2.png",
      "apps/mi-registro/captura-3.png",
    ],
  },
  {
    id: "farmacias-guardia",
    name: "Farmacias de Guardia",
    by: "Los Santos de Maimona",
    status: "soon",
    icon: "",                                        // apps/farmacias-guardia/icon.png cuando lo tengas
    color: "#2B6CB0",
    tint: "#E8F0FA",
    short: "Consulta de un vistazo qué farmacia está de guardia hoy en nuestro pueblo.",
    description: [
      "La farmacia de guardia de hoy, a un toque.",
    ],
    features: [],
    version: "",
    updated: "",
    changelog: [],
    android: { apk: "", size: "", sha256: "", play: "" },
    ios: { web: "", appStore: "" },
    privacy: "",
    screenshots: [],
  },
];
