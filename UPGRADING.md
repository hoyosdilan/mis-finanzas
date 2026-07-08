# Actualizar una instancia existente (clonada antes de julio 2026)

Guía para instancias que se clonaron **antes** del refactor de producto
(PRs #53–#56, 2026-07-07) y ya tienen la app funcionando contra su propio
proyecto de Firebase. Si clonaste después, ignora este archivo: el README
("Install your own instance") es todo lo que necesitas.

> **Tus datos están a salvo.** Todo tu contenido (transacciones, presupuestos,
> configuración, whitelist) vive en **tu** Firestore, no en el repo. Actualizar
> el código no toca la base de datos. El único riesgo real de este merge es
> perder tu **configuración local** (los valores de Firebase que editaste a
> mano) — por eso el paso 0 es capturarla antes de tocar nada.

## Qué cambió upstream

| Cambio | Impacto en tu instancia |
|---|---|
| La app es ahora 100% finanzas: se eliminaron los dominios salud/tareas/hábitos y la pantalla Home | Si los usabas, esas vistas desaparecen. Los datos en Firestore (`health_*`, `task_*`, `habits`, `habit_logs`) **no se borran**, solo quedan sin UI. Si quieres conservar esas vistas, no actualices |
| `src/firebase.js` ya no tiene el config hardcodeado: lee `VITE_FIREBASE_*` de `.env` | Tus valores editados a mano pasan a un `.env` (paso 3) |
| `public/firebase-messaging-sw.js` se **genera** en build desde `sw/firebase-messaging-sw.template.js` y está gitignorado | Tu copia editada a mano se elimina; el generador la recrea con los valores del `.env` |
| `deploy.yml` toma el config de **GitHub Variables** | Si usas el deploy por Actions, hay que crear 6 variables en tu repo (paso 5) |
| Nueva config por instancia en la app | Settings → Finanzas: etiqueta de Gmail del sync y tasa USD→COP. Settings → Cuenta: gestión de usuarios autorizados |

## La ruta corta (si usas Claude Code)

Abre Claude Code en la raíz de tu clon y pégale esto (tu clon todavía no tiene
este archivo — por eso el prompt apunta a la URL):

```text
Descarga https://raw.githubusercontent.com/mrjunos/mis-finanzas/main/UPGRADING.md
y sigue su "Runbook para Claude" al pie de la letra: actualiza mi instancia
al main de upstream (https://github.com/mrjunos/mis-finanzas) sin perder mi
configuración de Firebase ni mis datos. Empieza por el paso 0 (capturar mi
config actual) antes de tocar cualquier archivo. Mi app funciona hoy; al
final debe seguir funcionando con mis datos. Ejecuta el checklist de
verificación de verdad antes de dar por terminado.
```

Claude hará el resto. Si prefieres hacerlo a mano, los mismos pasos están abajo.

## Runbook para Claude (o para humanos pacientes)

### Paso 0 — Capturar la configuración actual (ANTES de mergear)

Extrae y guarda en un archivo temporal (fuera del repo) estos valores:

1. Los 6 campos de `firebaseConfig` en `src/firebase.js` del clon actual:
   `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
2. La clave VAPID pública, si la instancia usa notificaciones push (búscala como
   `VITE_FCM_VAPID_KEY`, o en `usePushNotifications`/`firebase.js` según la antigüedad del clon;
   si no aparece, se puede regenerar luego en Firebase Console → Cloud Messaging).
3. El contenido de `.firebaserc` (project ID y site de hosting propios).
4. `git status` + `git diff` — si hay cambios locales sin commitear, commitearlos
   o guardarlos con `git stash` antes de seguir.

### Paso 1 — Traer upstream

```bash
git remote add upstream https://github.com/mrjunos/mis-finanzas.git 2>/dev/null || true
git fetch upstream
git checkout -b upgrade/upstream-2026-07
git merge upstream/main
```

### Paso 2 — Resolver los conflictos esperados

Regla general: **acepta la versión upstream del código** y conserva **tus
valores** en los archivos de configuración.

- `src/firebase.js` → toma la versión upstream completa (lee de `import.meta.env`).
  Tus valores van al `.env` del paso 3, no a este archivo.
- `public/firebase-messaging-sw.js` → elimínalo (`git rm`). Upstream lo borró del
  control de versiones; ahora se genera en `prebuild`/`predev`.
- `.firebaserc` → conserva **tu** versión (tu project ID como `default` y tu site
  bajo el target `finanzas`). Si tu versión aún tiene un segundo target, bórralo.
- `package.json` → toma upstream (agrega `predev`/`prebuild` y renombra a
  `mis-finanzas`); si cambiaste algo propio, re-aplícalo encima.
- Si borraste o editaste vistas por tu cuenta, resuelve caso por caso —
  recuerda que upstream eliminó `src/domains/{health,tasks,habits}` y
  `src/shared/components/HomeScreen.jsx` completos.

### Paso 3 — Crear `.env`

```bash
cp .env.example .env
```

Pobla las 6 `VITE_FIREBASE_*` con los valores capturados en el paso 0 y
`VITE_FCM_VAPID_KEY` con la VAPID (déjala vacía si no usas push).

### Paso 4 — Verificar en local

```bash
npm install
npm run lint && npm run test && npm run build
npm run dev
```

Checklist de verificación (hazlo de verdad, no lo asumas):

- [ ] `npm run build` genera `public/firebase-messaging-sw.js` y contiene **tu** `projectId` (no `brewbooks-mvp`).
- [ ] La app abre, hace login con tu cuenta y aterriza en **Radiografía** con **tus transacciones de siempre**.
- [ ] Navegación: Movimientos, Presupuestos, y el FAB abre el modal de transacción.
- [ ] Settings → Finanzas muestra "Sincronización y moneda"; Settings → Cuenta muestra "Usuarios autorizados" con tu correo marcado "Tú".
- [ ] `grep -rn "AIzaSy" src/` no devuelve nada (no quedó config hardcodeado).

### Paso 5 — CI/CD (solo si usas el deploy por GitHub Actions)

En tu repo de GitHub:

```bash
gh variable set VITE_FIREBASE_API_KEY --body "<tu valor>"
gh variable set VITE_FIREBASE_AUTH_DOMAIN --body "<tu valor>"
gh variable set VITE_FIREBASE_PROJECT_ID --body "<tu valor>"
gh variable set VITE_FIREBASE_STORAGE_BUCKET --body "<tu valor>"
gh variable set VITE_FIREBASE_MESSAGING_SENDER_ID --body "<tu valor>"
gh variable set VITE_FIREBASE_APP_ID --body "<tu valor>"
```

Secrets: `VITE_FCM_VAPID_KEY` (si usas push) y el service account de Hosting
bajo el **nombre exacto** que referencia `.github/workflows/deploy.yml`
(`FIREBASE_SERVICE_ACCOUNT_BREWBOOKS_MVP` — nombre histórico; si prefieres uno
propio, renómbralo en el workflow y crea el secret con ese nombre). Si usas el
sync de Gmail, tus secrets `GEMINI_API_KEY` y `FIREBASE_ADMIN_SDK_JSON`
existentes siguen sirviendo tal cual.

### Paso 6 — Mergear y desplegar

Mergea `upgrade/upstream-2026-07` a tu `main` (idealmente vía PR para ver el
diff completo) y deja que Actions despliegue, o `firebase deploy --only hosting`.

## Después de actualizar

- La etiqueta de Gmail del sync ya no está clavada en el código: configúrala en
  **Settings → Finanzas** (campo `gmailLabel`; vacío = `Bancos/PendingBot`).
- La tasa USD→COP de Radiografía también se configura ahí (vacío = 4100).
- Para autorizar más usuarios ya no hace falta la consola de Firestore:
  **Settings → Cuenta → Usuarios autorizados**.
- Si no usabas salud/tareas/hábitos, no hay nada más que hacer. Si quieres
  limpiar sus colecciones huérfanas de Firestore (`health_*`, `task_*`,
  `habits`, `habit_logs`), es opcional y manual.
