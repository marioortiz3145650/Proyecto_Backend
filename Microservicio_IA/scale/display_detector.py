import cv2
import numpy as np

class DisplayDetector:
    """
    PARTE 8 — DETECCIÓN Y PROCESAMIENTO DE LA PANTALLA DE BÁSCULA
    Procesa la región de pantalla LCD/LED con super-resolución, reducción de ruido,
    nitidez (sharpening), mejora de contraste y threshold adaptativo.
    """
    def __init__(self, roi_x=240, roi_y=365, roi_w=150, roi_h=75):
        self.roi_x = roi_x
        self.roi_y = roi_y
        self.roi_w = roi_w
        self.roi_h = roi_h
        self.sharpen_kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)

    def set_roi(self, x, y, w, h):
        self.roi_x = int(max(0, x))
        self.roi_y = int(max(0, y))
        self.roi_w = int(max(10, w))
        self.roi_h = int(max(10, h))

    def crop_display(self, frame):
        """Recorta la región de pantalla según el ROI configurado."""
        if frame is None or frame.size == 0:
            return None

        h, w = frame.shape[:2]
        rx = min(self.roi_x, w - 10)
        ry = min(self.roi_y, h - 10)
        rw = min(self.roi_w, w - rx)
        rh = min(self.roi_h, h - ry)

        if rw <= 10 or rh <= 10:
            return None

        return frame[ry:ry + rh, rx:rx + rw].copy()

    def process_display(self, roi_image):
        """
        Procesamiento avanzado sin destruir información:
        1. Recorte original
        2. Interpolación Cúbica para aumentar resolución (2.5x)
        3. Conversión a Grises + CLAHE para contraste
        4. Reducción de ruido con filtro Gaussiano tenue (3x3)
        5. Sharpening (nitidez) moderado
        6. Threshold Adaptativo u Otsu
        7. Imagen alternativa en Escala de Grises
        """
        if roi_image is None or roi_image.size == 0:
            return None, None, None, None

        # 1. Super-resolución por interpolación cúbica (2.5x)
        h_orig, w_orig = roi_image.shape[:2]
        scaled = cv2.resize(roi_image, (0, 0), fx=2.5, fy=2.5, interpolation=cv2.INTER_CUBIC)

        # 2. Escala de grises + CLAHE para ecualización adaptativa de histograma
        gray = cv2.cvtColor(scaled, cv2.COLOR_BGR2GRAY) if len(scaled.shape) == 3 else scaled
        clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(4, 4))
        enhanced_gray = clahe.apply(gray)

        # 3. Reducción de ruido tenue
        denoised = cv2.GaussianBlur(enhanced_gray, (3, 3), 0)

        # 4. Sharpening moderado para definir bordes de dígitos
        sharpened = cv2.filter2D(denoised, -1, self.sharpen_kernel)

        # 5. Threshold Adaptativo + Otsu
        _, binary_otsu = cv2.threshold(sharpened, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        binary_adapt = cv2.adaptiveThreshold(sharpened, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 4)

        processed_binary = cv2.bitwise_or(binary_otsu, binary_adapt)

        return {
            "original_crop": roi_image,
            "gray_enhanced": enhanced_gray,
            "processed_binary": processed_binary,
            "sharpened": sharpened
        }
