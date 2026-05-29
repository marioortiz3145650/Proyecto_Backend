import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// --- IMPORTACIÓN DE TUS MÓDULOS CON LAS CARPETAS CORRECTAS ---
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { UnidadesDeMedidaModule } from './unidades_de_medida/unidades_de_medida.module';
import { AlimentosModule } from './alimentos/alimentos.module';
import { BreedModule } from './breed/breed.module';
import { LotesModule } from './lotes/lotes.module';
import { GalponesModule } from './galpones/galpones.module';
import { ProduccionModule } from './produccion/produccion.module';
import { TratamientosModule } from './tratamientos/tratamientos.module';
import { TipoDeAlimentosModule } from './tipo_de_alimento/tipo_de_alimento.module';
import { LoteCierreModule } from './lote-cierre/lote-cierre.module';

// REPARADO: Sin la "s" al final para que coincida exactamente con tu archivo
import { MovimientosInsumoModule } from './movimientos_insumo/movimientos_insumo.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5434'),
      database: process.env.DB_NAME,
      username: process.env.USER_NAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),

    // --- REGISTRO GLOBAL EN EL ARREGLO DE IMPORTS ---
    UsersModule,
    RolesModule,
    UnidadesDeMedidaModule,
    AlimentosModule,
    BreedModule,
    LotesModule,
    GalponesModule,
    ProduccionModule,
    TratamientosModule,
    TipoDeAlimentosModule,
    LoteCierreModule,
    MovimientosInsumoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}