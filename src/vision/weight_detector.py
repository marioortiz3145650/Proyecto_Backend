import cv2
import numpy as np
import easyocr
import re
import time
import threading
import argparse
from datetime import datetime
from flask import Flask, Response, jsonify, request

# Procesar argumentos de línea de comandos para seleccionar cámara
parser = argparse.ArgumentParser(description="Detector de Peso por OCR y Cámara")
parser.add_argument("--camera", type=int, default=0, help="Index de la cámara (0, 1, 2, etc.)")
args = parser.parse_args()
camera_index = args.camera

app = Flask(__name__)

# Configuración de CORS manual
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Variables Globales del Estado
current_weight = 0.0
current_category = "N/A"
is_simulation = False  # Por defecto en Modo Real (Cámara)
scan_count = 0
scanned_eggs = []
last_scanned = None

# Dimensiones por defecto de la Región de Interés (ROI)
roi_x = 220
roi_y = 300
roi_w = 200
roi_h = 80

print(f"Inicializando EasyOCR con cámara index {camera_index} (esto puede demorar unos segundos)...")
try:
    reader = easyocr.Reader(['en'], gpu=False)
    print("EasyOCR listo.")
except Exception as e:
    print(f"Error cargando EasyOCR: {e}. Se usará simulación de respaldo.")
    reader = None
    is_simulation = True

# Clasificación de Huevos en Colombia (NTC 1240)
def classify_egg(weight):
    if weight <= 0:
        return "N/A"
    elif weight < 46.0:
        return "C"
    elif weight < 53.0:
        return "B"
    elif weight < 60.0:
        return "A"
    elif weight < 67.0:
        return "AA"
    elif weight < 78.0:
        return "AAA"
    else:
        return "JUMBO"

# Función para procesar y limpiar el texto leído por OCR
def parse_weight_text(text):
    text = text.upper()
    text = text.replace('O', '0').replace('I', '1').replace('L', '1').replace('S', '5').replace('B', '8').replace('G', '')
    
    numbers = re.findall(r'[0-9]+(?:[.,][0-9]+)?', text)
    if not numbers:
        return None
    
    val_str = numbers[0].replace(',', '.')
    try:
        val = float(val_str)
        if 0.0 <= val <= 200.0:
            return val
    except ValueError:
        pass
    return None

# Registro del Huevo Actual
def register_current_egg():
    global scan_count, last_scanned, scanned_eggs
    if current_weight <= 0:
        return False
    
    category = classify_egg(current_weight)
    timestamp = datetime.now().strftime("%H:%M:%S")
    
    egg_record = {
        "id": scan_count + 1,
        "weight": current_weight,
        "category": category,
        "time": timestamp
    }
    
    scanned_eggs.insert(0, egg_record)
    if len(scanned_eggs) > 20:
        scanned_eggs.pop()
        
    last_scanned = egg_record
    scan_count += 1
    print(f"Huevo Registrado: {current_weight}g -> {category} a las {timestamp}")
    return True

camera_frame = None
raw_frame = None  # Almacena el frame limpio para el OCR
frame_lock = threading.Lock()

