import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { spawn, ChildProcess, execSync } from 'child_process';
import * as path from 'path';

@Injectable()
export class VisionService implements OnModuleDestroy {
  private readonly logger = new Logger(VisionService.name);
  private pythonProcess: ChildProcess | null = null;

  startCamera(cameraIndex: number) {
    // Detener cualquier cámara en ejecución previa de forma síncrona e inmediata
    if (this.pythonProcess) {
      this.logger.log('Deteniendo cámara previa antes de iniciar una nueva...');
      this.stopCamera();
    }

    const scriptPath = path.resolve(__dirname, 'weight_detector.py');
    this.logger.log(`Iniciando detector de peso (Python) con cámara index ${cameraIndex} desde ${scriptPath}`);

    // Lanzar proceso secundario de Python
    const child = spawn('python', [scriptPath, '--camera', String(cameraIndex)], {
      detached: false, // Se matará si el proceso principal finaliza
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

  stopCamera() {
    if (this.pythonProcess) {
      const pid = this.pythonProcess.pid;
      this.logger.log(`Deteniendo proceso de Python con PID ${pid}...`);
      try {
        if (process.platform === 'win32') {
          // Fuerza de terminación síncrona en Windows
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        } else {
          this.pythonProcess.kill('SIGKILL');
        }
      } catch (error) {
        this.logger.error(`Error al detener el proceso ${pid}: ${error.message}`);
      }
      this.pythonProcess = null;
      return { status: 'success', message: 'Cámara detenida correctamente.' };
    }
    return { status: 'success', message: 'La cámara ya estaba detenida.' };
  }

  onModuleDestroy() {
    this.logger.log('Módulo destruido. Asegurando el apagado de la cámara...');
    this.stopCamera();
  }
}
