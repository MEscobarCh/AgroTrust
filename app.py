"""
AgroTrust - API REST (Flask)
Parte 3/5

Expone endpoints para:
- crear cultivos
- registrar aplicaciones quimicas
- verificar si es seguro cosechar
- avanzar de etapa fenologica
- listar tareas nutricionales pendientes
"""

from datetime import datetime
from flask import Flask, request, jsonify
from models import db, Cultivo
from core import (
    registrar_aplicacion,
    verificar_cosecha_segura,
    avanzar_etapa,
    tareas_pendientes,
)
from trazabilidad import crear_lote_cosecha, generar_imagen_qr, obtener_historial_lote
from flask import send_file

app = Flask(__name__)
# SQLite para pruebas/demo. Para produccion: "mysql+pymysql://user:pass@host/db"
# o "postgresql+psycopg2://user:pass@host/db"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///agrotrust.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


@app.route("/cultivos", methods=["POST"])
def crear_cultivo():
    data = request.get_json()
    cultivo = Cultivo(
        nombre=data["nombre"],
        variedad=data.get("variedad"),
        fecha_siembra=datetime.strptime(data["fecha_siembra"], "%Y-%m-%d").date(),
    )
    db.session.add(cultivo)
    db.session.commit()
    return jsonify({"id": cultivo.id, "nombre": cultivo.nombre}), 201


@app.route("/cultivos/<int:cultivo_id>/aplicaciones", methods=["POST"])
def crear_aplicacion(cultivo_id):
    data = request.get_json()
    aplicacion = registrar_aplicacion(
        cultivo_id=cultivo_id,
        nombre_producto=data["nombre_producto"],
        tipo=data["tipo"],
        dias_carencia=data["dias_carencia"],
    )
    return jsonify({
        "id": aplicacion.id,
        "producto": aplicacion.nombre_producto,
        "cosecha_segura_desde": aplicacion.fecha_cosecha_segura.isoformat(),
    }), 201


@app.route("/cultivos/<int:cultivo_id>/verificar-cosecha", methods=["GET"])
def verificar_cosecha(cultivo_id):
    es_seguro, alertas = verificar_cosecha_segura(cultivo_id)
    return jsonify({"es_seguro": es_seguro, "alertas": alertas})


@app.route("/cultivos/<int:cultivo_id>/avanzar-etapa", methods=["POST"])
def avanzar(cultivo_id):
    data = request.get_json()
    tareas = avanzar_etapa(cultivo_id, nueva_etapa=data["etapa"])
    return jsonify({
        "etapa": data["etapa"],
        "tareas_generadas": [
            {"descripcion": t.descripcion, "fecha": t.fecha_programada.isoformat()}
            for t in tareas
        ],
    }), 201


@app.route("/cultivos/<int:cultivo_id>/tareas-pendientes", methods=["GET"])
def pendientes(cultivo_id):
    dias = request.args.get("dias", default=7, type=int)
    tareas = tareas_pendientes(cultivo_id, dias_ventana=dias)
    return jsonify([
        {"id": t.id, "descripcion": t.descripcion, "fecha": t.fecha_programada.isoformat()}
        for t in tareas
    ])


@app.route("/cultivos/<int:cultivo_id>/lotes", methods=["POST"])
def crear_lote(cultivo_id):
    lote, alertas = crear_lote_cosecha(cultivo_id)
    return jsonify({
        "codigo_lote": lote.codigo_lote,
        "apto_para_consumo": lote.apto_para_consumo,
        "alertas": alertas,
        "qr_url": f"/lotes/{lote.codigo_lote}/qr",
    }), 201


@app.route("/lotes/<codigo_lote>/qr", methods=["GET"])
def qr_lote(codigo_lote):
    imagen = generar_imagen_qr(codigo_lote)
    return send_file(imagen, mimetype="image/png")


@app.route("/trazabilidad/<codigo_lote>", methods=["GET"])
def trazabilidad_lote(codigo_lote):
    historial = obtener_historial_lote(codigo_lote)
    if historial is None:
        return jsonify({"error": "Lote no encontrado"}), 404
    return jsonify(historial)


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
