import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { spawn, ChildProcess, execSync } from 'child_process';
import * as path from 'path';

@Injectable()
export class VisionService implements OnModuleDestroy {
  private readonly logger = new Logger(VisionService.name);
  private pythonProcess: ChildProcess | null = null;

  async startCamera(cameraIndex: number) {
    if (this.pythonProcess) {
      this.logger.log('Deteniendo cámara previa antes de iniciar una nueva...');
      await this.stopCamera();
    }

    // Apuntamos al nuevo microservicio modular
    const scriptPath = path.resolve(process.cwd(), 'Microservicio_IA', 'api.py');
    this.logger.log(`Iniciando detector de peso (Python) con cámara index ${cameraIndex} desde ${scriptPath}`);

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    // Se ejecuta api.py en la carpeta Microservicio_IA
    const child = spawn(pythonCmd, ['api.py', '--camera', String(cameraIndex)], {
      cwd: path.resolve(process.cwd(), 'Microservicio_IA'), // MUY IMPORTANTE: ejecutar en su propio directorio
      detached: false,
    });

    child.stdout.on('data', (data) => {
      this.logger.log(`[Python stdout]: ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data) => {
      this.logger.warn(`[Python stderr]: ${data.toString().trim()}`);
    });

    child.on('close', (code) => {
      this.logger.log(`Proceso de Python finalizado con código ${code}`);
      if (this.pythonProcess && this.pythonProcess.pid === child.pid) {
        this.pythonProcess = null;
      }
    });

    this.pythonProcess = child;

    return { status: 'success', message: `Cámara ${cameraIndex} iniciada correctamente.` };
  }

  stopCamera(): Promise<{ status: string; message: string }> {
    if (!this.pythonProcess) {
      return Promise.resolve({ status: 'success', message: 'La cámara ya estaba detenida.' });
    }

    const proc = this.pythonProcess;
    const pid = proc.pid;
    this.logger.log(`Deteniendo proceso de Python con PID ${pid}...`);

    return new Promise((resolve) => {
      const onClose = () => {
        this.logger.log(`Proceso ${pid} confirmado como cerrado, cámara liberada.`);
        this.pythonProcess = null;
        resolve({ status: 'success', message: 'Cámara detenida correctamente.' });
      };

      proc.once('close', onClose);

      try {
        if (process.platform === 'win32') {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        } else {
          proc.kill('SIGKILL');
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error al detener el proceso ${pid}: ${message}`);
      }

      setTimeout(() => {
        if (this.pythonProcess && this.pythonProcess.pid === pid) {
          this.logger.warn(`Timeout esperando cierre del proceso ${pid}, forzando limpieza.`);
          proc.off('close', onClose);
          this.pythonProcess = null;
          resolve({ status: 'success', message: 'Cámara detenida (timeout).' });
        }
      }, 3000);
    });
  }

  /**
   * Se comunica con la API de Python para obtener el estado actual en tiempo real
   * Se llama cuando Angular pide "Registrar Huevo"
   */
  async getCurrentClassification() {
    if (!this.pythonProcess) {
      throw new Error('La cámara no está iniciada (El microservicio de IA está apagado).');
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/current_state');
      if (!response.ok) throw new Error('Fallo la conexión con Python');
      
      const state = await response.json();

      if (!state.egg_detected) {
        throw new Error('No se detectó ningún huevo en la cámara.');
      }
      if (!state.weight_stable) {
        throw new Error('El peso de la báscula aún no se ha estabilizado.');
      }

      return {
        peso: state.weight_g,
        categoria: state.category,
        volumen_cm3: state.volume_cm3
      };
    } catch (error) {
      this.logger.error('Error al conectarse a la IA:', error);
      throw new Error('No se pudo obtener la clasificación actual de la Inteligencia Artificial.');
    }
  }

  onModuleDestroy() {
    this.logger.log('Módulo destruido. Asegurando el apagado de la cámara...');
    void this.stopCamera();
  }
}