import sys
import platform
import cv2
import numpy as np
import easyocr
import re
import time
import threading
import argparse
from datetime import datetime
from flask import Flask, Response, jsonify, request

IS_WINDOWS = platform.system() == 'Windows'
CAP_BACKEND = cv2.CAP_DSHOW if IS_WINDOWS else cv2.CAP_V4L2

parser = argparse.ArgumentParser(description="Detector de Peso por OCR y Cámara")
parser.add_argument("--camera", type=int, default=0, help="Index de la cámara (0, 1, 2, etc.)")
args = parser.parse_args()
camera_index = args.camera

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

current_weight = 0.0
current_category = "N/A"
current_volume = 0.0
egg_length_mm = 0.0
egg_width_mm = 0.0
is_simulation = False
scan_count = 0
scanned_eggs = []
last_scanned = None

roi_x = 220
roi_y = 370
roi_w = 200
roi_h = 80

# Zona donde debe estar el huevo para que se capture su volumen (ajustable con /move_egg_zone)
egg_zone_x = 160
egg_zone_y = 20
egg_zone_w = 350
egg_zone_h = 220

# Calibración: píxeles por milímetro real. Ajustar con /set_calibration
px_per_mm = 2.65
last_ellipse = None  # ((cx,cy),(minor,major),angle) del último huevo detectado, o None
last_hull = None     # Contorno (Convex Hull) del huevo detectado en coordenadas globales

print(f"Inicializando EasyOCR con cámara index {camera_index} (esto puede demorar unos segundos)...")
try:
    reader = easyocr.Reader(['en'], gpu=False)
    print("EasyOCR listo.")
except Exception as e:
    print(f"Error cargando EasyOCR: {e}. El detector funcionará con la cámara real sin OCR.")
    reader = None

