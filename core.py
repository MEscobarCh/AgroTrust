"""
AgroTrust - Nucleo logico
Parte 2/5

Dos responsabilidades:
1. Calculadora de periodos de carencia (inocuidad).
2. Generador/gestor del cronograma nutricional por etapa fenologica.
"""

from datetime import datetime, timedelta
from models import db, AplicacionQuimica, TareaNutricional, Cultivo

# Ventanas de tareas nutricionales por etapa (dias desde el inicio de la etapa)
CRONOGRAMA_BASE = {
    "germinacion": [
        {"descripcion": "Riego inicial + fertilizante base", "dias_desde_inicio": 0},
        {"descripcion": "Refuerzo foliar temprano", "dias_desde_inicio": 10},
    ],
    "floracion": [
        {"descripcion": "Abono secundario (fosforo/potasio)", "dias_desde_inicio": 0},
        {"descripcion": "Refuerzo foliar de floracion", "dias_desde_inicio": 15},
    ],
    "fructificacion": [
        {"descripcion": "Abono de engorde de fruto", "dias_desde_inicio": 0},
        {"descripcion": "Ultimo refuerzo antes de cosecha", "dias_desde_inicio": 12},
    ],
}


# ---------- 1. Modulo de inocuidad ----------

def registrar_aplicacion(cultivo_id, nombre_producto, tipo, dias_carencia,
                          fecha_aplicacion=None):
    """Registra una aplicacion de quimico. Es inmutable: no se expone update/delete."""
    aplicacion = AplicacionQuimica(
        cultivo_id=cultivo_id,
        nombre_producto=nombre_producto,
        tipo=tipo,
        dias_carencia=dias_carencia,
        fecha_aplicacion=fecha_aplicacion or datetime.utcnow(),
    )
    db.session.add(aplicacion)
    db.session.commit()
    return aplicacion


def verificar_cosecha_segura(cultivo_id, fecha_propuesta=None):
    """
    Revisa todas las aplicaciones activas del cultivo y determina si,
    en la fecha propuesta (o ahora), es seguro cosechar.
    Devuelve (es_seguro: bool, alertas: list[str]).
    """
    fecha_propuesta = fecha_propuesta or datetime.utcnow()
    aplicaciones = AplicacionQuimica.query.filter_by(cultivo_id=cultivo_id).all()

    alertas = []
    es_seguro = True

    for app in aplicaciones:
        fecha_segura = app.fecha_cosecha_segura
        if fecha_propuesta < fecha_segura:
            es_seguro = False
            dias_faltantes = (fecha_segura - fecha_propuesta).days
            alertas.append(
                f"Riesgo de toxicidad: '{app.nombre_producto}' requiere esperar "
                f"{dias_faltantes} dia(s) mas (seguro desde {fecha_segura.date()})."
            )

    return es_seguro, alertas


# ---------- 2. Modulo nutricional / fenologico ----------

def generar_cronograma(cultivo_id, etapa, fecha_inicio_etapa):
    """
    Genera las tareas nutricionales de una etapa fenologica a partir
    de la plantilla CRONOGRAMA_BASE, y las guarda en la base de datos.
    """
    plantilla = CRONOGRAMA_BASE.get(etapa)
    if not plantilla:
        raise ValueError(f"Etapa desconocida: {etapa}")

    tareas_creadas = []
    for tarea in plantilla:
        fecha_programada = fecha_inicio_etapa + timedelta(days=tarea["dias_desde_inicio"])
        nueva_tarea = TareaNutricional(
            cultivo_id=cultivo_id,
            etapa=etapa,
            descripcion=tarea["descripcion"],
            fecha_programada=fecha_programada,
        )
        db.session.add(nueva_tarea)
        tareas_creadas.append(nueva_tarea)

    db.session.commit()
    return tareas_creadas


def avanzar_etapa(cultivo_id, nueva_etapa, fecha_inicio=None):
    """Cambia la etapa del cultivo y genera automaticamente su cronograma."""
    cultivo = Cultivo.query.get(cultivo_id)
    if not cultivo:
        raise ValueError("Cultivo no encontrado")

    cultivo.etapa_actual = nueva_etapa
    db.session.commit()

    return generar_cronograma(cultivo_id, nueva_etapa, fecha_inicio or datetime.utcnow().date())


def tareas_pendientes(cultivo_id, dias_ventana=7):
    """Tareas nutricionales que vencen dentro de los proximos `dias_ventana` dias."""
    hoy = datetime.utcnow().date()
    limite = hoy + timedelta(days=dias_ventana)

    return (
        TareaNutricional.query
        .filter_by(cultivo_id=cultivo_id, completada=False)
        .filter(TareaNutricional.fecha_programada <= limite)
        .order_by(TareaNutricional.fecha_programada)
        .all()
    )
