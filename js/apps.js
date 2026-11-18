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
      apk: "descargas/MiRegistro-Stimulo-1.0.apk",
      size: "5,6 MB",
      sha256: "7e75c2b34a66db6b487bdb5ac43b18a01c07a051116bc6019fd3c9379cd6a71d",
      play: "",                                      // enlace de Google Play cuando esté publicada
    },
    ios: {
      web: "mi-registro/app/",                       // versión para iPhone (navegador)
      keepsData: true,                               // guarda datos en el móvil (muestra el aviso de abrirla desde el icono)
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
    name: "Farmacias Guardia Los Santos",
    by: "Los Santos de Maimona",
    status: "beta",
    icon: "apps/farmacias-guardia/icon.png",
    color: "#006845",
    tint: "#E3F4EC",
    short: "La farmacia de guardia de hoy en Los Santos de Maimona, con dirección, teléfono y llamada con un toque.",
    description: [
      "Abre la app y consulta en segundos qué farmacia está de guardia hoy en nuestro pueblo: nombre, dirección y teléfono, con un botón para llamar directamente.",
      "Las farmacias de la localidad se turnan cada semana y el cambio de guardia es los viernes a las 9:00. El calendario es orientativo: ante cualquier duda, confirma por teléfono con la farmacia. Es una aplicación independiente y no oficial.",
    ],
    features: [
      "La farmacia de guardia de esta semana, la anterior y las siguientes",
      "Llamada a la farmacia con un solo toque",
      "Funciona sin conexión a internet (en iPhone, después de abrirla la primera vez)",
      "Sin registro ni permisos",
      "No recoge ni comparte datos personales",
      "Tema claro u oscuro",
    ],
    version: "1.0",
    updated: "",
    changelog: ["Primera versión: la farmacia de guardia de esta semana, la anterior y la siguiente, con dirección y teléfono."],
    android: {
      apk: "descargas/FarmaciasGuardia-LosSantos-1.0.apk",
      size: "4,4 MB",
      sha256: "bebe4792de8d5215f3a8254cf27c5b40cd6c7c5994b74736b98add8db77081e0",
      play: "",                                              // enlace de Google Play cuando salga a producción
    },
    ios: { web: "farmacias/app/", appStore: "" },
    privacy: "https://sites.google.com/view/farmacias-guardia-privacidad",
    screenshots: [
      "apps/farmacias-guardia/captura-1.png",
      "apps/farmacias-guardia/captura-2.png",
      "apps/farmacias-guardia/captura-3.png",
      "apps/farmacias-guardia/captura-4.png",
    ],
  },
];
