# Mis aplicaciones: web de descarga

Web estática (HTML, CSS y JS, sin nada que compilar) para publicar tus apps:

- **Portada** con todas las apps (`index.html`).
- **Ficha de cada app** (`app.html?id=...`). Detecta el móvil: en Android enseña primero la descarga del APK, en iPhone la versión web con los pasos para añadirla a la pantalla de inicio, y en el ordenador un código QR.
- **La versión para iPhone de Mi registro** está dentro, en `mi-registro/app/`.

Todo se configura en **`js/apps.js`**.

## Subirla gratis a GitHub Pages (sin usar git)

1. Entra en github.com con tu cuenta (o créala).
2. **New repository**. Ponle de nombre **`TUUSUARIO.github.io`**, cambiando TUUSUARIO por tu nombre de usuario exacto. Márcalo como **Public** y pulsa *Create repository*.
3. En el repositorio vacío, pulsa **uploading an existing file**. Arrastra **todo el contenido** de esta carpeta (no la carpeta en sí): `index.html`, `app.html`, `css/`, `js/`, `apps/`, `mi-registro/`, `descargas/`, `fonts/`, `img/` y `.nojekyll`. Pulsa *Commit changes*.
   - El archivo `.nojekyll` está oculto: actívalo en tu explorador de archivos (en Windows, *Vista → Elementos ocultos*). Si no lo subes, no pasa nada grave.
4. Ve a **Settings → Pages**. En *Source* elige **Deploy from a branch**, rama **main** y carpeta **/ (root)**. Pulsa *Save*.
5. En uno o dos minutos la web estará en **https://TUUSUARIO.github.io**.

Direcciones útiles una vez publicada:

- Ficha de Mi registro: `https://TUUSUARIO.github.io/app.html?id=mi-registro`, que es la que debe mandar la psicóloga.
- Versión iPhone: `https://TUUSUARIO.github.io/mi-registro/app/`
- Política de privacidad, para Google Play: `https://TUUSUARIO.github.io/mi-registro/app/privacidad.html`

## Subir el APK de Mi registro

1. Cambia el nombre de tu APK firmado a **`MiRegistro-Stimulo-1.0.apk`**.
2. En GitHub, entra en la carpeta `descargas/`, pulsa **Add file → Upload files**, súbelo y haz *Commit*.
3. Opcional: en `js/apps.js` pon el tamaño (`size: "5 MB"`) y la huella SHA-256. Para sacar la huella en Windows (PowerShell):
   ```
   Get-FileHash -Algorithm SHA256 .\MiRegistro-Stimulo-1.0.apk
   ```

Para editar un archivo directamente en GitHub, ábrelo, pulsa el lápiz ✏️ y luego *Commit changes*.

## Añadir una app nueva

1. En `js/apps.js`, copia un bloque `{ ... }` de la lista `APPS` y cambia los datos (`id`, `name`, `short`, colores…).
2. Sube su icono (cuadrado, 512×512) a `apps/<id>/icon.png` y las capturas a `apps/<id>/captura-1.png`, etc.
3. Sube el APK a `descargas/`.
4. Con `status: "soon"` sale como «Próximamente»; con `"beta"`, como «En pruebas»; con `"ok"`, normal.
5. Cuando esté en Google Play, pon el enlace en `android.play` y el botón principal pasa a ser el de Google Play.

## Versión iPhone de Farmacias Guardia

Está en `farmacias/app/` y es una copia de la carpeta `www` del proyecto de farmacias, con lo necesario para instalarla desde Safari (`manifest.webmanifest`, `sw.js` e iconos). Si cambias el calendario o las farmacias en el proyecto, copia de nuevo `index.html`, `assets/` y `fonts/` y sube el número de `VERSION` en `farmacias/app/sw.js`. Ojo: al copiar `index.html` se pierden las líneas añadidas para el iPhone (las de `manifest`, `apple-touch-icon` y el registro de `sw.js`), así que vuelve a ponerlas o pídeme que lo haga.

## Actualizar la versión iPhone de Mi registro

1. Copia el contenido de `www/` del proyecto `stimulo-mi-registro` dentro de `mi-registro/app/`, sustituyendo lo que haya.
2. En `mi-registro/app/sw.js`, sube el número de `VERSION` (por ejemplo `mi-registro-v1.0.1`). Si no lo cambias, los iPhone seguirán con la versión anterior guardada.

## Notas

- Los APK que bajen desde aquí siguen mostrando los avisos de Android de «origen desconocido». Es así para cualquier APK que no venga de Google Play.
- No subas **nunca** el archivo `.jks` ni sus contraseñas a GitHub: el repositorio es público.
- Dominio propio (opcional): en *Settings → Pages → Custom domain* puedes poner uno tuyo si lo compras.
