import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './usuarios/users.module';
import { RolsModule } from './roles/rols.module';
import { BreedModule } from './raza/breed.module';
import { LotesModule } from './lotes/lotes.module';
import { GalponesModule } from './galpones/galpones.module';
import { AlimentosModule } from './alimentos/alimentos.module';
import { UnidadesDeMedidaModule } from './unidades_de_medida/unidades_de_medida.module';
import { TipoDeAlimentosModule } from './tipo_de_alimento/tipo_de_alimento.module';
import { ProduccionModule } from './produccion/produccion.module';
import { EstadosModule } from './estados/estados.module';
import { MovimientosInsumoModule } from './movimientos_insumo/movimientos_insumo.module';


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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
