"""
AgroTrust - Modelos de base de datos
Parte 1/5

Usa SQLAlchemy: funciona igual con SQLite (para pruebas/demo)
o con MySQL/PostgreSQL (para producción), solo cambia la URI
de conexión en app.py.
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Cultivo(db.Model):
    """Un cultivo sembrado, que se sigue durante todo su ciclo de vida."""
    __tablename__ = "cultivos"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    variedad = db.Column(db.String(100))
    fecha_siembra = db.Column(db.Date, nullable=False)
    etapa_actual = db.Column(db.String(30), default="germinacion")
    # etapas posibles: germinacion, floracion, fructificacion, cosechado

    aplicaciones = db.relationship(
        "AplicacionQuimica", backref="cultivo", lazy=True, cascade="all, delete-orphan"
    )
    tareas = db.relationship(
        "TareaNutricional", backref="cultivo", lazy=True, cascade="all, delete-orphan"
    )
    lotes = db.relationship(
        "LoteCosecha", backref="cultivo", lazy=True, cascade="all, delete-orphan"
    )


class AplicacionQuimica(db.Model):
    """Registro inmutable de cada pesticida/fertilizante aplicado."""
    __tablename__ = "aplicaciones_quimicas"

    id = db.Column(db.Integer, primary_key=True)
    cultivo_id = db.Column(db.Integer, db.ForeignKey("cultivos.id"), nullable=False)
    nombre_producto = db.Column(db.String(120), nullable=False)
    tipo = db.Column(db.String(30), nullable=False)  # pesticida | fertilizante
    fecha_aplicacion = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    dias_carencia = db.Column(db.Integer, nullable=False)  # periodo de carencia en días
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)  # inmutable, no se edita

    @property
    def fecha_cosecha_segura(self):
        from datetime import timedelta
        return self.fecha_aplicacion + timedelta(days=self.dias_carencia)


class TareaNutricional(db.Model):
    """Tarea programada del cronograma nutricional/fenológico."""
    __tablename__ = "tareas_nutricionales"

    id = db.Column(db.Integer, primary_key=True)
    cultivo_id = db.Column(db.Integer, db.ForeignKey("cultivos.id"), nullable=False)
    etapa = db.Column(db.String(30), nullable=False)  # germinacion, floracion, fructificacion
    descripcion = db.Column(db.String(200), nullable=False)  # ej: "abono secundario"
    fecha_programada = db.Column(db.Date, nullable=False)
    completada = db.Column(db.Boolean, default=False)


class LoteCosecha(db.Model):
    """Lote de cosecha con su código QR de trazabilidad."""
    __tablename__ = "lotes_cosecha"

    id = db.Column(db.Integer, primary_key=True)
    cultivo_id = db.Column(db.Integer, db.ForeignKey("cultivos.id"), nullable=False)
    codigo_lote = db.Column(db.String(50), unique=True, nullable=False)
    fecha_cosecha = db.Column(db.DateTime, default=datetime.utcnow)
    apto_para_consumo = db.Column(db.Boolean, default=None)  # se calcula al cosechar
