import os
import json
from datetime import datetime

class CalibrationManager:
    """
    PARTE 1 — CALIBRACIÓN DE LA CÁMARA
    Administra la calibración física pixels_per_cm y el estado del sistema.
    """
    def __init__(self, config):
        self.config = config

    @property
    def pixels_per_cm(self):
        val = self.config.get("pixels_per_cm", 26.5)
        return val if val > 0 else 26.5

    @property
    def status(self):
        return self.config.get("calibration_status", "NO_CALIBRADO")

    @property
    def calibration_date(self):
        return self.config.get("calibration_date", "")

    def calibrate_from_reference(self, detected_pixels, real_size_cm, image_width=640, image_height=480, camera_idx=0):
        """
        Calcula: pixels_per_cm = pixels_detected / real_size_cm
        Y guarda la calibración con fecha, resolución y hash de cámara.
        """
        if real_size_cm <= 0 or detected_pixels <= 0:
            return False, "Valores de entrada inválidos para calibración."

        px_cm = round(detected_pixels / float(real_size_cm), 4)
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        res_str = f"{image_width}x{image_height}"
        cam_hash = self.config.compute_cam_hash(image_width, image_height, camera_idx)

        self.config.update({
            "pixels_per_cm": px_cm,
            "calibration_status": "CALIBRADO",
            "calibration_date": now_str,
            "calibration_ref_size_cm": real_size_cm,
            "camera_resolution": res_str,
            "camera_width": image_width,
            "camera_height": image_height,
            "camera_config_hash": cam_hash
        })

        return True, f"Calibración exitosa: {px_cm:.2f} px/cm guardada el {now_str}"

    def reset_calibration(self):
        """Restablece la calibración a los valores predeterminados."""
        self.config.update({
            "pixels_per_cm": 26.5,
            "calibration_status": "NO_CALIBRADO",
            "calibration_date": "",
            "calibration_ref_size_cm": 5.0,
            "camera_resolution": "640x480",
            "camera_width": 640,
            "camera_height": 480,
            "camera_config_hash": ""
        })
        return True, "Calibración restablecida por defecto."

    def check_calibration_integrity(self, current_width, current_height, camera_idx=0):
        """Verifica si la resolución o configuración cambió."""
        return self.config.check_camera_changed(current_width, current_height, camera_idx)

    def get_info(self):
        return {
            "status": self.status,
            "pixels_per_cm": self.pixels_per_cm,
            "date": self.calibration_date,
            "resolution": self.config.get("camera_resolution", "640x480"),
            "ref_size_cm": self.config.get("calibration_ref_size_cm", 5.0)
        }
