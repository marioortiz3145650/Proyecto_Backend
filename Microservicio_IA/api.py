import cv2
import json
import time
import threading
from flask import Flask, Response, jsonify

from camera.camera_manager import CameraManager
from vision.egg_detector import EggDetector
from vision.egg_measurement import EggMeasurement
from vision.volume_calculator import VolumeCalculator
from scale.display_detector import DisplayDetector
from calibration.calibration_manager import CalibrationManager
from config.system_config import SystemConfig
from scale.weight_reader import WeightReader
from scale.weight_filter import WeightFilter

app = Flask(__name__)

import argparse

# Parsear argumentos para que NestJS pueda pasar el índice de la cámara
parser = argparse.ArgumentParser()
parser.add_argument('--camera', type=int, default=0, help='Índice de la cámara USB')
args = parser.parse_args()

# Estado global del sistema
state = {
    "egg_detected": False,
    "volume_cm3": 0.0,
    "category": "N/A",
    "weight_g": 0.0,
    "weight_stable": False,
    "raw_reading": "-- g",
    "confidence": 0.0,
    "status": "Iniciando...",
    "scan_count": 0,
    "last_scanned": None,
    "scanned_eggs": []
}

locked_weight = 0.0
last_valid_weight = 0.0
is_locked = False
missing_egg_counter = 0

def classify_egg(weight):
    if weight <= 30.0 or weight > 100.0: return "N/A"
    elif weight < 46.0: return "C"
    elif weight < 53.0: return "B"
    elif weight < 60.0: return "A"
    elif weight < 67.0: return "AA"
    elif weight < 78.0: return "AAA"
    elif weight <= 100.0: return "JUMBO"
    else: return "N/A"

# Inicializar módulos de IA
camera = CameraManager(camera_index=args.camera)
detector = EggDetector()

# Iniciar dependencias de la báscula y visión
config = SystemConfig()
calib_mgr = CalibrationManager(config)

display_detector = DisplayDetector(
    roi_x=config.get("roi_x", 240),
    roi_y=config.get("roi_y", 365),
    roi_w=config.get("roi_w", 150),
    roi_h=config.get("roi_h", 75)
)
egg_measure = EggMeasurement(calib_mgr)
vol_calc = VolumeCalculator()

# digit_recognizer es ignorado internamente por el nuevo modelo de PyTorch, pasamos None
reader = WeightReader(display_detector, None)

filter = WeightFilter(window_size=7, min_confidence=75.0, stability_frames=5)

current_frame = None
lock = threading.Lock()

