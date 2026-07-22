  import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, EntityManager } from 'typeorm';
  import { User } from '../usuarios/entities/usuario.entity';
  import { Rol } from '../roles/entities/rol.entity';
  import { Setting } from '../settings/entities/setting.entity';
  import * as bcrypt from 'bcrypt';

  @Injectable()
  export class SeedService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeedService.name);

    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      @InjectRepository(Rol)
      private readonly rolRepository: Repository<Rol>,
      @InjectRepository(Setting)
      private readonly settingRepository: Repository<Setting>,
      private readonly entityManager: EntityManager,
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
            nombre_usuario: 'Instructor',
            contrasena_plana: 'admin123',
            rolNombre: 'Administrador',
          },
          {
            nombre: 'Aprendiz Sena',
            correo: 'aprendiz@layinghens.com',
            nombre_usuario: 'Aprendiz',
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

        // 3. Eliminar usuarios extra para mantener solo los 3 especificados
        const allowedUsernames = ['Instructor', 'Aprendiz', 'visitante'];
        const allUsers = await this.userRepository.find();
        const instructorUser = await this.userRepository.findOneBy({ nombre_usuario: 'Instructor' });

        if (instructorUser) {
          for (const u of allUsers) {
            if (!allowedUsernames.includes(u.nombre_usuario)) {
              // Reasignar registros en las tablas relacionadas al usuario Instructor
              await this.entityManager.query(
                `UPDATE "movimientos_insumo" SET "creado_por" = $1 WHERE "creado_por" = $2`,
                [instructorUser.uuid, u.uuid]
              );
              await this.entityManager.query(
                `UPDATE "produccion" SET "creado_por" = $1 WHERE "creado_por" = $2`,
                [instructorUser.uuid, u.uuid]
              );
              await this.entityManager.query(
                `UPDATE "tratamientos" SET "creado_por" = $1 WHERE "creado_por" = $2`,
                [instructorUser.uuid, u.uuid]
              );

              // Eliminar el usuario extra
              await this.userRepository.delete({ uuid: u.uuid });
              this.logger.log(`Usuario extra "${u.nombre_usuario}" eliminado y sus registros reasignados a "Instructor".`);
            }
          }
        }

        // 4. Crear settings por defecto si no existen
        const defaultSettings = [
          { key: 'tasa_mortalidad_max', value: '5' },
          { key: 'postura_minima', value: '70' },
          { key: 'stock_critico_porcentaje', value: '100' },
          { key: 'ocupacion_maxima', value: '95' },
        ];

        for (const s of defaultSettings) {
          const exists = await this.settingRepository.findOne({ where: { key: s.key } });
          if (!exists) {
            const setting = this.settingRepository.create(s);
            await this.settingRepository.save(setting);
            this.logger.log(`Setting "${s.key}" creado.`);
          }
        }

        this.logger.log('Sembrado de base de datos finalizado con éxito.');
      } catch (error) {
        this.logger.error('Error durante el sembrado de base de datos:', error);
      }
    }
  }