# Hilo secundario para procesar el OCR de manera asíncrona sin trabar el flujo de video (FPS)
def ocr_processing_thread():
    global current_weight, current_category, is_simulation, raw_frame, roi_x, roi_y, roi_w, roi_h
    print("Iniciando hilo de reconocimiento OCR en segundo plano...")
    
    while True:
        time.sleep(0.3)  # Procesar OCR cada 300ms para no saturar la CPU
        
        if is_simulation or reader is None or raw_frame is None:
            continue
            
        try:
            # Obtener una copia del frame limpio para procesar
            with frame_lock:
                img_to_process = raw_frame.copy()
            
            # Extraer la Región de Interés (ROI)
            roi = img_to_process[roi_y:roi_y + roi_h, roi_x:roi_x + roi_w]
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            
            # Duplicar el tamaño para mejorar la precisión del OCR
            gray_large = cv2.resize(gray, (roi_w * 2, roi_h * 2))
            thresh = cv2.threshold(gray_large, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
            
            results = reader.readtext(thresh)
            if results:
                for bbox, text, prob in results:
                    if prob > 0.3:
                        parsed = parse_weight_text(text)
                        if parsed is not None:
                            current_weight = parsed
                            current_category = classify_egg(current_weight)
                            break
        except Exception as e:
            # Evitar fallos si la imagen está vacía o se redimensiona temporalmente
            pass

def video_capture_loop():
    global current_weight, current_category, camera_frame, raw_frame, is_simulation, roi_x, roi_y, roi_w, roi_h
    
    # Intentar abrir la cámara web especificada
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        print(f"ADVERTENCIA: No se pudo abrir la cámara web con index {camera_index}. Se forzará modo simulación de respaldo.")
        is_simulation = True
    
    print(f"Iniciando loop de procesamiento de video para cámara {camera_index}.")
    
    while True:
        if not is_simulation and cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.01)
                continue
        else:
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.rectangle(frame, (0, 0), (640, 480), (20, 50, 20), -1)
            cv2.putText(frame, "MODO SIMULACION ACTIVO", (130, 200), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)
            cv2.putText(frame, f"Peso Simulado: {current_weight:.1f} g", (170, 250), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (100, 255, 100), 2)
            cv2.putText(frame, f"Categoria: {classify_egg(current_weight)}", (170, 300), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 100), 2)
            ret = True

        # Guardar frame limpio en raw_frame para el hilo de OCR
        if not is_simulation:
            with frame_lock:
                raw_frame = frame.copy()
            
            # Dibujar el rectángulo del ROI en el frame de visualización
            cv2.rectangle(frame, (roi_x, roi_y), (roi_x + roi_w, roi_y + roi_h), (0, 255, 0), 2)
            cv2.putText(frame, "Encuadre la pantalla LCD aqui", (roi_x - 30, roi_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        
        if is_simulation:
            current_category = classify_egg(current_weight)

        # Dibujar peso en la esquina superior derecha del frame
        weight_text = f"{current_weight:.1f} g ({current_category})"
        text_size = cv2.getTextSize(weight_text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
        text_w = text_size[0]
        
        # Fondo negro sólido para asegurar el contraste de la lectura
        cv2.rectangle(frame, (630 - text_w - 15, 10), (630, 45), (0, 0, 0), -1)
        cv2.putText(frame, weight_text, (630 - text_w - 8, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        with frame_lock:
            camera_frame = frame.copy()

        # Mostrar ventana local de OpenCV (Opcional)
        key = 0xFF
        try:
            cv2.imshow(f"Reconocimiento de Peso - SF-400 (Camara {camera_index})", frame)
            key = cv2.waitKey(10) & 0xFF
        except Exception:
            time.sleep(0.01)
        
        if key == ord('q') or key == 27:
            break
        elif key == ord('s') or key == ord('S'):
            is_simulation = not is_simulation
            print(f"Modo cambiado a: {'Simulacion' if is_simulation else 'Real'}")
        elif key == 32:
            register_current_egg()
        elif key == ord('+') or key == 43:
            if is_simulation:
                current_weight = round(min(120.0, current_weight + 1.0), 1)
        elif key == ord('-') or key == 45:
            if is_simulation:
                current_weight = round(max(0.0, current_weight - 1.0), 1)
        elif key == ord('w') or key == 82:
            roi_y = max(0, roi_y - 5)
        elif key == ord('s') or key == 84:
            roi_y = min(480 - roi_h, roi_y + 5)
        elif key == ord('a') or key == 81:
            roi_x = max(0, roi_x - 5)
        elif key == ord('d') or key == 83:
            roi_x = min(640 - roi_w, roi_x + 5)

    if cap.isOpened():
        cap.release()
    try:
        cv2.destroyAllWindows()
    except Exception:
        pass

@app.route('/status', methods=['GET'])
def get_status():
    global current_weight, current_category, is_simulation, scan_count, last_scanned, scanned_eggs
    return jsonify({
        "weight": current_weight,
        "category": current_category,
        "is_simulation": is_simulation,
        "scan_count": scan_count,
        "last_scanned": last_scanned,
        "scanned_eggs": scanned_eggs
    })

@app.route('/set_weight', methods=['POST'])
def set_weight():
    global current_weight
    if not is_simulation:
        return jsonify({"error": "Solo se puede cambiar el peso en modo simulacion"}), 400
    
    data = request.json or {}
    weight = data.get("weight")
    if weight is not None:
        try:
            current_weight = round(float(weight), 1)
            return jsonify({"status": "ok", "weight": current_weight})
        except ValueError:
            return jsonify({"error": "Peso invalido"}), 400
    return jsonify({"error": "Falta parametro weight"}), 400

@app.route('/set_mode', methods=['POST'])
def set_mode():
    global is_simulation
    data = request.json or {}
    mode = data.get("mode")
    if mode == "simulation":
        is_simulation = True
    elif mode == "real":
        is_simulation = False
    else:
        return jsonify({"error": "Modo invalido"}), 400
    return jsonify({"status": "ok", "is_simulation": is_simulation})

@app.route('/register', methods=['POST'])
def register_egg():
    success = register_current_egg()
    if success:
        return jsonify({"status": "ok", "last_scanned": last_scanned})
    return jsonify({"error": "No se puede registrar un peso de 0g o menor"}), 400

@app.route('/clear', methods=['POST'])
def clear_session():
    global scanned_eggs, scan_count, last_scanned
    scanned_eggs = []
    scan_count = 0
    last_scanned = None
    return jsonify({"status": "ok"})

@app.route('/move_roi', methods=['POST'])
def move_roi():
    global roi_x, roi_y, roi_w, roi_h
    data = request.json or {}
    direction = data.get("direction")
    step = 8
    if direction == "up":
        roi_y = max(0, roi_y - step)
    elif direction == "down":
        roi_y = min(480 - roi_h, roi_y + step)
    elif direction == "left":
        roi_x = max(0, roi_x - step)
    elif direction == "right":
        roi_x = min(640 - roi_w, roi_x + step)
    return jsonify({"status": "ok", "roi_x": roi_x, "roi_y": roi_y})

def generate_video_stream():
    global camera_frame
    while True:
        with frame_lock:
            if camera_frame is None:
                img = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(img, "Camara no iniciada", (180, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (100, 100, 100), 2)
                _, encoded_image = cv2.imencode('.jpg', img)
            else:
                _, encoded_image = cv2.imencode('.jpg', camera_frame)
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + encoded_image.tobytes() + b'\r\n')
        time.sleep(0.03)

@app.route('/video_feed')
def video_feed():
    return Response(generate_video_stream(), mimetype='multipart/x-mixed-replace; boundary=frame')

def run_flask():
    print("Iniciando Servidor Flask en http://localhost:5000...")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)

if __name__ == '__main__':
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.daemon = True
    flask_thread.start()
    
    ocr_thread = threading.Thread(target=ocr_processing_thread)
    ocr_thread.daemon = True
    ocr_thread.start()
    
    video_capture_loop()
