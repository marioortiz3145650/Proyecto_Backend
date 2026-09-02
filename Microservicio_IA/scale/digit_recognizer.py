import cv2
import numpy as np
from ml.inference import DigitPredictor

# Perfiles estándar de 7 segmentos para fallback determinista
DIGIT_PROFILES = {
    '0': [1, 1, 1, 1, 1, 1, 0],
    '1': [0, 1, 1, 0, 0, 0, 0],
    '2': [1, 1, 0, 1, 1, 0, 1],
    '3': [1, 1, 1, 1, 0, 0, 1],
    '4': [0, 1, 1, 0, 0, 1, 1],
    '5': [1, 0, 1, 1, 0, 1, 1],
    '6': [1, 0, 1, 1, 1, 1, 1],
    '7': [1, 1, 1, 0, 0, 0, 0],
    '8': [1, 1, 1, 1, 1, 1, 1],
    '9': [1, 1, 1, 1, 0, 1, 1]
}

class DigitRecognizer:
    """
    PARTE 6 — RECONOCIMIENTO DE DÍGITOS CON PYTORCH Y FALLBACK DETERMINISTA
    Reconoce caracteres individuales y retorna (carácter, confianza).
    """
    def __init__(self, model_path=None):
        self.predictor = DigitPredictor(model_path)

    @property
    def is_model_available(self):
        return self.predictor.is_available

    def recognize_char(self, char_crop):
        """
        Reconoce una imagen de un solo carácter.
        Si hay modelo PyTorch, lo usa. Si no, usa decodificador de 7 segmentos.
        Retorna: (char: str, confidence: float, source: str)
        """
        if char_crop is None or char_crop.size == 0:
            return None, 0.0, "NONE"

        # 1. Probar PyTorch primero si está disponible
        if self.predictor.is_available:
            char, conf = self.predictor.predict_single_char(char_crop)
            if char is not None and conf > 0.35:
                return char, conf, "PYTORCH"

        # 2. Fallback Determinista (Análisis de 7 segmentos por zonas)
        char_7seg, conf_7seg = self._classify_7seg_crop(char_crop)
        if char_7seg is not None:
            source = "7SEGMENT" if not self.predictor.is_available else "PYTORCH_FALLBACK"
            return char_7seg, conf_7seg, source

        return None, 0.0, "FAILED"

    def _classify_7seg_crop(self, roi_digit):
        """Clasificador geométrico para dígitos de 7 segmentos."""
        try:
            dh, dw = roi_digit.shape[:2]
            if dh < 8 or dw < 4:
                return None, 0.0

            dW = int(dw * 0.35)
            dH = int(dh * 0.22)
            dHC = int(dh * 0.16)

            segments = [
                ((0, 0), (dw, dH)),                                          # a (superior)
                ((dw - dW, 0), (dw, dh // 2)),                                # b (sup der)
                ((dw - dW, dh // 2), (dw, dh)),                                # c (inf der)
                ((0, dh - dH), (dw, dh)),                                     # d (inferior)
                ((0, dh // 2), (dW, dh)),                                    # e (inf izq)
                ((0, 0), (dW, dh // 2)),                                    # f (sup izq)
                ((0, (dh // 2) - (dHC // 2)), (dw, (dh // 2) + (dHC // 2))) # g (centro)
            ]

            seg_ratios = []
            for ((xA, yA), (xB, yB)) in segments:
                seg_crop = roi_digit[yA:yB, xA:xB]
                if seg_crop.size == 0:
                    seg_ratios.append(0.0)
                    continue
                ratio = float(cv2.countNonZero(seg_crop)) / float(seg_crop.size)
                seg_ratios.append(ratio)

            best_digit = None
            best_score = -1.0
            for digit, profile in DIGIT_PROFILES.items():
                score = 0.0
                for r, expected in zip(seg_ratios, profile):
                    if expected == 1:
                        score += r
                    else:
                        score += (1.0 - r)
                if score > best_score:
                    best_score = score
                    best_digit = digit

            # Normalizar puntuación a rango de confianza (max score posible es 7.0)
            confidence = min(1.0, max(0.0, best_score / 7.0))
            if best_score >= 4.2:
                return best_digit, round(confidence, 2)
        except Exception:
            pass
        return None, 0.0
