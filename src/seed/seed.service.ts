import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../usuarios/entities/usuario.entity';
import { Rol } from '../roles/entities/rol.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Iniciando sembrado de base de datos (Seeding)...');

    try {
      // 1. Crear roles si no existen
      const rolesToCreate = ['Administrador', 'Aprendiz', 'Visitante'];
      const rolesMap: Record<string, Rol> = {};

      for (const rolNombre of rolesToCreate) {
        let rol = await this.rolRepository.findOneBy({ nombre: rolNombre });
        if (!rol) {
          rol = this.rolRepository.create({ nombre: rolNombre });
          rol = await this.rolRepository.save(rol);
          this.logger.log(`Rol "${rolNombre}" creado.`);
        } else {
          this.logger.log(`Rol "${rolNombre}" ya existe.`);
        }
        rolesMap[rolNombre] = rol;
      }

      // 2. Crear usuarios por defecto si no existen
      const usersToCreate = [
        {
          nombre: 'Administrador Sistema',
          correo: 'admin@layinghens.com',
          nombre_usuario: 'admin',
          contrasena_plana: 'admin123',
          rolNombre: 'Administrador',
        },
        {
          nombre: 'Aprendiz Sena',
          correo: 'aprendiz@layinghens.com',
          nombre_usuario: 'aprendiz',
          contrasena_plana: 'aprendiz123',
          rolNombre: 'Aprendiz',
        },
        {
          nombre: 'Visitante General',
          correo: 'visitante@layinghens.com',
          nombre_usuario: 'visitante',
          contrasena_plana: 'visitante123',
          rolNombre: 'Visitante',
        },
      ];

      for (const userData of usersToCreate) {
        const userExists = await this.userRepository.findOneBy({
          nombre_usuario: userData.nombre_usuario,
        });

        if (!userExists) {
          const hashedPassword = await bcrypt.hash(userData.contrasena_plana, 10);
          const rol = rolesMap[userData.rolNombre];
          
          const user = this.userRepository.create({
            nombre: userData.nombre,
            correo: userData.correo,
            nombre_usuario: userData.nombre_usuario,
            contrasena_hash: hashedPassword,
            rol: rol,
            activo: true,
          });

          await this.userRepository.save(user);
          this.logger.log(`Usuario "${userData.nombre_usuario}" creado.`);
        } else {
          this.logger.log(`Usuario "${userData.nombre_usuario}" ya existe.`);
        }
      }

      this.logger.log('Sembrado de base de datos finalizado con éxito.');
    } catch (error) {
      this.logger.error('Error durante el sembrado de base de datos:', error);
    }
  }
}
