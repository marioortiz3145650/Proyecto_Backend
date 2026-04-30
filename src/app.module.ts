import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './usuarios/usuarios.module';
import { RolsModule } from './roles/roles.module';
import { BreedModule } from './raza/raza.module';
import { LotesModule } from './lotes/lotes.module';
import { GalponesModule } from './galpones/galpones.module';
import { AlimentosModule } from './alimentos/alimentos.module';
import { UnidadesDeMedidaModule } from './unidades_de_medida/unidades_de_medida.module';
import { TipoDeAlimentosModule } from './tipo_de_alimento/tipo_de_alimento.module';
import { ProduccionModule } from './produccion/produccion.module';
import { EstadosModule } from './estados/estados.module';
import { MovimientosInsumoModule } from './movimientos_insumo/movimientos_insumo.module';
import { AlertasModule } from './alertas/alertas.module';
import { MuertesModule } from './muertes/muertes.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type:'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5434'),
      database: process.env.DB_NAME,
      username: process.env.USER_NAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    RolsModule,
    BreedModule,
    LotesModule,
    GalponesModule,
    AlimentosModule,
    UnidadesDeMedidaModule,
    TipoDeAlimentosModule,
    ProduccionModule,
    EstadosModule,
    MovimientosInsumoModule,
    AlertasModule,
    MuertesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
