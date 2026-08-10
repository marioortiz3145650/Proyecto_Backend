import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { TipoDeAlimentosController } from './tipo_de_alimento.controller';
import { TipoDeAlimentosService } from './tipo_de_alimento.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('TipoDeAlimentosController - Pruebas del Endpoint /tipo-de-alimentos', () => {
  let app: INestApplication;
  let service: Record<keyof TipoDeAlimentosService, jest.Mock>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [TipoDeAlimentosController],
      providers: [
        {
          provide: TipoDeAlimentosService,
          useValue: service,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

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

  describe('POST /tipo-de-alimentos - Crear Tipo de Alimento', () => {
    it('Debe retornar 201 Created y el tipo de alimento cuando los datos son válidos', async () => {
      const payload = { nombre: 'Concentrado Posturas' };
      const createdRecord = {
        id_tipo_insumo: 1,
        nombre: 'Concentrado Posturas',
      };
      service.create.mockResolvedValue(createdRecord);

      const response = await request(app.getHttpServer())
        .post('/tipo-de-alimentos')
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id_tipo_insumo', 1);
      expect(response.body).toHaveProperty('nombre', 'Concentrado Posturas');
      expect(service.create).toHaveBeenCalledWith(payload);
    });

    it('Debe retornar 400 Bad Request cuando falta el campo obligatorio (nombre)', async () => {
      const payload = {};

      const response = await request(app.getHttpServer())
        .post('/tipo-de-alimentos')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
      expect(Array.isArray(response.body.message)).toBe(true);
    });

    it('Debe retornar 400 Bad Request cuando el nombre no es un texto (string)', async () => {
      const payload = { nombre: 12345 };

      const response = await request(app.getHttpServer())
        .post('/tipo-de-alimentos')
        .send(payload)
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });
  });

  describe('GET /tipo-de-alimentos - Listar Tipos de Alimentos', () => {
    it('Debe retornar 200 OK y la lista de tipos de alimentos', async () => {
      const records = [
        { id_tipo_insumo: 1, nombre: 'Concentrado Iniciador' },
        { id_tipo_insumo: 2, nombre: 'Maíz Molido' },
      ];
      service.findAll.mockResolvedValue(records);

      const response = await request(app.getHttpServer())
        .get('/tipo-de-alimentos')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('nombre', 'Concentrado Iniciador');
    });
  });

  describe('GET /tipo-de-alimentos/:id - Obtener por ID', () => {
    it('Debe retornar 200 OK y el registro especificado cuando existe', async () => {
      const record = { id_tipo_insumo: 1, nombre: 'Concentrado Iniciador' };
      service.findOne.mockResolvedValue(record);

      const response = await request(app.getHttpServer())
        .get('/tipo-de-alimentos/1')
        .expect(200);

      expect(response.body).toEqual(record);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('Debe retornar 404 Not Found cuando el registro no existe', async () => {
      service.findOne.mockResolvedValue(null);

      // Si el servicio no encuentra el registro y el controller/service lanza o responde not found
      // comprobamos la llamada a service.findOne
      const response = await request(app.getHttpServer())
        .get('/tipo-de-alimentos/999')
        .expect(200);

      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });
});

