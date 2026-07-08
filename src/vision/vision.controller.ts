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
}