def detect_egg_volume(frame):
    """Detecta la superficie limpia del huevo (filtrando sombras) y ajusta una elipse geométrica suave.
    Devuelve (length_mm, width_mm, volume_cm3, ellipse) o (0,0,0,None) si no encuentra nada."""
    global px_per_mm, egg_zone_x, egg_zone_y, egg_zone_w, egg_zone_h
    try:
        h_frame, w_frame = frame.shape[:2]

        zx = max(0, egg_zone_x)
        zy = max(0, egg_zone_y)
        zw = min(egg_zone_w, w_frame - zx)
        zh = min(egg_zone_h, h_frame - zy)
        if zw <= 0 or zh <= 0:
            return 0.0, 0.0, 0.0, None

        zone = frame[zy:zy + zh, zx:zx + zw]

        # 1. Preprocesamiento: Median blur moderado
        denoised = cv2.medianBlur(zone, 5)
        gray_raw = cv2.cvtColor(zone, cv2.COLOR_BGR2GRAY)
        gray_denoised = cv2.cvtColor(denoised, cv2.COLOR_BGR2GRAY)

        # 2. Máscara de fondo
        border_mask = np.ones((zh, zw), dtype=bool)
        border_mask[6:-6, 6:-6] = False

        lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB).astype(np.float32)
        L, A, B = lab[:,:,0], lab[:,:,1], lab[:,:,2]
        
        bg_a_mean = np.mean(A[border_mask])
        bg_b_mean = np.mean(B[border_mask])

        # Distancia cromática (canales A y B de LAB): ignora brillo L (sombras)
        chroma_dist = np.sqrt((A - bg_a_mean)**2 + (B - bg_b_mean)**2)
        dist_norm = cv2.normalize(chroma_dist, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        _, mask_col = cv2.threshold(dist_norm, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        candidate_masks = [mask_col]

        # Máscara de intensidad Otsu
        blur_gray = cv2.GaussianBlur(gray_denoised, (5, 5), 0)
        bg_gray_mean = np.mean(gray_denoised[border_mask])
        is_light_bg = bg_gray_mean > 110

        if is_light_bg:
            _, mask_gray_inv = cv2.threshold(blur_gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            candidate_masks.append(mask_gray_inv)
        else:
            _, mask_gray_norm = cv2.threshold(blur_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            candidate_masks.append(mask_gray_norm)

        # 3. Evaluación de contornos candidatos
        best_candidate = None
        best_score = -1.0
        margin = 3

        kernel_close = np.ones((5, 5), np.uint8)
        kernel_open = np.ones((5, 5), np.uint8)

        for mask in candidate_masks:
            cleaned = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel_close)
            cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel_open)

            contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for c in contours:
                area = cv2.contourArea(c)
                if area < 1000 or area > (zw * zh * 0.88):
                    continue

                x, y, w, h = cv2.boundingRect(c)
                if x <= margin or y <= margin or (x + w) >= (zw - margin) or (y + h) >= (zh - margin):
                    continue

                if len(c) < 5:
                    continue

                hull = cv2.convexHull(c)
                hull_area = cv2.contourArea(hull)
                if hull_area <= 0:
                    continue
                solidity = area / hull_area
                if solidity < 0.80:
                    continue

                # Ajuste directo de elipse suave (fitEllipseDirect)
                try:
                    ellipse_candidate = cv2.fitEllipseDirect(c)
                except Exception:
                    ellipse_candidate = cv2.fitEllipse(c)

                (minor_ax, major_ax) = ellipse_candidate[1]
                if minor_ax <= 0:
                    continue
                aspect = major_ax / minor_ax
                if aspect < 1.05 or aspect > 2.3:
                    continue

                ellipse_area = (np.pi / 4.0) * major_ax * minor_ax
                ellipse_ratio = area / ellipse_area if ellipse_area > 0 else 0
                if ellipse_ratio < 0.70 or ellipse_ratio > 1.30:
                    continue

                score = area * (solidity ** 2) * (1.0 - min(0.5, abs(1.0 - ellipse_ratio)))
                if score > best_score:
                    best_score = score
                    best_candidate = (c, ellipse_candidate)

        if best_candidate is None:
            return 0.0, 0.0, 0.0, None

        candidate, ellipse_zone = best_candidate
        (ecx, ecy), (minor_axis, major_axis), angle = ellipse_zone

        ellipse = ((ecx + zx, ecy + zy), (minor_axis, major_axis), angle)

        length_px = max(minor_axis, major_axis)
        width_px = min(minor_axis, major_axis)

        length_mm = length_px / px_per_mm
        width_mm = width_px / px_per_mm

        length_cm = length_mm / 10.0
        width_cm = width_mm / 10.0
        volume_cm3 = 0.5236 * length_cm * (width_cm ** 2)

        return round(length_mm, 1), round(width_mm, 1), round(volume_cm3, 2), ellipse
    except Exception:
        return 0.0, 0.0, 0.0, None

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
        "length_mm": egg_length_mm,
        "width_mm": egg_width_mm,
        "volume_cm3": current_volume,
        "time": timestamp
    }
    scanned_eggs.insert(0, egg_record)
    if len(scanned_eggs) > 20:
        scanned_eggs.pop()
    last_scanned = egg_record
    scan_count += 1
    print(f"Huevo Registrado: {current_weight}g -> {category} | Volumen: {current_volume}cm3 a las {timestamp}")
    return True

camera_frame = None
raw_frame = None
frame_lock = threading.Lock()
cap_lock = threading.Lock()
cap = None
switch_camera_to = None  # índice pendiente de aplicar, o None si no hay cambio pedido

def open_camera(index):
    """Abre una cámara por índice liberando la anterior si existe. Si el índice no abre, busca automáticamente otras cámaras activas."""
    global cap, camera_index
    with cap_lock:
        if cap is not None and cap.isOpened():
            cap.release()
        
        # Probar primero el índice solicitado
        new_cap = cv2.VideoCapture(index, CAP_BACKEND)
        if new_cap.isOpened():
            cap = new_cap
            return True
        
        new_cap.release()

        # Si el índice inicial falló, escanear cámaras del sistema (0..4)
        for alt_idx in range(5):
            if alt_idx == index:
                continue
            alt_cap = cv2.VideoCapture(alt_idx, CAP_BACKEND)
            if alt_cap.isOpened():
                print(f"Cámara en índice {index} no respondió. Se seleccionó automáticamente la cámara en índice {alt_idx}.")
                camera_index = alt_idx
                cap = alt_cap
                return True
            alt_cap.release()

        cap = None
        return False

def ocr_processing_thread():
    global current_weight, current_category, is_simulation, raw_frame, roi_x, roi_y, roi_w, roi_h
    print("Iniciando hilo de reconocimiento OCR en segundo plano...")
    while True:
        time.sleep(0.3)
        if is_simulation or reader is None or raw_frame is None:
            continue
        try:
            with frame_lock:
                img_to_process = raw_frame.copy()
            roi = img_to_process[roi_y:roi_y + roi_h, roi_x:roi_x + roi_w]
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
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
        except Exception:
            pass

def volume_processing_thread():
    """Corre en paralelo al OCR: detecta el contorno del huevo y calcula largo/ancho/volumen."""
    global current_volume, egg_length_mm, egg_width_mm, is_simulation, raw_frame, last_ellipse
    print("Iniciando hilo de detección de volumen en segundo plano...")
    while True:
        time.sleep(0.2)
        if is_simulation or raw_frame is None:
            continue
        try:
            with frame_lock:
                img_to_process = raw_frame.copy()
            length_mm, width_mm, volume_cm3, ellipse = detect_egg_volume(img_to_process)
            if ellipse is not None:
                egg_length_mm = length_mm
                egg_width_mm = width_mm
                current_volume = volume_cm3
                last_ellipse = ellipse
            else:
                last_ellipse = None
        except Exception:
            pass

def video_capture_loop():
    global current_weight, current_category, camera_frame, raw_frame, is_simulation, roi_x, roi_y, roi_w, roi_h
    global camera_index, switch_camera_to, cap

    ok = open_camera(camera_index)
    if not ok:
        print(f"ADVERTENCIA: No se pudo abrir la cámara web con index {camera_index}. Se forzará modo simulación de respaldo.")
        is_simulation = True

    print(f"Iniciando loop de procesamiento de video para cámara {camera_index}.")

    while True:
        # Atender cambio de cámara pedido desde /switch_camera
        if switch_camera_to is not None:
            requested = switch_camera_to
            switch_camera_to = None
            if requested != camera_index:
                print(f"Cambiando de cámara {camera_index} -> {requested}")
                opened = open_camera(requested)
                camera_index = requested
                if opened:
                    is_simulation = False
                else:
                    print(f"No se pudo abrir la cámara {requested}, se usará simulación.")
                    is_simulation = True

        with cap_lock:
            cap_ok = cap is not None and cap.isOpened()

        if not is_simulation and cap_ok:
            with cap_lock:
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

        if not is_simulation:
            with frame_lock:
                raw_frame = frame.copy()
            cv2.rectangle(frame, (roi_x, roi_y), (roi_x + roi_w, roi_y + roi_h), (0, 255, 0), 2)
            cv2.putText(frame, "Encuadre la pantalla LCD aqui", (roi_x - 30, roi_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

            cv2.rectangle(frame, (egg_zone_x, egg_zone_y), (egg_zone_x + egg_zone_w, egg_zone_y + egg_zone_h), (255, 0, 255), 2)
            cv2.putText(frame, "Ponga el huevo aqui", (egg_zone_x, egg_zone_y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 255), 1)

        if is_simulation:
            current_category = classify_egg(current_weight)

        weight_text = f"{current_weight:.1f} g ({current_category})"
        text_size = cv2.getTextSize(weight_text, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
        text_w = text_size[0]
        cv2.rectangle(frame, (630 - text_w - 15, 10), (630, 45), (0, 0, 0), -1)
        cv2.putText(frame, weight_text, (630 - text_w - 8, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)


        if not is_simulation:
            vol_text = f"Vol: {current_volume} cm3  L:{egg_length_mm}mm  A:{egg_width_mm}mm"
            cv2.putText(frame, vol_text, (10, 445), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 200, 255), 2)

            # Dibuja la elipse geométrica suave sobre el huevo real, en cian
            if last_ellipse is not None:
                cv2.ellipse(frame, last_ellipse, (255, 255, 0), 2)
                (ecx, ecy), _, _ = last_ellipse
                cv2.circle(frame, (int(ecx), int(ecy)), 3, (255, 255, 0), -1)

            # Regla de calibración: barra de 50mm fija en la esquina, según px_per_mm actual.
            # Ajusta px_per_mm hasta que esta barra mida lo mismo que un objeto real de 5cm
            # puesto a la misma altura/distancia que el huevo.
            ruler_mm = 50
            ruler_px = int(ruler_mm * px_per_mm)
            ruler_x0, ruler_y0 = 10, 20
            cv2.line(frame, (ruler_x0, ruler_y0), (ruler_x0 + ruler_px, ruler_y0), (0, 255, 255), 3)
            cv2.putText(frame, f"{ruler_mm}mm ref (px_per_mm={px_per_mm})", (ruler_x0, ruler_y0 - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1)

        with frame_lock:
            camera_frame = frame.copy()

        time.sleep(0.01)

@app.route('/status', methods=['GET'])
def get_status():
    global current_weight, current_category, is_simulation, scan_count, last_scanned, scanned_eggs, camera_index
    global current_volume, egg_length_mm, egg_width_mm, px_per_mm
    return jsonify({
        "weight": current_weight,
        "category": current_category,
        "is_simulation": is_simulation,
        "scan_count": scan_count,
        "last_scanned": last_scanned,
        "scanned_eggs": scanned_eggs,
        "camera_index": camera_index,
        "volume_cm3": current_volume,
        "length_mm": egg_length_mm,
        "width_mm": egg_width_mm,
        "px_per_mm": px_per_mm
    })

@app.route('/set_calibration', methods=['POST'])
def set_calibration():
    """Ajusta píxeles por milímetro. Usar un objeto de tamaño conocido en el ROI y calcular:
    px_per_mm = ancho_en_pixeles_del_objeto / ancho_real_mm_del_objeto"""
    global px_per_mm
    data = request.json or {}
    value = data.get("px_per_mm")
    if value is None:
        return jsonify({"error": "Falta parametro px_per_mm"}), 400
    try:
        px_per_mm = round(float(value), 3)
        return jsonify({"status": "ok", "px_per_mm": px_per_mm})
    except ValueError:
        return jsonify({"error": "px_per_mm invalido"}), 400

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

@app.route('/move_egg_zone', methods=['POST'])
def move_egg_zone():
    global egg_zone_x, egg_zone_y, egg_zone_w, egg_zone_h
    data = request.json or {}
    direction = data.get("direction")
    step = 10
    if direction == "up":
        egg_zone_y = max(0, egg_zone_y - step)
    elif direction == "down":
        egg_zone_y = min(480 - egg_zone_h, egg_zone_y + step)
    elif direction == "left":
        egg_zone_x = max(0, egg_zone_x - step)
    elif direction == "right":
        egg_zone_x = min(640 - egg_zone_w, egg_zone_x + step)
    return jsonify({"status": "ok", "egg_zone_x": egg_zone_x, "egg_zone_y": egg_zone_y, "egg_zone_w": egg_zone_w, "egg_zone_h": egg_zone_h})

@app.route('/set_egg_zone', methods=['POST'])
def set_egg_zone():
    """Define la zona completa de una vez: {x, y, w, h}"""
    global egg_zone_x, egg_zone_y, egg_zone_w, egg_zone_h
    data = request.json or {}
    try:
        egg_zone_x = int(data.get("x", egg_zone_x))
        egg_zone_y = int(data.get("y", egg_zone_y))
        egg_zone_w = int(data.get("w", egg_zone_w))
        egg_zone_h = int(data.get("h", egg_zone_h))
    except (ValueError, TypeError):
        return jsonify({"error": "Parametros invalidos"}), 400
    return jsonify({"status": "ok", "egg_zone_x": egg_zone_x, "egg_zone_y": egg_zone_y, "egg_zone_w": egg_zone_w, "egg_zone_h": egg_zone_h})

@app.route('/switch_camera', methods=['POST'])
def switch_camera():
    """Cambia la cámara activa en caliente, sin reiniciar el proceso."""
    global switch_camera_to
    data = request.json or {}
    index = data.get("index")
    if index is None:
        return jsonify({"error": "Falta parametro index"}), 400
    try:
        switch_camera_to = int(index)
    except (ValueError, TypeError):
        return jsonify({"error": "index invalido"}), 400
    return jsonify({"status": "ok", "requested_index": switch_camera_to})

@app.route('/list_cameras', methods=['GET'])
def list_cameras():
    """Devuelve índices reales con su nombre físico (Windows DirectShow o Linux V4L2)."""
    global camera_index, cap
    cameras = []
    
    # 1. Intentar obtener nombres físicos reales por sistema operativo
    if platform.system() == 'Windows':
        try:
            from pygrabber.dshow_graph import FilterGraph
            devices = FilterGraph().get_input_devices()
            for index, name in enumerate(devices):
                cameras.append({"index": index, "name": name})
        except Exception:
            pass
    else:
        # Linux V4L2
        import os
        for i in range(10):
            sys_path = f"/sys/class/video4linux/video{i}/name"
            if os.path.exists(sys_path):
                try:
                    with open(sys_path, "r") as f:
                        name = f.read().strip()
                    cameras.append({"index": i, "name": name})
                except Exception:
                    pass

    # 2. Si no se detectaron cámaras o falló la consulta, usar fallback con cv2
    if not cameras:
        for i in range(5):
            if i == camera_index and cap is not None and cap.isOpened():
                name = "Cámara USB" if i == 0 else ("Cámara PC" if i == 1 else f"Cámara {i}")
                cameras.append({"index": i, "name": name})
                continue
            test_cap = cv2.VideoCapture(i, CAP_BACKEND)
            if test_cap.isOpened():
                name = "Cámara USB" if i == 0 else ("Cámara PC" if i == 1 else f"Cámara {i}")
                cameras.append({"index": i, "name": name})
                test_cap.release()
                
    return jsonify({"cameras": cameras})

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

    volume_thread = threading.Thread(target=volume_processing_thread)
    volume_thread.daemon = True
    volume_thread.start()

    video_capture_loop()