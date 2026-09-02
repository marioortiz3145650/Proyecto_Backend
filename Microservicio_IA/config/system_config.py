import os
import json
import hashlib
from datetime import datetime

CONFIG_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "roi_config.json")

DEFAULT_CONFIG = {
    # Calibración de Cámara
    "pixels_per_cm": 26.5,          # Equivalente a 2.65 px/mm
    "calibration_status": "NO_CALIBRADO", # "CALIBRADO", "NO_CALIBRADO", "RECALIBRAR_REQUERIDO"
    "calibration_date": "",
    "calibration_ref_size_cm": 5.0,
    "camera_resolution": "640x480",
    "camera_width": 640,
    "camera_height": 480,
    "camera_index": 1,
    "camera_config_hash": "",
    "parallax_factor": 0.714,

    # Encuadres ROI
    "roi_x": 240,
    "roi_y": 365,
    "roi_w": 150,
    "roi_h": 75,
    "egg_zone_x": 160,
    "egg_zone_y": 20,
    "egg_zone_w": 350,
    "egg_zone_h": 220,

    # Parámetros Visión / Detección Huevo
    "brightness": 0,
    "contrast": 1.0,
    "min_area": 300,
    "max_area": 100000,
    "threshold": 0,                # 0 = automático (Otsu/HSV)

    # Filtrado y Estabilidad
    "min_confidence": 0.70,        # 70% de confianza mínima
    "stability_frames": 5,          # Cuadros consecutivos estables requeridos
    "weight_window_size": 7,

    # Modelo PyTorch ML
    "pytorch_model_path": os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "digit_model.pt")
}

class SystemConfig:
    def __init__(self, filepath=CONFIG_FILE):
        self.filepath = filepath
        self.data = DEFAULT_CONFIG.copy()
        self.load()

    def load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, 'r', encoding='utf-8') as f:
                    loaded = json.load(f)
                    # Compatibilidad con campos antiguos (px_per_mm)
                    if "px_per_mm" in loaded and "pixels_per_cm" not in loaded:
                        loaded["pixels_per_cm"] = float(loaded["px_per_mm"]) * 10.0
                    self.data.update(loaded)
            except Exception as e:
                print(f"[CONFIG] Error al cargar configuración: {e}")

    def save(self):
        try:
            # Mantener px_per_mm para retrocompatibilidad con WPF si lo requiere
            self.data["px_per_mm"] = round(self.data["pixels_per_cm"] / 10.0, 3)
            with open(self.filepath, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"[CONFIG] Error al guardar configuración: {e}")
            return False

    def compute_cam_hash(self, width, height, cam_idx=0):
        raw = f"{width}x{height}_cam{cam_idx}"
        return hashlib.md5(raw.encode()).hexdigest()

    def check_camera_changed(self, current_width, current_height, cam_idx=0):
        current_res = f"{current_width}x{current_height}"
        current_hash = self.compute_cam_hash(current_width, current_height, cam_idx)
        
        if self.data["calibration_status"] == "CALIBRADO":
            if self.data["camera_resolution"] != current_res or self.data["camera_config_hash"] != current_hash:
                print("[CONFIG] ADVERTENCIA: La configuración o resolución de la cámara cambió. Se requiere recalibración.")
                self.data["calibration_status"] = "RECALIBRAR_REQUERIDO"
                self.save()
                return True
        return False

    def update(self, new_kwargs):
        for k, v in new_kwargs.items():
            if k in self.data:
                self.data[k] = v
        self.save()

    def get(self, key, default=None):
        return self.data.get(key, default)
