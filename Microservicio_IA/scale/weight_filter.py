from collections import deque
import numpy as np

class WeightFilter:
    """
    PARTE 10 — FILTRADO DEL PESO
    Y PARTE 12 — ESTABILIDAD DEL SISTEMA

    Filtra lecturas consecutivas con ventana móvil configurable.
    Calcula nivel de confianza final.
    Determina si el sistema está "ESTABILIZANDO..." o "LISTO PARA CLASIFICAR".
    """
    def __init__(self, window_size=7, min_confidence=0.70, stability_frames=5):
        self.window_size = window_size
        self.min_confidence = min_confidence
        self.stability_frames = stability_frames

        self.weight_history = deque(maxlen=window_size)
        self.confidence_history = deque(maxlen=window_size)
        self.dim_history = deque(maxlen=window_size) # (largo_cm, ancho_cm)

        self.stable_weight = 0.0
        self.stable_confidence = 0.0
        self.is_stable = False
        self.status_text = "ESPERANDO HUEVO..."
        self.invalid_frames_count = 0

    def reset(self):
        self.weight_history.clear()
        self.confidence_history.clear()
        self.dim_history.clear()
        self.stable_weight = 0.0
        self.stable_confidence = 0.0
        self.is_stable = False
        self.status_text = "ESPERANDO HUEVO..."
        self.invalid_frames_count = 0

    def update(self, raw_weight, raw_confidence, dims_cm=None, egg_detected=False):
        """
        Procesa una nueva lectura por fotograma.
        Retorna: dict con (filtered_weight, confidence_percent, is_stable, status_text)
        """
        if not egg_detected:
            self.reset()
            return {
                "weight": 0.0,
                "confidence_pct": 0,
                "is_stable": False,
                "status_text": "BUSCANDO"
            }

        # Si la lectura es inválida (ej. borrosa o fuera de ROI), incrementamos el contador
        # de lecturas inválidas. Si supera un límite (ej. 20 frames = ~600ms), reseteamos.
        # Si es menor, mantenemos temporalmente el último peso válido ("verificando...").
        if (raw_weight == 0.0 or 30.0 < raw_weight <= 100.0) and raw_confidence > 0.0:
            self.invalid_frames_count = 0
            self.weight_history.append(raw_weight)
            self.confidence_history.append(raw_confidence)
            
            if raw_confidence >= 90.0:
                for _ in range(self.weight_history.maxlen):
                    self.weight_history.append(raw_weight)
                    self.confidence_history.append(raw_confidence)
        else:
            self.invalid_frames_count += 1
            if self.invalid_frames_count > 20: # ~600ms a 30fps
                self.weight_history.clear()
                self.confidence_history.clear()
            elif self.is_stable:
                # Retenemos el último peso temporalmente y avisamos
                self.status_text = "verificando..."

        if dims_cm is not None:
            self.dim_history.append(dims_cm)

        # Verificar si tenemos suficientes lecturas para evaluar estabilidad
        if len(self.weight_history) < self.stability_frames:
            self.is_stable = False
            self.status_text = "ESTABILIZANDO"
            return {
                "weight": -1.0, # -1.0 se traduce como "-- g" en la interfaz
                "confidence_pct": 0,
                "is_stable": False,
                "status_text": "ESTABILIZANDO"
            }

        # Calcular Moda (valor más repetido) en lugar de promedio/mediana
        # Redondear a 1 decimal para agrupar lecturas muy cercanas
        rounded_weights = [round(w, 1) for w in self.weight_history]
        from collections import Counter
        counter = Counter(rounded_weights)
        most_common_weight, count = counter.most_common(1)[0]

        # Promedio de confianza
        avg_conf = float(np.mean(self.confidence_history))

        # Criterio de Estabilidad:
        if count >= self.stability_frames and avg_conf >= self.min_confidence:
            self.is_stable = True
            self.stable_weight = most_common_weight
            self.status_text = "ESTABLE"
            final_weight = self.stable_weight
        else:
            self.is_stable = False
            # REQUERIMIENTO: Si ya teníamos un peso estable para este huevo, lo mantenemos 
            # temporalmente en lugar de borrarlo por un frame malo de segmentación.
            if self.stable_weight > 0:
                final_weight = self.stable_weight
                self.status_text = "VERIFICANDO..."
            else:
                final_weight = -1.0 
                self.status_text = "ESTABILIZANDO"

        confidence_pct = round(avg_conf, 1) if final_weight > 0 else 0

        return {
            "weight": final_weight,
            "confidence_pct": confidence_pct,
            "is_stable": self.is_stable,
            "status_text": self.status_text
        }
