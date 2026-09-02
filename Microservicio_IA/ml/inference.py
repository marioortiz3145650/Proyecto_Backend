import os
import cv2
import numpy as np

class DigitPredictor:
    """
    PARTE 6 & 14 — INFERENCIA PYTORCH CON CARGA ÚNICA DE MODELO
    Carga el modelo PyTorch entrenado en memoria una sola vez.
    Si el modelo aún no existe, informa `is_available = False` para que el sistema
    muestre "Modelo de peso no disponible" y use decodificadores alternativos sin fallar.
    """
    def __init__(self, model_path=None):
        if model_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_path = os.path.join(base_dir, "models", "digit_model.pt")

        self.model_path = model_path
        self.device = "cpu"
        self.model = None
        self.is_available = False
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                import torch
                from ml.model import DigitCNN
                self.device = torch.device("cpu")
                self.model = DigitCNN().to(self.device)
                state_dict = torch.load(self.model_path, map_location="cpu")
                self.model.load_state_dict(state_dict)
                self.model.eval()
                self.is_available = True
                print(f"[ML] Modelo PyTorch cargado exitosamente desde {self.model_path}")
            except Exception as e:
                print(f"[ML] Error al cargar modelo PyTorch ({self.model_path}): {e}")
                self.is_available = False
        else:
            print(f"[ML] Modelo PyTorch no encontrado en {self.model_path}. Sistema operará en modo alternativo (7-seg/OCR).")
            self.is_available = False

    def predict_single_char(self, char_image):
        """
        Recibe una imagen (numpy array uint8) de un solo dígito/carácter.
        Retorna: (carácter_reconocido: str, confianza: float)
        Ejemplo: ('7', 0.98)
        """
        if not self.is_available or self.model is None:
            return None, 0.0

        try:
            import torch
            from ml.model import CLASSES

            if len(char_image.shape) == 3:
                gray = cv2.cvtColor(char_image, cv2.COLOR_BGR2GRAY)
            else:
                gray = char_image.copy()

            # Redimensionar a 28x28
            resized = cv2.resize(gray, (28, 28), interpolation=cv2.INTER_AREA)

            # Normalizar a [0, 1] y convertir a tensor torch [1, 1, 28, 28]
            norm = resized.astype(np.float32) / 255.0
            tensor = torch.from_numpy(norm).unsqueeze(0).unsqueeze(0).to(self.device)

            with torch.no_grad():
                outputs = self.model(tensor)
                probs = torch.softmax(outputs, dim=1)
                conf, pred_idx = torch.max(probs, 1)

            idx = pred_idx.item()
            char = CLASSES[idx] if idx < len(CLASSES) else "?"
            confidence = float(conf.item())

            return char, confidence
        except Exception as e:
            print(f"[ML] Error durante la predicción: {e}")
            return None, 0.0
