"""
AgroTrust - Trazabilidad por QR
Parte 4/5

Genera un codigo QR por cada lote de cosecha. Al escanearlo, el
comprador es dirigido a una URL que muestra el historial completo:
aplicaciones quimicas + cumplimiento de carencia + manejo nutricional.
"""

import io
import uuid
import qrcode
from datetime import datetime

from models import db, LoteCosecha, AplicacionQuimica, TareaNutricional
from core import verificar_cosecha_segura

# En produccion, cambiar por el dominio real desplegado (ej. en Vercel)
BASE_URL_TRAZABILIDAD = "https://agrotrust.example.com/trazabilidad"


def crear_lote_cosecha(cultivo_id):
    """
    Crea un lote de cosecha: valida si es seguro cosechar en este momento,
    genera un codigo unico y lo guarda. No genera la imagen QR aqui
    (eso se hace en generar_imagen_qr) para mantener esta funcion ligera.
    """
    es_seguro, alertas = verificar_cosecha_segura(cultivo_id)

    codigo_lote = f"LOTE-{uuid.uuid4().hex[:10].upper()}"
    lote = LoteCosecha(
        cultivo_id=cultivo_id,
        codigo_lote=codigo_lote,
        fecha_cosecha=datetime.utcnow(),
        apto_para_consumo=es_seguro,
    )
    db.session.add(lote)
    db.session.commit()

    return lote, alertas


def generar_imagen_qr(codigo_lote):
    """Genera la imagen PNG del QR (en memoria) que apunta a la URL de trazabilidad."""
    url = f"{BASE_URL_TRAZABILIDAD}/{codigo_lote}"
    img = qrcode.make(url)

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer


def obtener_historial_lote(codigo_lote):
    """
    Arma el historial completo que vera el consumidor final al escanear el QR:
    - datos del lote
    - aplicaciones quimicas del cultivo y si respetaron el periodo de carencia
    - tareas nutricionales completadas
    """
    lote = LoteCosecha.query.filter_by(codigo_lote=codigo_lote).first()
    if not lote:
        return None

    aplicaciones = AplicacionQuimica.query.filter_by(cultivo_id=lote.cultivo_id).all()
    tareas = TareaNutricional.query.filter_by(
        cultivo_id=lote.cultivo_id, completada=True
    ).all()

    return {
        "codigo_lote": lote.codigo_lote,
        "fecha_cosecha": lote.fecha_cosecha.isoformat(),
        "apto_para_consumo": lote.apto_para_consumo,
        "aplicaciones_quimicas": [
            {
                "producto": a.nombre_producto,
                "tipo": a.tipo,
                "fecha_aplicacion": a.fecha_aplicacion.isoformat(),
                "cosecha_segura_desde": a.fecha_cosecha_segura.isoformat(),
                "carencia_respetada": lote.fecha_cosecha >= a.fecha_cosecha_segura,
            }
            for a in aplicaciones
        ],
        "manejo_nutricional": [
            {"etapa": t.etapa, "descripcion": t.descripcion, "fecha": t.fecha_programada.isoformat()}
            for t in tareas
        ],
    }
