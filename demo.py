"""
AgroTrust - Script de demo end-to-end
Parte 5/5 (b)

Simula el flujo completo del sistema, util para la presentacion
de la hackaton:
  1. Crear un cultivo
  2. Registrar aplicaciones quimicas
  3. Avanzar de etapa (genera cronograma nutricional)
  4. Revisar alertas / notificaciones
  5. Cosechar -> generar lote + QR
  6. Consultar la trazabilidad como lo veria el comprador

Ejecutar con:  python demo.py
"""

from datetime import date, datetime, timedelta

from app import app, db
from models import Cultivo
from core import registrar_aplicacion, avanzar_etapa
from notifications import revisar_y_notificar
from trazabilidad import crear_lote_cosecha, obtener_historial_lote, generar_imagen_qr


def main():
    with app.app_context():
        db.drop_all()
        db.create_all()

        print("\n1) Creando cultivo...")
        cultivo = Cultivo(nombre="Tomate", variedad="Cherry", fecha_siembra=date(2026, 1, 1))
        db.session.add(cultivo)
        db.session.commit()
        print(f"   Cultivo creado: id={cultivo.id}, etapa={cultivo.etapa_actual}")

        print("\n2) Registrando aplicacion quimica...")
        registrar_aplicacion(
            cultivo.id, "Fungicida Cobre", "pesticida",
            dias_carencia=7, fecha_aplicacion=datetime.utcnow() - timedelta(days=2),
        )
        print("   Aplicacion registrada (carencia: 7 dias, aplicado hace 2 dias).")

        print("\n3) Avanzando a etapa de floracion (genera cronograma nutricional)...")
        tareas = avanzar_etapa(cultivo.id, "floracion", fecha_inicio=date.today())
        for t in tareas:
            print(f"   - Tarea programada: {t.descripcion} ({t.fecha_programada})")

        print("\n4) Revisando alertas y notificaciones...")
        estado = revisar_y_notificar(cultivo.id)
        print(f"   Resumen: {estado}")

        print("\n5) Intentando generar lote de cosecha...")
        lote, alertas = crear_lote_cosecha(cultivo.id)
        print(f"   Lote: {lote.codigo_lote} | Apto: {lote.apto_para_consumo}")
        if alertas:
            for a in alertas:
                print(f"   ALERTA: {a}")

        print("\n6) Generando QR y consultando trazabilidad (vista del comprador)...")
        qr = generar_imagen_qr(lote.codigo_lote)
        print(f"   QR generado ({len(qr.getvalue())} bytes)")
        historial = obtener_historial_lote(lote.codigo_lote)
        print(f"   Historial: {historial}")


if __name__ == "__main__":
    main()
