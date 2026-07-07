import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
    projectId: "mis-finanzas-6ed8d",
    appId: "1:342564772518:web:73b52571560acb385ef267",
    storageBucket: "mis-finanzas-6ed8d.firebasestorage.app",
    apiKey: "AIzaSyDE6Z3lBYL9t5ICSHh3nM7BJcuDJ98o9PI",
    authDomain: "mis-finanzas-6ed8d.firebaseapp.com",
    messagingSenderId: "342564772518"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// --- Cloud Messaging (notificaciones push) ---
// Clave pública del par Web Push (VAPID), generada en Firebase Console →
// Cloud Messaging → Web Push certificates. No es secreta. Se inyecta en build.
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_FCM_VAPID_KEY;

let _messaging = null;
let _messagingChecked = false;

// Devuelve la instancia de Messaging solo si el navegador la soporta.
// Retorna null en iOS no instalado como PWA y en entornos de test (jsdom),
// evitando que getMessaging() lance excepciones.
export async function getMessagingIfSupported() {
    if (_messaging) return _messaging;
    if (_messagingChecked) return _messaging;
    _messagingChecked = true;
    try {
        if (!(await isSupported())) return null;
        _messaging = getMessaging(app);
    } catch {
        _messaging = null;
    }
    return _messaging;
}

export { getToken, onMessage };
