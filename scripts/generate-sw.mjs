// Genera public/firebase-messaging-sw.js desde sw/firebase-messaging-sw.template.js.
// El SW se sirve estático y no pasa por Vite, así que no puede leer
// import.meta.env: este script inyecta el config en prebuild/predev.
// Los valores salen de .env (local) o de las variables del proceso (CI);
// las del proceso tienen prioridad.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const env = {};
const envFile = join(root, '.env');
if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
        if (m && !line.trim().startsWith('#')) {
            env[m[1]] = m[2].replace(/^["']|["']$/g, '');
        }
    }
}
for (const [k, v] of Object.entries(process.env)) {
    if (v) env[k] = v;
}

const KEYS = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
];

const missing = KEYS.filter((k) => !env[k]);
if (missing.length) {
    console.error(`generate-sw: faltan variables de entorno: ${missing.join(', ')}`);
    console.error('Copia .env.example a .env y pobla los valores de tu proyecto Firebase.');
    process.exit(1);
}

let out = readFileSync(join(root, 'sw', 'firebase-messaging-sw.template.js'), 'utf8');
for (const k of KEYS) {
    out = out.replaceAll(`__${k}__`, env[k]);
}
writeFileSync(join(root, 'public', 'firebase-messaging-sw.js'), out);
console.log('generate-sw: public/firebase-messaging-sw.js generado');
