# Revisión de la validación para asegurar que el ancho de pulso y la frecuencia son compatibles

def validar_ancho_de_pulso_y_frecuencia(frecuencia_hz, time_on_microsegundos):
    # Cálculo del período total en microsegundos para la frecuencia dada
    periodo_total_microsegundos = 1 / frecuencia_hz * 1e6
    
    # Verificar si el ancho de pulso es menor que el período total (lo cual es necesario para que sean compatibles)
    if time_on_microsegundos < periodo_total_microsegundos:
        # Si es compatible, calculamos el timeOff
        time_off_microsegundos = periodo_total_microsegundos - time_on_microsegundos
        return True, time_off_microsegundos
    else:
        # No es compatible
        return False, None

# Ejemplo de validación para 50Hz y 10 microsegundos de ancho de pulso
es_valido, time_off_calculado = validar_ancho_de_pulso_y_frecuencia(frecuencia_hz=50, time_on_microsegundos=10000)

print(es_valido, time_off_calculado)
