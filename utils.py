import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

# Archivo local de la service account (solo para desarrollo).
# En CI se usa la variable de entorno FIREBASE_ADMIN_SDK_JSON.
LOCAL_CREDENTIALS_FILE = os.path.join(
    os.path.dirname(__file__), 'firebase-adminsdk-fbsvc-bb7cb78f3e.json'
)


def conectar_db():
    """Conecta a Firestore.

    Usa FIREBASE_ADMIN_SDK_JSON (contenido JSON de la service account) si está
    definida — el caso de GitHub Actions. Si no, cae al archivo local de la
    service account para desarrollo.
    """
    if not firebase_admin._apps:
        sa_json = os.environ.get('FIREBASE_ADMIN_SDK_JSON')
        if sa_json:
            cred = credentials.Certificate(json.loads(sa_json))
        elif os.path.exists(LOCAL_CREDENTIALS_FILE):
            cred = credentials.Certificate(LOCAL_CREDENTIALS_FILE)
        else:
            raise RuntimeError(
                "No hay credenciales de Firebase. Define la variable de entorno "
                "FIREBASE_ADMIN_SDK_JSON o coloca el archivo "
                f"{LOCAL_CREDENTIALS_FILE}."
            )
        firebase_admin.initialize_app(cred)
    return firestore.client()
