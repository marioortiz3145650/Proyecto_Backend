import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { VisionService } from './vision.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('vision')
@UseGuards(JwtAuthGuard)
export class VisionController {
  constructor(private readonly visionService: VisionService) {}

  @Post('start')
  @HttpCode(HttpStatus.OK)
  async start(@Body() body: { cameraIndex?: number }) {
    const cameraIndex = body.cameraIndex !== undefined ? Number(body.cameraIndex) : 0;
    return this.visionService.startCamera(cameraIndex);
  }

  @Post('stop')
  @HttpCode(HttpStatus.OK)
  async stop() {
    return this.visionService.stopCamera();
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async registerEgg() {
    // Le pide a Python los datos en tiempo real (lanza error si no hay huevo o peso)
    const iaData = await this.visionService.getCurrentClassification();

    // NOTA PARA MARIO: Aquí puedes llamar a tu servicio de base de datos para guardar el registro.
    // Ejemplo: return this.tuDbService.produccion.create({ ...iaData });

    // Por ahora retornamos los datos limpios a Angular
    return iaData;
  }
}