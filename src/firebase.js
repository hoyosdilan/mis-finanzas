import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Config del proyecto Firebase: viene de .env (local) o de GitHub Variables
// (CI). Ver .env.example. El config web no es secreto, pero se externaliza
// para que cada instancia apunte a su propio proyecto.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Caché persistente (IndexedDB): las visitas repetidas pintan los datos al
// instante desde disco y solo sincronizan los documentos que cambiaron.
// Si IndexedDB no está disponible, el SDK degrada a caché en memoria solo.
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// --- Cloud Messaging (notificaciones push) ---
// Clave pública del par Web Push (VAPID), generada en Firebase Console →
// Cloud Messaging → Web Push certificates. No es secreta. Se inyecta en build.
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_FCM_VAPID_KEY;

// El módulo firebase/messaging se carga con import() dinámico para mantenerlo
// fuera del bundle inicial: solo se necesita si el usuario usa notificaciones.
let _messagingModule = null;
let _messagingPromise = null;

// Devuelve la instancia de Messaging solo si el navegador la soporta.
// Retorna null en iOS no instalado como PWA y en entornos de test (jsdom),
// evitando que getMessaging() lance excepciones. Cachea la promesa para que
// llamadas concurrentes compartan la misma resolución.
export function getMessagingIfSupported() {
    if (!_messagingPromise) {
        _messagingPromise = (async () => {
            try {
                const mod = await import('firebase/messaging');
                if (!(await mod.isSupported())) return null;
                _messagingModule = mod;
                return mod.getMessaging(app);
            } catch {
                return null;
            }
        })();
    }
    return _messagingPromise;
}

// Wrappers síncronos sobre el módulo ya cargado. Solo son válidos con una
// instancia de messaging obtenida de getMessagingIfSupported(), que es quien
// carga el módulo — igual que el contrato de los call sites existentes.
export function getToken(messaging, options) {
    return _messagingModule.getToken(messaging, options);
}

export function onMessage(messaging, handler) {
    return _messagingModule.onMessage(messaging, handler);
}
