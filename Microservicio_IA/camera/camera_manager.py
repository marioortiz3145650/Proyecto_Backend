import platform
import threading
import time
import cv2
import numpy as np

IS_WINDOWS = platform.system() == 'Windows'

class CameraManager:
    """
    Gestor de hardware de cámara para captura robusta en tiempo real.
    Diseñado para no bloquear el hilo principal ni los endpoints Flask.
    """
    def __init__(self, camera_index=0, width=640, height=480, fps=30):
        self.camera_index = camera_index
        self.width = width
        self.height = height
        self.fps = fps
        self.cap = None
        self._cap_lock = threading.Lock()
        self._is_opening = False
        self._camera_ready = False

    def open(self, index=None):
        """
        Abre la cámara. NO adquiere el lock durante la búsqueda para no bloquear read_frame().
        Solo toma el lock brevemente para asignar self.cap.
        """
        if index is not None:
            self.camera_index = index

        self._is_opening = True
        self._camera_ready = False

        # Liberar cámara anterior fuera del lock largo
        self._safe_release()

        print(f"[CAMERA] Abriendo cámara en índice {self.camera_index}...")
        cap = self._try_open_index(self.camera_index)

        # Fallback: si el índice especificado falla, probar 0-3
        if cap is None:
            for fallback_idx in range(4):
                if fallback_idx == self.camera_index:
                    continue
                print(f"[CAMERA] Probando índice alternativo {fallback_idx}...")
                cap = self._try_open_index(fallback_idx)
                if cap is not None:
                    self.camera_index = fallback_idx
                    break

        if cap is not None:
            try:
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
                cap.set(cv2.CAP_PROP_FPS, self.fps)
            except Exception:
                pass

            # Asignar de forma atómica
            with self._cap_lock:
                self.cap = cap
            self._camera_ready = True
            self._is_opening = False
            print(f"[CAMERA] Cámara {self.camera_index} abierta con éxito.")
            return True
        else:
            self._is_opening = False
            print(f"[CAMERA] No se pudo abrir cámara física. Se usará generador de imagen de respaldo.")
            return False

    def _try_open_index(self, idx):
        """
        Intenta abrir una cámara en el índice dado con distintos backends.
        Retorna el objeto VideoCapture si tiene éxito, None si falla.
        NO toca self.cap ni self._cap_lock.
        """
        backends = []
        if IS_WINDOWS:
            backends = [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY]
        else:
            backends = [cv2.CAP_V4L2, cv2.CAP_ANY]

        for backend in backends:
            try:
                cap = cv2.VideoCapture(idx, backend)
                if cap is not None and cap.isOpened():
                    ret, frame = cap.read()
                    if ret and frame is not None:
                        return cap
                    # No pudo leer un frame — liberar y probar siguiente backend
                    cap.release()
            except Exception as e:
                print(f"[CAMERA] Error backend {backend} idx {idx}: {e}")
                try:
                    cap.release()
                except Exception:
                    pass
        return None

    def _safe_release(self):
        """Libera la cámara actual de forma segura."""
        with self._cap_lock:
            old_cap = self.cap
            self.cap = None
        if old_cap is not None:
            try:
                old_cap.release()
            except Exception:
                pass

    def read_frame(self):
        """
        Lee un frame de la cámara. Si no hay cámara disponible,
        retorna un frame sintético de estado.
        """
        with self._cap_lock:
            if self.cap is not None and self.cap.isOpened():
                try:
                    ret, frame = self.cap.read()
                    if ret and frame is not None:
                        return True, frame
                except Exception:
                    pass

        # Frame sintético de respaldo
        blank = np.zeros((self.height, self.width, 3), dtype=np.uint8)
        cv2.rectangle(blank, (0, 0), (self.width, self.height), (30, 30, 30), -1)

        if not self._is_opening:
            msg = "CAMARA NO DISPONIBLE"
            color = (0, 100, 255)
            text_size = cv2.getTextSize(msg, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
            text_x = (self.width - text_size[0]) // 2
            cv2.putText(blank, msg, (text_x, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        return False, blank

    def release(self):
        """Libera todos los recursos de cámara."""
        self._safe_release()
        self._camera_ready = False
        print(f"[CAMERA] Cámara {self.camera_index} liberada.")

    def list_available_cameras(self):
        """Detecta cámaras disponibles en el sistema."""
        cameras = []

        # Intentar con pygrabber en Windows para nombres reales
        if IS_WINDOWS:
            try:
                from pygrabber.dshow_graph import FilterGraph
                graph = FilterGraph()
                devices = graph.get_input_devices()
                for i, dev in enumerate(devices):
                    cameras.append({"index": i, "name": dev})
            except Exception:
                pass

        # Fallback: escaneo manual por índice
        if not cameras:
            for i in range(4):
                try:
                    backend = cv2.CAP_DSHOW if IS_WINDOWS else cv2.CAP_ANY
                    cap = cv2.VideoCapture(i, backend)
                    if cap is not None and cap.isOpened():
                        cameras.append({"index": i, "name": f"Cámara {i}"})
                        cap.release()
                except Exception:
                    pass

        if not cameras:
            cameras = [{"index": 0, "name": "Cámara 0 (Predeterminada)"}]

        return cameras
