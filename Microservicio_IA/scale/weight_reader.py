import cv2
import numpy as np
import re
import os
import json
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image

class DigitCNN(nn.Module):
    def __init__(self, num_classes=10):
        super(DigitCNN, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),
            
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),
            
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2),
        )
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(128 * 4 * 4, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes)
        )
        
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

class WeightReader:
    """
    PARTE 5, 6, 8, 9 — LECTURA DE BÁSCULA POR CÁMARA (NUEVO PIPELINE ROBUSTO)
    Segmenta caracteres, valida encuadre estricto y reconoce con PyTorch 32x32.
    """
    def __init__(self, display_detector, digit_recognizer):
        self.display_detector = display_detector
        # Ignoramos digit_recognizer (modelo viejo 28x28) y cargamos el nuevo aquí.
        self.model = None
        self.transform = None
        self.classes = None
        self.device = torch.device("cpu")
        self._load_new_model()

    def _load_new_model(self):
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            model_path = os.path.join(base_dir, "models", "digit_model.pth")
            meta_path = os.path.join(base_dir, "models", "digit_model_meta.json")
            
            if os.path.exists(model_path) and os.path.exists(meta_path):
                with open(meta_path, 'r') as f:
                    meta = json.load(f)
                self.classes = meta['classes']
                self.model = DigitCNN(num_classes=len(self.classes)).to(self.device)
                self.model.load_state_dict(torch.load(model_path, map_location=self.device))
                self.model.eval()
                self.transform = transforms.Compose([
                    transforms.Resize((32, 32)),
                    transforms.ToTensor(),
                    transforms.Normalize(meta['mean'], meta['std'])
                ])
        except Exception as e:
            print(f"[WeightReader] Error cargando nuevo modelo: {e}")

    def read_weight(self, frame):
        """
        Devuelve: (weight: float, confidence: float, status_msg: str, details: dict)
        """
        roi = self.display_detector.crop_display(frame)
        if roi is None or roi.size == 0:
            return -1.0, 0.0, "Sin región de pantalla", {}

        img = roi.copy()
        h_img, w_img = img.shape[:2]
        
        proc_details = {"final_boxes": [], "invalid_boxes": []}

        # 1. Compensación de FALTA DE LUZ
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Estirar el poco contraste disponible para que ocupe todo el rango (0 a 255)
        cv2.normalize(gray, gray, 0, 255, cv2.NORM_MINMAX)
        
        proc_details["roi"] = img
        proc_details["enhanced_roi"] = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
        
        # Threshold: C=5 es más sensible para atrapar los bordes difuminados/borrosos
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 31, 5)
        
        # REQUERIMIENTO: Inversión dinámica si la báscula apagó la luz de fondo
        if np.count_nonzero(thresh) > thresh.size * 0.40:
            thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 5)
            
        # REQUERIMIENTO: Eliminar bordes (5%)
        margin_y = max(2, int(h_img * 0.05))
        margin_x = max(2, int(w_img * 0.05))
        thresh[0:margin_y, :] = 0
        thresh[-margin_y:, :] = 0
        thresh[:, 0:margin_x] = 0
        thresh[:, -margin_x:] = 0
        
        proc_details["thresh"] = thresh
        
        # 3. Morfología para conectar segmentos del MISMO dígito
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (4, 10))
        morph = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        # 4. Encontrar cajas iniciales
        contours_morph, _ = cv2.findContours(morph, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        initial_boxes = []
        for i, c in enumerate(contours_morph):
            x, y, w, h = cv2.boundingRect(c)
            
            # REQUERIMIENTO: Filtros para rechazar fragmentos rotos y cajas gigantes
            if h >= h_img * 0.95:
                continue # Rechaza caja de altura completa (borde)
            if w >= w_img * 0.55:
                continue # Rechaza caja demasiado ancha (dos dígitos unidos)
            if w < 4 or h < h_img * 0.35:
                continue # Rechaza fragmentos sueltos (debe medir al menos 35% del alto de la pantalla)
                
            aspect = w / float(h)
            if 0.15 <= aspect <= 1.5:
                initial_boxes.append((x, y, w, h))
                
        initial_boxes = sorted(initial_boxes, key=lambda b: b[0])
        
        # 5. Filtrado Geométrico y VALIDACIÓN ESTRICTA
        final_boxes = initial_boxes
        proc_details["final_boxes"] = final_boxes
        proc_details["invalid_boxes"] = []

        if not final_boxes:
            return -1.0, 0.0, "SIN DÍGITOS", proc_details

        # Validación de separación anómala
        for i in range(len(final_boxes) - 1):
            x1, y1, w1, h1 = final_boxes[i]
            x2, y2, w2, h2 = final_boxes[i+1]
            gap = x2 - (x1 + w1)
            # Solapamiento excesivo (> 50% del ancho) = error
            if gap < - (w1 * 0.5): 
                return -1.0, 0.0, "Lectura no válida: amontonados", proc_details
                
        if self.model is None:
            return -1.0, 0.0, "Modelo de peso no disponible", proc_details

        # 6. Inferencia
        final_digits = []
        confidences = []
        
        final_boxes = sorted(final_boxes, key=lambda b: b[0])
        valid_predictions = []
        
        for idx, (x, y, w, h) in enumerate(final_boxes):
            side = max(w, h) + int(max(w, h) * 0.3)
            cx, cy = x + w // 2, y + h // 2
            x1, y1 = cx - side // 2, cy - side // 2
            x2, y2 = x1 + side, y1 + side
            
            x1_clip, y1_clip = max(0, x1), max(0, y1)
            x2_clip, y2_clip = min(img.shape[1], x2), min(img.shape[0], y2)
            
            img_enhanced = proc_details["enhanced_roi"]
            crop = img_enhanced[y1_clip:y2_clip, x1_clip:x2_clip]
            
            top, bottom = max(0, -y1), max(0, y2 - img.shape[0])
            left, right = max(0, -x1), max(0, x2 - img.shape[1])
            square = cv2.copyMakeBorder(crop, top, bottom, left, right, cv2.BORDER_REPLICATE)
            
            final_32 = cv2.resize(square, (32, 32))
            crop_rgb = cv2.cvtColor(final_32, cv2.COLOR_BGR2RGB)
            img_pil = Image.fromarray(crop_rgb)
            
            input_tensor = self.transform(img_pil).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probs = torch.nn.functional.softmax(outputs, dim=1)[0]
                conf, pred_idx = torch.max(probs, 0)
                
            pred_char = self.classes[pred_idx.item()]
            conf_val = conf.item() * 100
            
            if conf_val < 42.0:
                proc_details["invalid_boxes"].append((x,y,w,h))
                continue
                
            final_digits.append(pred_char)
            confidences.append(conf_val)
            valid_predictions.append(((x,y,w,h), pred_char, conf_val))

        if len(final_digits) > 2:
            final_digits = final_digits[-2:]
            confidences = confidences[-2:]
            valid_predictions = valid_predictions[-2:]

        if len(final_digits) != 2:
            return -1.0, 0.0, "Requiere exactamente 2 dígitos válidos (30g-99g)", proc_details

        raw_str = "".join(final_digits)
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
        
        try:
            val = float(raw_str)
            if val > 200.0 and val <= 2000.0:
                val = round(val / 10.0, 1)
            
            if val == 0.0:
                return 0.0, avg_conf, "0g", proc_details
            elif 30.0 < val <= 100.0:
                return val, avg_conf, "OK", proc_details
            else:
                return -1.0, avg_conf, "Lectura fuera de rango (30g-100g)", proc_details
        except ValueError:
            return -1.0, avg_conf, "Lectura no válida: formato incorrecto", proc_details
