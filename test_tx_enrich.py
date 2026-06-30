"""Tests de tx_enrich (puro, sin Firebase/Gemini). Corre con:
    python3 test_tx_enrich.py      (o pytest)
"""

from tx_enrich import (
    normalize_merchant, looks_like_statement, build_merchant_memory,
    apply_merchant_memory, validate_classification, memory_for_prompt,
)

HISTORY = [
    {"title": "RAPPI", "category": "Comida", "subcategory": "Domicilios/Rappi", "context": "personal"},
    {"title": "RAPPI", "category": "Comida", "subcategory": "Domicilios/Rappi", "context": "personal"},
    {"title": "RAPPI", "category": "Comida", "subcategory": "Domicilios/Rappi", "context": "personal"},
    {"title": "Rappi*", "category": "Comida", "subcategory": "", "context": "personal"},
    {"title": "UBER", "category": "Transporte", "subcategory": "Uber/Taxi", "context": "personal"},
    {"title": "UBER", "category": "Transporte", "subcategory": "Uber/Taxi", "context": "personal"},
    {"title": "UBER", "category": "Transporte", "subcategory": "Uber/Taxi", "context": "personal"},
]


def test_normalize():
    assert normalize_merchant("UBER RIDES*DL") == "uber rides dl"
    assert normalize_merchant("  Rappi  ") == "rappi"


def test_statement_gate():
    assert looks_like_statement("¡Llegó el extracto de tu RappiCard!")
    assert looks_like_statement("Tu estado de cuenta está listo")
    # "Resumen de transacción" SÍ es una transacción → no se filtra
    assert not looks_like_statement("RappiCard - Resumen de transacción")
    assert not looks_like_statement("Alertas y Notificaciones")


def test_memory_majority():
    mem = build_merchant_memory(HISTORY)
    assert mem["rappi"]["category"] == "Comida"
    assert mem["rappi"]["count"] == 4  # "RAPPI"×3 + "Rappi*" se fusionan al normalizar
    assert mem["uber"]["subcategory"] == "Uber/Taxi"
    assert mem["uber"]["ctx_agree"] == 1.0


def test_apply_overrides_when_confident():
    mem = build_merchant_memory(HISTORY)
    datos = {"type": "debit", "title": "UBER", "category": "Otros",
             "subcategory": "", "context": "business", "amount": 5000}
    fixed, info = apply_merchant_memory(datos, mem)
    assert fixed["category"] == "Transporte"
    assert fixed["context"] == "personal"
    assert info is not None and "category" in info["changed"]
    # no toca campos de extracción
    assert fixed["amount"] == 5000 and fixed["title"] == "UBER"


def test_apply_skips_low_count_and_ignore():
    mem = build_merchant_memory(HISTORY)
    # comercio desconocido → sin cambios
    _, info = apply_merchant_memory({"type": "debit", "title": "Comercio Nuevo SAS"}, mem)
    assert info is None
    # type ignore → nunca se toca
    _, info2 = apply_merchant_memory({"type": "ignore", "title": "UBER"}, mem)
    assert info2 is None


def test_validate_classification():
    cats = ["Comida", "Transporte", "Otros"]
    accounts = ["Bancolombia Master *7761", "Rappi Visa *3315"]
    out = validate_classification(
        {"category": "Inventada", "card": "Rappi Visa 3315"}, cats, accounts)
    assert out["category"] == "Otros"
    assert out["card"] == "Rappi Visa *3315"  # fuzzy-snap a cuenta válida


def test_memory_for_prompt_shape():
    mem = build_merchant_memory(HISTORY)
    rows = memory_for_prompt(mem, top_n=10)
    assert rows[0]["comercio"] and "category" in rows[0] and "visto" in rows[0]


def _run():
    fns = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for fn in fns:
        fn()
        print(f"  ✓ {fn.__name__}")
    print(f"OK — {len(fns)} tests")


if __name__ == "__main__":
    _run()
