import cv2
import numpy as np

class EggDetector:
    """
    Detector de huevos de alta precisión basado en segmentación cromática y filtrado geométrico.
    Aísla EXCLUSIVAMENTE la superficie del huevo y descarta el plato de la báscula,
    el papel milimetrado o los bordes del recuadro de interés (ROI).
    """
    def __init__(self, min_area=500, max_area=25000):
        self.min_area = min_area
        self.max_area = max_area

    def get_egg_mask(self, bgr_image):
        """
        Segmenta el huevo aislando su color café/naranjoso/crema del plato blanco de la báscula.
        """
        hsv = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        b, g, r = cv2.split(bgr_image)

        # 1. Rango HSV para cáscara de huevo café / beige / naranja
        # Exige Saturación S >= 35 para excluir papel milimetrado blanco/gris (S < 25)
        lower_hsv1 = np.array([0, 35, 30], dtype=np.uint8)
        upper_hsv1 = np.array([28, 255, 245], dtype=np.uint8)
        mask_hsv1 = cv2.inRange(hsv, lower_hsv1, upper_hsv1)

        lower_hsv2 = np.array([160, 35, 30], dtype=np.uint8)
        upper_hsv2 = np.array([180, 255, 245], dtype=np.uint8)
        mask_hsv2 = cv2.inRange(hsv, lower_hsv2, upper_hsv2)

        color_mask = cv2.bitwise_or(mask_hsv1, mask_hsv2)

        # 2. Condición BGR: En huevos café/naranja, el canal Rojo (R) supera ampliamente al Azul (B)
        # R - B > 22 y R - G > 3 descarta superficies blancas, grises o verdosas del plato
        diff_rb = cv2.subtract(r, b)
        diff_rg = cv2.subtract(r, g)
        _, mask_rb = cv2.threshold(diff_rb, 22, 255, cv2.THRESH_BINARY)
        _, mask_rg = cv2.threshold(diff_rg, 3, 255, cv2.THRESH_BINARY)
        
        bgr_warm_mask = cv2.bitwise_and(mask_rb, mask_rg)

        # Máscara combinada por color cálido y saturación
        egg_color_mask = cv2.bitwise_and(color_mask, bgr_warm_mask)

        # 3. Respaldo por gradiente/bordes Canny si el huevo es de color muy claro (blanco)
        if cv2.countNonZero(egg_color_mask) < self.min_area:
            gray = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            edges = cv2.Canny(blurred, 30, 100)
            kernel_edge = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
            egg_color_mask = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel_edge, iterations=2)

        return egg_color_mask

    def detect(self, image):
        if image is None or image.size == 0:
            return False, None, None, None, None

        img_h, img_w = image.shape[:2]
        total_roi_area = float(img_h * img_w)

        # LÍMITES CRÍTICOS: Un huevo individual ocupa entre el 2% y el 35% del recuadro ZONA HUEVO.
        # Cualquier contorno mayor al 38% es el plato entero de la báscula o el ROI completo.
        max_allowed_area = int(total_roi_area * 0.38)
        min_allowed_area = max(self.min_area, int(total_roi_area * 0.015))

        # 1. Obtener la máscara de color del huevo
        raw_mask = self.get_egg_mask(image)

        # 2. Operaciones morfológicas para unir la cáscara y eliminar pequeños puntos de ruido
        kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
        kernel_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        
        closed = cv2.morphologyEx(raw_mask, cv2.MORPH_CLOSE, kernel_close, iterations=2)
        clean_mask = cv2.morphologyEx(closed, cv2.MORPH_OPEN, kernel_open, iterations=1)

        # 3. Encontrar contornos candidatos
        contours, _ = cv2.findContours(clean_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        best_contour = None
        best_ellipse = None
        best_hull = None
        best_score = -1.0

        center_roi = (img_w / 2.0, img_h / 2.0)

        for cnt in contours:
            area = cv2.contourArea(cnt)
            
            # FILTRO ESENCIAL: Rechazar el plato o el ROI completo si excede el tamaño máximo de un huevo
            if area < min_allowed_area or area > max_allowed_area:
                continue

            hull = cv2.convexHull(cnt)
            hull_area = cv2.contourArea(hull)
            if hull_area <= 0:
                continue

            solidity = area / float(hull_area)

            # Un huevo tiene forma convexa suave (solidez >= 0.78)
            if solidity < 0.76:
                continue

            # Evaluar elipse ajustada si hay suficientes puntos
            if len(cnt) >= 5:
                try:
                    ellipse = cv2.fitEllipse(cnt)
                    (cx, cy), (d1, d2), angle = ellipse
                    major_axis = max(d1, d2)
                    minor_axis = min(d1, d2)

                    if minor_axis <= 0:
                        continue

                    aspect_ratio = major_axis / float(minor_axis)

                    # Proporción de aspecto del huevo (entre 1.08 y 2.1)
                    if 1.05 <= aspect_ratio <= 2.15:
                        # Priorizar el contorno que esté más centrado en la zona y tenga tamaño realista
                        dist_to_center = np.hypot(cx - center_roi[0], cy - center_roi[1])
                        # Puntuación basada en área y centralidad
                        score = area / (1.0 + dist_to_center * 0.05)
                        
                        if score > best_score:
                            best_score = score
                            best_contour = cnt
                            best_ellipse = ellipse
                            best_hull = hull
                except Exception:
                    pass

            # Respaldo geométrico sin elipse
            if best_contour is None and solidity >= 0.80:
                dist_to_center = np.hypot(cv2.moments(cnt)['m10']/cv2.moments(cnt)['m00'] - center_roi[0], 
                                          cv2.moments(cnt)['m01']/cv2.moments(cnt)['m00'] - center_roi[1]) if cv2.moments(cnt)['m00'] > 0 else 0
                score = area / (1.0 + dist_to_center * 0.05)
                if score > best_score:
                    best_score = score
                    best_contour = cnt
                    best_hull = hull
                    rect = cv2.minAreaRect(cnt)
                    best_ellipse = rect

        if best_contour is not None:
            # Rellenar EXCLUSIVAMENTE el contorno del huevo detectado
            egg_mask = np.zeros((img_h, img_w), dtype=np.uint8)
            cv2.drawContours(egg_mask, [best_contour], -1, 255, -1)
            return True, best_contour, egg_mask, best_hull, best_ellipse

        return False, None, clean_mask, None, None

    def draw_detection_overlay(self, frame, contour, ellipse, offset_x=0, offset_y=0):
        """
        Dibuja la sobreposición visual bordando ÚNICAMENTE la forma del huevo.
        """
        if frame is None or contour is None:
            return frame

        output = frame.copy()
        shifted_contour = contour + np.array([offset_x, offset_y], dtype=np.int32)
        
        # Dibujar contorno verde lima ajustado al borde exacto del huevo
        cv2.drawContours(output, [shifted_contour], -1, (0, 255, 127), 2)

        # Dibujar elipse rosa bordeando el huevo
        if ellipse is not None:
            try:
                (cx, cy), (d1, d2), angle = ellipse
                shifted_ellipse = ((cx + offset_x, cy + offset_y), (d1, d2), angle)
                cv2.ellipse(output, shifted_ellipse, (255, 0, 255), 2)
                cv2.circle(output, (int(cx + offset_x), int(cy + offset_y)), 4, (0, 0, 255), -1)
            except Exception:
                pass

        return output