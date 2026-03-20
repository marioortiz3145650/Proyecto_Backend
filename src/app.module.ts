import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { RolsModule } from './rols/rols.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlimentosModule } from './alimentos/alimentos.module';
import { UnidadesDeMedidaModule } from './unidades_de_medida/unidades_de_medida.module';
import { TipoDeAlimentosModule } from './tipo_de_alimento/tipo_de_alimento.module';


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
    AlimentosModule,
    UnidadesDeMedidaModule,
    TipoDeAlimentosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
