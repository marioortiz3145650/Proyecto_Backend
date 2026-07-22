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

    const scriptPath = path.resolve(process.cwd(), 'src', 'vision', 'weight_detector.py');
    this.logger.log(`Iniciando detector de peso (Python) con cámara index ${cameraIndex} desde ${scriptPath}`);

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const child = spawn(pythonCmd, [scriptPath, '--camera', String(cameraIndex)], {
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

      // Esperar el cierre real del proceso antes de resolver, así el driver
      // libera el handle de la cámara antes de que se abra el siguiente.
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

      // Salvavidas: si 'close' nunca llega, no dejar la promesa colgada para siempre
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

  onModuleDestroy() {
    this.logger.log('Módulo destruido. Asegurando el apagado de la cámara...');
    void this.stopCamera();
  }
}