def process_camera():
    global current_frame, state
    # El método real de CameraManager es open()
    camera.open()
    time.sleep(2) # Calentar cámara
    
    while True:
        # El método real de CameraManager es read_frame()
        ret, frame = camera.read_frame()
        if not ret or frame is None:
            time.sleep(0.01)
            continue
            
        # Voltear la cámara 180 grados (arriba/abajo y de izquierda/derecha para evitar modo espejo)
        frame = cv2.flip(frame, -1)
            
        # EXTRAER ZONA DEL HUEVO SEGÚN CONFIGURACIÓN
        egg_zx = config.get("egg_zone_x", 160)
        egg_zy = config.get("egg_zone_y", 20)
        egg_zw = config.get("egg_zone_w", 350)
        egg_zh = config.get("egg_zone_h", 220)
        
        # Asegurarnos de que no nos salimos de la imagen
        h_f, w_f = frame.shape[:2]
        zx = max(0, min(egg_zx, w_f))
        zy = max(0, min(egg_zy, h_f))
        zw = min(egg_zw, w_f - zx)
        zh = min(egg_zh, h_f - zy)
        
        global is_calibrating
        
        # Extraer ZONA DE CALIBRACIÓN SEGÚN CONFIGURACIÓN
        calib_zx = config.get("calib_zone_x", 400)
        calib_zy = config.get("calib_zone_y", 20)
        calib_zw = config.get("calib_zone_w", 132) # Aprox 5cm * 26.5
        calib_zh = config.get("calib_zone_h", 132)

        # 1. Detectar Huevo solo dentro de la zona rosada (egg zone)
        egg_frame_zone = frame[zy:zy+zh, zx:zx+zw]
        
        try:
            is_valid, contour, mask, hull, ellipse = detector.detect(egg_frame_zone)
        except Exception as e:
            is_valid, contour, mask, hull, ellipse = False, None, None, None, None
        
        volume = 0.0
        if is_valid:
            # Dibujar elipse del huevo aplicando los offsets para que coincida en la imagen global
            frame = detector.draw_detection_overlay(frame, contour, ellipse, offset_x=zx, offset_y=zy)
            # Medir huevo
            metrics = egg_measure.measure(contour, hull, ellipse)
            if metrics:
                parallax_factor = config.get("parallax_factor", 1.0)
                # Calcular volumen asumiendo revolución (fondo = ancho) y aplicando factor 3D
                vol_data = vol_calc.calculate_all(
                    mask, contour, 
                    metrics["largo_cm"], metrics["ancho_cm"], 
                    metrics["pixels_per_cm"],
                    parallax_factor=parallax_factor
                )
                volume = vol_data["volumen_cm3"]
                
                # Imprimir métricas al lado del huevo detectado
                cx, cy = metrics["center_px"]
                tx = int(cx) + zx + 30
                ty = int(cy) + zy
                
                cv2.putText(frame, f"Vol: {volume} cm3", (tx, ty), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                cv2.putText(frame, f"L: {metrics['largo_cm']}cm | A: {metrics['ancho_cm']}cm", (tx, ty + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)
        
        # 2. Leer Báscula (recorta internamente)
        raw_weight, confidence, reader_status, proc_details = reader.read_weight(frame)
        
        global locked_weight, last_valid_weight, is_locked, missing_egg_counter
        
        # 3. Determinar si tenemos una lectura de peso válida (> 30g y <= 100g)
        has_valid_weight = (is_valid and 30 < raw_weight <= 100)
        
        if has_valid_weight:
            missing_egg_counter = 0
            last_valid_weight = raw_weight
            
            # Bloquear si la confianza promedio de los 2 dígitos es >= 58% o si ya estaba bloqueado
            if confidence >= 58.0 or is_locked:
                if not is_locked or abs(raw_weight - locked_weight) > 3.0:
                    locked_weight = raw_weight
                    is_locked = True
                    
            active_weight = locked_weight if is_locked else raw_weight
            category = classify_egg(active_weight)
            
            with lock:
                state["egg_detected"] = True
                state["volume_cm3"] = volume
                state["category"] = category
                state["weight_g"] = float(active_weight)
                state["weight_stable"] = is_locked
                state["raw_reading"] = f"{int(active_weight)} g"
                state["confidence"] = confidence
                state["status"] = "ESTABLE" if is_locked else "LECTURA"
                
            text_color = (0, 255, 0) if is_locked else (255, 255, 255)
            cv2.putText(frame, f"BASCULA: {int(active_weight)}g", (440, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, text_color, 2)
            if category != "N/A":
                cv2.putText(frame, f"CAT: {category}", (440, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        else:
            # No hay lectura válida en este fotograma
            missing_egg_counter += 1
            
            # Retener el último peso válido durante 15 fotogramas (~500ms) para evitar parpadeos con 0g
            if missing_egg_counter <= 15 and (is_locked or last_valid_weight > 30):
                display_w = locked_weight if is_locked else last_valid_weight
                category = classify_egg(display_w)
                with lock:
                    state["egg_detected"] = is_valid
                    state["volume_cm3"] = volume if is_valid else 0.0
                    state["category"] = category
                    state["weight_g"] = float(display_w)
                    state["weight_stable"] = is_locked
                    state["raw_reading"] = f"{int(display_w)} g"
                    state["confidence"] = 75.0 if is_locked else 50.0
                    state["status"] = "ESTABLE" if is_locked else "VERIFICANDO..."
                    
                text_color = (0, 255, 0) if is_locked else (255, 255, 255)
                cv2.putText(frame, f"BASCULA: {int(display_w)}g", (440, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, text_color, 2)
                if category != "N/A":
                    cv2.putText(frame, f"CAT: {category}", (440, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
            else:
                # Pasaron más de 15 fotogramas (~500ms) sin lectura válida: resetear a 0g
                filter.reset()
                locked_weight = 0.0
                last_valid_weight = 0.0
                is_locked = False
                with lock:
                    state["egg_detected"] = is_valid
                    state["volume_cm3"] = volume if is_valid else 0.0
                    state["category"] = "N/A"
                    state["weight_g"] = 0.0
                    state["weight_stable"] = False
                    state["raw_reading"] = "0 g"
                    state["confidence"] = 0.0
                    state["status"] = "ESPERANDO HUEVO" if not is_valid else "COLOCAR HUEVO"
                cv2.putText(frame, "BASCULA: 0g", (440, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
            
        # Dibujar rectángulos de interfaz gráfica para configuración visual
        rx = display_detector.roi_x
        ry = display_detector.roi_y
        rw = display_detector.roi_w
        rh = display_detector.roi_h
        # Verde para Pantalla LCD Báscula (coincide con frontend)
        cv2.rectangle(frame, (rx, ry), (rx + rw, ry + rh), (0, 255, 0), 2)
        cv2.putText(frame, "PANTALLA BASCULA", (rx, max(10, ry - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)
        
        # Rosa para Zona de Huevo (coincide con frontend)
        cv2.rectangle(frame, (zx, zy), (zx + zw, zy + zh), (255, 0, 255), 2)
        cv2.putText(frame, "ZONA HUEVO", (zx, max(10, zy - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 0, 255), 1)
        
        # Codificar a JPG para enviar a la web
        ret, buffer = cv2.imencode('.jpg', frame)
        if ret:
            with lock:
                current_frame = buffer.tobytes()
            
        time.sleep(0.03) # ~30 FPS

# Iniciar hilo de procesamiento de video en segundo plano
thread = threading.Thread(target=process_camera, daemon=True)
thread.start()

import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

def gen_frames():
    """Generador para el streaming MJPEG de la cámara hacia Angular"""
    while True:
        if current_frame is not None:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + current_frame + b'\r\n')
            time.sleep(0.04) # Estabiliza la transmisión a ~25 FPS para evitar consumo excesivo de CPU
        else:
            time.sleep(0.1)

@app.after_request
def after_request(response):
    # CORS manual para permitir que Angular (localhost:4200) consulte la API directamente
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/video_feed')
def video_feed():
    """Ruta que consume Angular en la etiqueta <img src='...'>"""
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/current_state', methods=['GET'])
def current_state():
    """Ruta que consume NestJS para saber qué peso y tamaño está viendo la IA"""
    from flask import jsonify
    with lock:
        return jsonify(state)

@app.route('/status', methods=['GET'])
def get_status():
    """Ruta de compatibilidad para el frontend Angular original"""
    from flask import jsonify
    with lock:
        return jsonify({
            "weight": state["weight_g"],
            "category": state["category"],
            "is_simulation": False,
            "scan_count": state["scan_count"],
            "last_scanned": state["last_scanned"],
            "scanned_eggs": state["scanned_eggs"],
            "camera_index": args.camera,
            "volume_cm3": state["volume_cm3"],
            "length_mm": 0,
            "width_mm": 0,
            "px_per_mm": config.get("px_per_mm", 2.65)
        })

@app.route('/list_cameras', methods=['GET', 'OPTIONS'])
def list_cameras():
    """Ruta de compatibilidad para el frontend Angular original"""
    from flask import jsonify
    return jsonify({"cameras": [{"index": 0, "name": "Cámara Principal"}]})

@app.route('/register', methods=['POST'])
def register_egg():
    """Registra manualmente el huevo actual si hay una lectura estable válida"""
    from flask import jsonify
    with lock:
        # REQUERIMIENTO: Permitir registro inmediato sin importar si la elipse del huevo se dibujó o no
        if state["weight_g"] < 10 or state["weight_g"] > 100:
            return jsonify({"error": "El peso debe tener al menos 2 dígitos (entre 10g y 100g) para ser registrado."})
            
        egg_data = {
            "weight": state["weight_g"],
            "category": state["category"],
            "volume_cm3": state["volume_cm3"]
        }
        state["scanned_eggs"].append(egg_data)
        state["scan_count"] += 1
        state["last_scanned"] = egg_data
        
        return jsonify({"status": "ok", "message": "Huevo registrado correctamente."})

@app.route('/clear', methods=['POST'])
def clear_session():
    """Limpia los contadores de la sesión actual"""
    from flask import jsonify
    with lock:
        state["scanned_eggs"] = []
        state["scan_count"] = 0
        state["last_scanned"] = None
        return jsonify({"status": "ok", "message": "Sesión reiniciada."})

# --- ENDPOINTS DE CALIBRACIÓN Y CONFIGURACIÓN VISUAL ---
from flask import request, jsonify

@app.route('/start_calibration', methods=['POST', 'GET'])
def start_calibration():
    # Usamos el recuadro amarillo para calcular el pixel_per_cm
    # Se asume que el ancho del recuadro amarillo encaja perfectamente en 5.0 cm
    w = config.get("calib_zone_w", 132)
    px_per_cm = w / 5.0
    config.update({"pixels_per_cm": px_per_cm})
    return jsonify({"status": "ok", "message": f"Calibración exitosa: {px_per_cm:.2f} px/cm"})

@app.route('/set_calibration', methods=['POST'])
def set_calibration():
    data = request.json or {}
    val = data.get("px_per_mm")
    if val:
        config.update({"pixels_per_cm": float(val) * 10.0})
        return jsonify({"status": "ok", "px_per_mm": float(val)})
    return jsonify({"error": "invalid"}), 400

@app.route('/set_roi', methods=['POST'])
def set_roi():
    data = request.json or {}
    try:
        x, y, w, h = int(data.get("x")), int(data.get("y")), int(data.get("w")), int(data.get("h"))
        config.update({"roi_x": x, "roi_y": y, "roi_w": w, "roi_h": h})
        display_detector.set_roi(x, y, w, h)
        return jsonify({"status": "ok"})
    except:
        return jsonify({"error": "invalid"}), 400

@app.route('/move_roi', methods=['POST'])
def move_roi():
    data = request.json or {}
    direction = data.get("direction")
    step = 8
    x, y, w, h = config.get("roi_x"), config.get("roi_y"), config.get("roi_w"), config.get("roi_h")
    if direction == "up": y = max(0, y - step)
    elif direction == "down": y = min(480 - h, y + step)
    elif direction == "left": x = max(0, x - step)
    elif direction == "right": x = min(640 - w, x + step)
    elif direction == "wider": w += step
    elif direction == "narrower": w = max(10, w - step)
    elif direction == "taller": h += step
    elif direction == "shorter": h = max(10, h - step)
    config.update({"roi_x": x, "roi_y": y, "roi_w": w, "roi_h": h})
    display_detector.set_roi(x, y, w, h)
    return jsonify({"status": "ok", "roi_x": x, "roi_y": y, "roi_w": w, "roi_h": h})

@app.route('/move_egg_zone', methods=['POST'])
def move_egg_zone():
    data = request.json or {}
    direction = data.get("direction")
    step = 10
    x, y, w, h = config.get("egg_zone_x"), config.get("egg_zone_y"), config.get("egg_zone_w"), config.get("egg_zone_h")
    if direction == "up": y = max(0, y - step)
    elif direction == "down": y = min(480 - h, y + step)
    elif direction == "left": x = max(0, x - step)
    elif direction == "right": x = min(640 - w, x + step)
    elif direction == "wider": w += step
    elif direction == "narrower": w = max(10, w - step)
    elif direction == "taller": h += step
    elif direction == "shorter": h = max(10, h - step)
    config.update({"egg_zone_x": x, "egg_zone_y": y, "egg_zone_w": w, "egg_zone_h": h})
    return jsonify({"status": "ok", "egg_zone_x": x, "egg_zone_y": y, "egg_zone_w": w, "egg_zone_h": h})

@app.route('/save_config', methods=['POST'])
def save_config_endpoint():
    config.save()
    return jsonify({"status": "ok", "message": "Configuración guardada"})

if __name__ == '__main__':
    # El microservicio de IA correrá en el puerto 5000
    app.run(host='0.0.0.0', port=5000, threaded=True)
