import numpy as np
import cv2

class VolumeCalculator:
    """
    PARTE 4 — CÁLCULO DEL VOLUMEN
    Y PARTE 17 — REQUISITO Y NOTA SOBRE POSICIÓN DE CÁMARA

    Implementa el método de discos/secciones transversales:
    V ≈ Σ π r² Δh  (unidades en cm -> resultado en cm³)

    NOTA DE ARQUITECTURA (PARTE 17):
    Si la cámara está ubicada cenitalmente (desde arriba), se asume simetría de revolución axial
    debido a que la tercera dimensión no es directamente visible en 2D superior.
    La arquitectura está preparada para recibir un perfil de cámara lateral si se integra en el futuro.
    """
    CAMERA_POSITION_TOP = "TOP_DOWN"
    CAMERA_POSITION_SIDE = "SIDE_VIEW"

    def __init__(self, camera_position="TOP_DOWN"):
        self.camera_position = camera_position

    def calculate_disk_volume(self, mask, contour, pixels_per_cm, num_disks=50, parallax_factor=1.0):
        """
        Método de Integración Numérica por Discos/Secciones (Slicing):
        1. Encontrar el eje principal del huevo.
        2. Cortar el contorno en `num_disks` secciones a lo largo de su longitud.
        3. Para cada sección: radio_cm = ancho_seccion_cm / 2, Δh_cm = espesor_disco_cm.
        4. V ≈ Σ π r² Δh (en cm³).
        """
        if contour is None or mask is None or pixels_per_cm <= 0:
            return 0.0

        # Obtener Bounding Box rotado para alinear con el eje mayor
        rect = cv2.minAreaRect(contour)
        (cx, cy), (w_box, h_box), angle = rect

        # Determinar orientación (eje mayor como eje X al alinear)
        major_axis = max(w_box, h_box)
        minor_axis = min(w_box, h_box)

        if major_axis <= 0 or minor_axis <= 0:
            return 0.0

        # Rotar la máscara para que el huevo quede horizontal y perfectamente alineado
        center = (int(cx), int(cy))
        rot_angle = angle if w_box >= h_box else angle + 90.0
        M = cv2.getRotationMatrix2D(center, rot_angle, 1.0)
        h_m, w_m = mask.shape[:2]
        rotated_mask = cv2.warpAffine(mask, M, (w_m, h_m), flags=cv2.INTER_NEAREST)

        # Encontrar contorno rotado
        rot_cnts, _ = cv2.findContours(rotated_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not rot_cnts:
            return 0.0

        rot_c = max(rot_cnts, key=cv2.contourArea)
        rx, ry, rw, rh = cv2.boundingRect(rot_c)

        if rw <= 0 or rh <= 0:
            return 0.0

        # Discretización por discos (Aplicando Parallax Factor a las medidas lineales)
        dx_px = float(rw) / float(num_disks)
        dx_cm = (dx_px * parallax_factor) / float(pixels_per_cm)
        total_vol_cm3 = 0.0

        for i in range(num_disks):
            x_start = int(rx + i * dx_px)
            x_end = int(rx + (i + 1) * dx_px)
            if x_start >= rotated_mask.shape[1] or x_end <= x_start:
                continue

            slice_col = rotated_mask[ry:ry + rh, x_start:x_end]
            # Contar píxeles blancos en la columna de la sección
            white_px = cv2.countNonZero(slice_col)
            if white_px <= 0:
                continue

            # El ancho de la sección en píxeles es la altura promedio de la columna
            slice_width_px = float(white_px) / float(x_end - x_start)
            slice_width_cm = (slice_width_px * parallax_factor) / float(pixels_per_cm)
            radius_cm = slice_width_cm / 2.0

            # Volumen del disco = π * r² * Δh
            disk_vol = np.pi * (radius_cm ** 2) * dx_cm
            total_vol_cm3 += disk_vol

        return round(total_vol_cm3, 2)

    def calculate_ellipsoid_volume(self, largo_cm, ancho_cm):
        """Fórmula Elipsoide Prolato: V = (π / 6) * Largo * Ancho²"""
        if largo_cm <= 0 or ancho_cm <= 0:
            return 0.0
        return round((np.pi / 6.0) * largo_cm * (ancho_cm ** 2), 2)

    def calculate_narushin_volume(self, largo_cm, ancho_cm):
        """Fórmula Narushin para huevos avícolas reales: V = (0.6057 - 0.0018 * W_mm) * L * W²"""
        if largo_cm <= 0 or ancho_cm <= 0:
            return 0.0
        width_mm = ancho_cm * 10.0
        coeff = 0.6057 - 0.0018 * width_mm
        return round(coeff * largo_cm * (ancho_cm ** 2), 2)

    def calculate_all(self, mask, contour, largo_cm, ancho_cm, pixels_per_cm, weight_g=0.0, parallax_factor=1.0):
        """
        Calcula el volumen usando el método de discos y métodos geométricos de respaldo.
        """
        vol_disks = self.calculate_disk_volume(mask, contour, pixels_per_cm, num_disks=50, parallax_factor=parallax_factor)
        vol_ellip = self.calculate_ellipsoid_volume(largo_cm, ancho_cm)
        vol_narushin = self.calculate_narushin_volume(largo_cm, ancho_cm)

        # Si el método de discos dio un valor válido, es el método principal basado en perfil real
        main_vol = vol_disks if vol_disks > 0 else vol_narushin

        print(f"[DEBUG MEDICIÓN] Volumen_final: {main_vol:.2f} cm³")
        return {
            "volumen_cm3": main_vol,
            "volumen_discos_cm3": vol_disks,
            "volumen_elipsoide_cm3": vol_ellip,
            "volumen_narushin_cm3": vol_narushin,
            "camera_position_note": (
                "Visión Cenital (Top-Down): Se asume simetría de revolución axial. "
                "Para mayor precisión tridimensional en tiempo real, el sistema soporta integrar una vista lateral."
            )
        }
