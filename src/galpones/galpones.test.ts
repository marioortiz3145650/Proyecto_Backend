import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { GalponesController } from './galpones.controller';
import { GalponesService } from './galpones.service';

describe('GalponesController - Pruebas del Endpoint /galpones', () => {
  let app: INestApplication;
  let galponesService: Record<keyof GalponesService, jest.Mock>;

  beforeEach(async () => {
    galponesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByLote: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [GalponesController],
      providers: [
        {
          provide: GalponesService,
          useValue: galponesService,
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

  describe('POST /galpones - Crear Galpón', () => {
    it('Debe retornar 201 Created y la estructura del galpón creado con datos válidos', async () => {
      const payload = {
        nombre: 'Galpón Norte 1',
        direccion: 'Sector A - Bloque 3',
      };
      const createdGalpon = {
        id: 'galpon-uuid-123',
        nombre: 'Galpón Norte 1',
        direccion: 'Sector A - Bloque 3',
        estado: 'activo',
        fecha_creacion: new Date().toISOString(),
      };
      galponesService.create.mockResolvedValue(createdGalpon);

      const response = await request(app.getHttpServer())
        .post('/galpones')
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id', 'galpon-uuid-123');
      expect(response.body).toHaveProperty('nombre', 'Galpón Norte 1');
      expect(response.body).toHaveProperty('direccion', 'Sector A - Bloque 3');
      expect(galponesService.create).toHaveBeenCalledWith(payload);
    });

    it('Debe retornar 400 Bad Request cuando faltan datos obligatorios (sin nombre ni direccion)', async () => {
      const payload = {};

      const response = await request(app.getHttpServer())
        .post('/galpones')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('Debe retornar 400 Bad Request cuando el nombre excede los 50 caracteres', async () => {
      const payload = {
        nombre: 'A'.repeat(51),
        direccion: 'Dirección válida',
      };

      const response = await request(app.getHttpServer())
        .post('/galpones')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });

  describe('GET /galpones - Obtener Galpones', () => {
    it('Debe retornar 200 OK y la lista paginada de galpones', async () => {
      const result = {
        data: [
          { id: '1', nombre: 'Galpón 1', direccion: 'Zona 1' },
          { id: '2', nombre: 'Galpón 2', direccion: 'Zona 2' },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };
      galponesService.findAll.mockResolvedValue(result);

      const response = await request(app.getHttpServer())
        .get('/galpones')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBe(2);
    });
  });

  describe('GET /galpones/:id - Obtener Galpón por ID', () => {
    it('Debe retornar 200 OK y el galpón cuando existe', async () => {
      const galpon = { id: 'g-100', nombre: 'Galpón Central', direccion: 'Calle 10' };
      galponesService.findOne.mockResolvedValue(galpon);

      const response = await request(app.getHttpServer())
        .get('/galpones/g-100')
        .expect(200);

      expect(response.body).toEqual(galpon);
      expect(galponesService.findOne).toHaveBeenCalledWith('g-100');
    });

    it('Debe retornar 404 Not Found cuando el galpón no existe', async () => {
      galponesService.findOne.mockRejectedValue(
        new NotFoundException('Galpón g-999 no encontrado'),
      );

      const response = await request(app.getHttpServer())
        .get('/galpones/g-999')
        .expect(404);

      expect(response.body).toHaveProperty('statusCode', 404);
    });
  });

  describe('DELETE /galpones/:id - Eliminar Galpón', () => {
    it('Debe retornar 200 OK tras eliminar el galpón', async () => {
      galponesService.remove.mockResolvedValue({ message: 'Galpón eliminado exitosamente' });

      const response = await request(app.getHttpServer())
        .delete('/galpones/g-100')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });
});
