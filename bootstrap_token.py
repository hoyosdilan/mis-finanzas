"""Siembra el token de OAuth de Gmail en Firestore.

Ejecutar UNA sola vez localmente, antes de la primera corrida del workflow de
GitHub Actions. Lee el token.json local (ya generado por una autenticación
interactiva previa) y lo sube al documento gmail_auth/token de Firestore, desde
donde gmail_finanzas_sync.py lo lee y lo refresca de forma autónoma.

Uso:
    python bootstrap_token.py
"""
import os
import json
from utils import conectar_db

TOKEN_FILE = os.path.join(os.path.dirname(__file__), 'token.json')
TOKEN_COLLECTION = 'gmail_auth'
TOKEN_DOC = 'token'


def main():
    if not os.path.exists(TOKEN_FILE):
        print(f"❌ No existe {TOKEN_FILE}.")
        print("Genera primero el token autenticándote localmente con Gmail.")
        raise SystemExit(1)

    with open(TOKEN_FILE) as f:
        token_info = json.load(f)

    if 'refresh_token' not in token_info:
        print("❌ El token.json no contiene 'refresh_token'.")
        print("Vuelve a autenticarte para obtener un token con refresh_token.")
        raise SystemExit(1)

    db = conectar_db()
    db.collection(TOKEN_COLLECTION).document(TOKEN_DOC).set(token_info)
    print(f"✅ Token subido a Firestore ({TOKEN_COLLECTION}/{TOKEN_DOC}).")
    print("Ya puedes ejecutar el workflow 'Gmail Finance Sync' en GitHub Actions.")


if __name__ == '__main__':
    main()
