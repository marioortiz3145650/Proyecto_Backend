import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMasterMigration1783650000000 implements MigrationInterface {
    name = 'InitialMasterMigration1783650000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "id_numeric" SERIAL NOT NULL,
                "nombre" text NOT NULL UNIQUE,
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "id_numeric" SERIAL NOT NULL,
                "nombre" text NOT NULL,
                "correo" text NOT NULL UNIQUE,
                "nombre_usuario" text NOT NULL UNIQUE,
                "contrasena_hash" text NOT NULL,
                "fecha_registro" TIMESTAMP NOT NULL DEFAULT now(),
                "fecha_actualizacion" TIMESTAMP NOT NULL DEFAULT now(),
                "rolId" uuid,
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_users_roles" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE RESTRICT
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "razas" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "id_raza" SERIAL NOT NULL,
                "nombre_raza" character varying(100) NOT NULL UNIQUE,
                "activo" boolean NOT NULL DEFAULT true,
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_razas_uuid" PRIMARY KEY ("uuid")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "unidades_de_medida" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "id_unidad" SERIAL NOT NULL,
                "nombre" character varying(100) NOT NULL,
                "abreviatura" character varying(20) NOT NULL,
                CONSTRAINT "PK_unidades_de_medida_uuid" PRIMARY KEY ("uuid")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "tipo_de_alimentos" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "id_tipo_insumo" SERIAL NOT NULL,
                "nombre" character varying(100) NOT NULL,
                CONSTRAINT "PK_tipo_de_alimentos_uuid" PRIMARY KEY ("uuid")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "lotes" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "id_lote" SERIAL NOT NULL,
                "edad_semanas" integer NOT NULL,
                "fecha_inicio" date NOT NULL,
                "fecha_fin" date,
                "total_gallinas" integer NOT NULL DEFAULT 0,
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(),
                "raza_id" uuid,
                CONSTRAINT "PK_lotes_uuid" PRIMARY KEY ("uuid"),
                CONSTRAINT "FK_lotes_razas" FOREIGN KEY ("raza_id") REFERENCES "razas"("uuid") ON DELETE RESTRICT
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "galpones" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "id_galpon" SERIAL NOT NULL,
                "nombre_galpon" text NOT NULL,
                "capacidad" integer NOT NULL,
                "ubicacion" text NOT NULL,
                "lote_id" uuid,
                CONSTRAINT "PK_galpones_uuid" PRIMARY KEY ("uuid"),
                CONSTRAINT "FK_galpones_lotes" FOREIGN KEY ("lote_id") REFERENCES "lotes"("uuid") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "alimento" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "id_insumo" SERIAL NOT NULL,
                "nombre" character varying(100) NOT NULL,
                "stock_actual" numeric(10,2) NOT NULL DEFAULT 0,
                "stock_minimo" numeric(10,2) NOT NULL DEFAULT 0,
                "precio_unitario" numeric(10,2) NOT NULL DEFAULT 0,
                "tipo_alimento_id" uuid,
                "unidad_medida_id" uuid,
                CONSTRAINT "PK_alimento_uuid" PRIMARY KEY ("uuid"),
                CONSTRAINT "FK_alimento_tipo" FOREIGN KEY ("tipo_alimento_id") REFERENCES "tipo_de_alimentos"("uuid") ON DELETE RESTRICT,
                CONSTRAINT "FK_alimento_unidad" FOREIGN KEY ("unidad_medida_id") REFERENCES "unidades_de_medida"("uuid") ON DELETE RESTRICT
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "produccion" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "id_produccion" SERIAL NOT NULL,
                "fecha" date NOT NULL,
                "jumbo" integer NOT NULL DEFAULT 0,
                "aaa" integer NOT NULL DEFAULT 0,
                "aa" integer NOT NULL DEFAULT 0,
                "a" integer NOT NULL DEFAULT 0,
                "b" integer NOT NULL DEFAULT 0,
                "c" integer NOT NULL DEFAULT 0,
                "total" integer NOT NULL DEFAULT 0,
                "fecha_registro" TIMESTAMP NOT NULL DEFAULT now(),
                "lote_id" uuid,
                "creado_por" uuid,
                CONSTRAINT "PK_produccion_uuid" PRIMARY KEY ("uuid"),
                CONSTRAINT "FK_produccion_lotes" FOREIGN KEY ("lote_id") REFERENCES "lotes"("uuid") ON DELETE CASCADE,
                CONSTRAINT "FK_produccion_users" FOREIGN KEY ("creado_por") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "movimientos_insumo" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "id_movimiento" SERIAL NOT NULL,
                "tipo_movimiento" text NOT NULL,
                "cantidad" numeric(10,2) NOT NULL,
                "fecha" TIMESTAMP NOT NULL DEFAULT now(),
                "observaciones" text,
                "insumo_id" uuid,
                "lote_id" uuid,
                "creado_por" uuid,
                CONSTRAINT "PK_movimientos_insumo_uuid" PRIMARY KEY ("uuid"),
                CONSTRAINT "FK_movimientos_alimento" FOREIGN KEY ("insumo_id") REFERENCES "alimento"("uuid") ON DELETE RESTRICT,
                CONSTRAINT "FK_movimientos_lotes" FOREIGN KEY ("lote_id") REFERENCES "lotes"("uuid") ON DELETE SET NULL,
                CONSTRAINT "FK_movimientos_users" FOREIGN KEY ("creado_por") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "muertes" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "id_muerte" SERIAL NOT NULL,
                "fecha" date NOT NULL,
                "cantidad" integer NOT NULL,
                "causa" text NOT NULL,
                "lote_id" uuid,
                "usuario_id" uuid,
                CONSTRAINT "PK_muertes_uuid" PRIMARY KEY ("uuid"),
                CONSTRAINT "FK_muertes_lotes" FOREIGN KEY ("lote_id") REFERENCES "lotes"("uuid") ON DELETE CASCADE,
                CONSTRAINT "FK_muertes_users" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "tratamientos" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "id_tratamiento" SERIAL NOT NULL,
                "nombre_medicamento" text NOT NULL,
                "dosis" text NOT NULL,
                "fecha_inicio" date NOT NULL,
                "fecha_fin" date NOT NULL,
                "observaciones" text,
                "lote_id" uuid,
                "creado_por" uuid,
                CONSTRAINT "PK_tratamientos_uuid" PRIMARY KEY ("uuid"),
                CONSTRAINT "FK_tratamientos_lotes" FOREIGN KEY ("lote_id") REFERENCES "lotes"("uuid") ON DELETE CASCADE,
                CONSTRAINT "FK_tratamientos_users" FOREIGN KEY ("creado_por") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "alertas" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "id_alerta" SERIAL NOT NULL,
                "tipo" text NOT NULL,
                "titulo" text NOT NULL,
                "mensaje" text NOT NULL,
                "prioridad" text NOT NULL,
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(),
                "leida" boolean NOT NULL DEFAULT false,
                "lote_id" uuid,
                "galpon_id" uuid,
                CONSTRAINT "PK_alertas_uuid" PRIMARY KEY ("uuid"),
                CONSTRAINT "FK_alertas_lotes" FOREIGN KEY ("lote_id") REFERENCES "lotes"("uuid") ON DELETE CASCADE,
                CONSTRAINT "FK_alertas_galpones" FOREIGN KEY ("galpon_id") REFERENCES "galpones"("uuid") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "settings" (
                "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "key" character varying NOT NULL UNIQUE,
                "value" text NOT NULL,
                "modificado_por" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_settings_uuid" PRIMARY KEY ("uuid"),
                CONSTRAINT "FK_settings_users" FOREIGN KEY ("modificado_por") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "settings"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "alertas"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tratamientos"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "muertes"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "movimientos_insumo"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "produccion"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "alimento"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "tipo_de_alimentos"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "unidades_de_medida"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "galpones"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "lotes"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "razas"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
    }
}
