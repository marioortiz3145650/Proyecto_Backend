import { Module } from '@nestjs/common';
import { ProduccionService } from './produccion.service';
import { ProduccionController } from './produccion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produccion } from './entities/produccion.entity';
import { LotesModule } from '../lotes/lotes.module'; // <--- ¡Añade esta importación! (Revisa los puntos según tu ruta)

@Module({
  imports: [
    TypeOrmModule.forFeature([Produccion]),
    LotesModule // <--- ¡AÑADE ESTO AQUÍ! Ahora ProduccionService tendrá acceso al LoteRepository
  ],
  controllers: [ProduccionController],
  providers: [ProduccionService],
})
export class ProduccionModule {}