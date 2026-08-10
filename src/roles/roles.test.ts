import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException, ConflictException } from '@nestjs/common';
import request from 'supertest';
import { RolsController } from './roles.controller';
import { RolsService } from './roles.service';

describe('RolsController - Pruebas del Endpoint /roles', () => {
  let app: INestApplication;
  let rolesService: Record<keyof RolsService, jest.Mock>;

  beforeEach(async () => {
    rolesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [RolsController],
      providers: [
        {
          provide: RolsService,
          useValue: rolesService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /roles - Crear un Rol', () => {
    it('Debe retornar 201 Created y el JSON del rol cuando los datos son válidos', async () => {
      const payload = { nombre: 'Administrador' };
      const createdRol = {
        id: 1,
        uuid: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        nombre: 'Administrador',
        fecha_creacion: new Date().toISOString(),
      };
      rolesService.create.mockResolvedValue(createdRol);

      const response = await request(app.getHttpServer())
        .post('/roles')
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('uuid');
      expect(response.body).toHaveProperty('nombre', 'Administrador');
      expect(rolesService.create).toHaveBeenCalledWith(payload);
    });

    it('Debe retornar 400 Bad Request cuando faltan datos obligatorios (campo nombre)', async () => {
      const payload = {};

      const response = await request(app.getHttpServer())
        .post('/roles')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('Debe retornar 400 Bad Request cuando el nombre es menor a 3 caracteres', async () => {
      const payload = { nombre: 'Ab' };

      const response = await request(app.getHttpServer())
        .post('/roles')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('Debe retornar 409 Conflict cuando el rol ya existe', async () => {
      const payload = { nombre: 'Administrador' };
      rolesService.create.mockRejectedValue(
        new ConflictException('El rol "Administrador" ya existe'),
      );

      const response = await request(app.getHttpServer())
        .post('/roles')
        .send(payload)
        .expect(409);

      expect(response.body).toHaveProperty('statusCode', 409);
      expect(response.body.message).toContain('ya existe');
    });
  });

  describe('GET /roles - Listar Roles', () => {
    it('Debe retornar 200 OK y una lista con la estructura de roles', async () => {
      const rolesList = [
        { id: 1, uuid: 'u1', nombre: 'Admin', fecha_creacion: '2026-01-01' },
        { id: 2, uuid: 'u2', nombre: 'Aprendiz', fecha_creacion: '2026-01-01' },
      ];
      rolesService.findAll.mockResolvedValue(rolesList);

      const response = await request(app.getHttpServer())
        .get('/roles')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('nombre', 'Admin');
    });
  });

  describe('GET /roles/:id - Obtener Rol por ID o UUID', () => {
    it('Debe retornar 200 OK y el rol consultado cuando existe', async () => {
      const rol = { id: 1, uuid: 'u1', nombre: 'Admin', fecha_creacion: '2026-01-01' };
      rolesService.findOne.mockResolvedValue(rol);

      const response = await request(app.getHttpServer())
        .get('/roles/1')
        .expect(200);

      expect(response.body).toEqual(rol);
      expect(rolesService.findOne).toHaveBeenCalledWith('1');
    });

    it('Debe retornar 404 Not Found cuando el rol no existe', async () => {
      rolesService.findOne.mockRejectedValue(
        new NotFoundException('Rol con ID/UUID 999 no encontrado'),
      );

      const response = await request(app.getHttpServer())
        .get('/roles/999')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
    });
  });

  describe('DELETE /roles/:id - Eliminar Rol', () => {
    it('Debe retornar 200 OK y mensaje de confirmación al eliminar', async () => {
      rolesService.remove.mockResolvedValue({ message: 'Rol eliminado correctamente' });

      const response = await request(app.getHttpServer())
        .delete('/roles/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Rol eliminado correctamente' });
    });
  });
});
