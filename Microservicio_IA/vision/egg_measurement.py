import cv2
import numpy as np

class EggMeasurement:
    """
    PARTE 3 — MEDICIÓN DEL HUEVO
    Calcula dimensiones físicas en centímetros usando EXCLUSIVAMENTE pixels_per_cm.
    """
    def __init__(self, calibration_manager):
        self.calibration_manager = calibration_manager

    def measure(self, contour, hull, ellipse_or_rect):
        """
        Dada la geometría del huevo en píxeles y la calibración actual,
        devuelve las métricas completas en centímetros (y mm para compatibilidad).
        """
        px_per_cm = self.calibration_manager.pixels_per_cm
        if px_per_cm <= 0:
            px_per_cm = 26.5

        if contour is None:
            return None

        area_px = float(cv2.contourArea(contour))
        perimeter_px = float(cv2.arcLength(contour, True))

        if ellipse_or_rect is not None:
            try:
                (cx, cy), (d1, d2), angle = ellipse_or_rect
                major_axis_px = max(d1, d2)
                minor_axis_px = min(d1, d2)
            except Exception:
                rect = cv2.minAreaRect(contour)
                (cx, cy), (w_box, h_box), angle = rect
                major_axis_px = max(w_box, h_box)
                minor_axis_px = min(w_box, h_box)
        else:
            rect = cv2.minAreaRect(contour)
            (cx, cy), (w_box, h_box), angle = rect
            major_axis_px = max(w_box, h_box)
            minor_axis_px = min(w_box, h_box)

        parallax_factor = self.calibration_manager.config.get("parallax_factor", 1.0)

        # Conversión a centímetros usando pixels_per_cm y ajustando por paralaje 3D
        largo_cm = round((major_axis_px * parallax_factor) / px_per_cm, 2)
        ancho_cm = round((minor_axis_px * parallax_factor) / px_per_cm, 2)
        area_cm2 = round((area_px * (parallax_factor ** 2)) / (px_per_cm ** 2), 2)
        perimeter_cm = round((perimeter_px * parallax_factor) / px_per_cm, 2)
        
        # LOGS INTERNOS (Requeridos por el usuario, sin afectar la UI visual)
        print(f"[DEBUG MEDICIÓN] Largo_px: {major_axis_px:.1f}, Ancho_px: {minor_axis_px:.1f}, pixels_per_cm: {px_per_cm:.2f}, parallax_factor: {parallax_factor:.2f}")
        print(f"[DEBUG MEDICIÓN] Largo_cm: {largo_cm:.2f}, Ancho_cm: {ancho_cm:.2f}")

        # Para retrocompatibilidad con interfaces que usaban mm
        length_mm = round(largo_cm * 10.0, 1)
        width_mm = round(ancho_cm * 10.0, 1)

        return {
            "largo_cm": largo_cm,
            "ancho_cm": ancho_cm,
            "length_mm": length_mm,
            "width_mm": width_mm,
            "area_cm2": area_cm2,
            "perimeter_cm": perimeter_cm,
            "center_px": (round(cx, 1), round(cy, 1)),
            "major_axis_px": round(major_axis_px, 1),
            "minor_axis_px": round(minor_axis_px, 1),
            "pixels_per_cm": round(px_per_cm, 2)
        }
