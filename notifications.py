"""
AgroTrust - Notificaciones
Parte 5/5 (a)

Para la demo de la hackaton, las notificaciones se simulan por consola.
En produccion, `enviar_notificacion` se reemplaza por una llamada real
a un servicio de push (ej. Firebase Cloud Messaging) sin tocar el resto
del modulo.
"""

from core import verificar_cosecha_segura, tareas_pendientes


def enviar_notificacion(cultivo_id, mensaje, urgente=False):
    """Punto unico de envio. Hoy: imprime. Manana: llamada a FCM/APNs/etc."""
    etiqueta = "[URGENTE]" if urgente else "[INFO]"
    print(f"{etiqueta} Cultivo {cultivo_id}: {mensaje}")


def revisar_y_notificar(cultivo_id, dias_ventana_tareas=3):
    """
    Revisa el estado del cultivo y dispara las notificaciones que correspondan:
    - alertas de riesgo de toxicidad si se intentara cosechar hoy
    - tareas nutricionales que vencen pronto
    """
    es_seguro, alertas_inocuidad = verificar_cosecha_segura(cultivo_id)
    for alerta in alertas_inocuidad:
        enviar_notificacion(cultivo_id, alerta, urgente=True)

    tareas = tareas_pendientes(cultivo_id, dias_ventana=dias_ventana_tareas)
    for tarea in tareas:
        enviar_notificacion(
            cultivo_id,
            f"Tarea pendiente: '{tarea.descripcion}' programada para {tarea.fecha_programada}.",
            urgente=False,
        )

    if es_seguro and not tareas:
        enviar_notificacion(cultivo_id, "Sin alertas activas. Todo en orden.")

    return {"es_seguro_cosechar": es_seguro, "tareas_por_vencer": len(tareas)}
