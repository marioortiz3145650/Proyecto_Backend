import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigrationAndUUIDSetup1782867387441 implements MigrationInterface {
    name = 'InitialMigrationAndUUIDSetup1782867387441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "nombre" text NOT NULL UNIQUE,
                "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_roles_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "nombre" text NOT NULL,
                "correo" text NOT NULL UNIQUE,
                "nombre_usuario" text NOT NULL UNIQUE,
                "contrasena_hash" text NOT NULL,
                "activo" boolean NOT NULL DEFAULT true,
                "fecha_registro" TIMESTAMP NOT NULL DEFAULT now(),
                "fecha_actualizacion" TIMESTAMP NOT NULL DEFAULT now(),
                "rol_id" uuid,
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "unidades_de_medida" (
                "id_unidad" SERIAL NOT NULL,
                "nombre" text NOT NULL,
                "abreviatura" text NOT NULL,
                CONSTRAINT "PK_unidades_de_medida" PRIMARY KEY ("id_unidad")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "tipo_de_alimentos" (
                "id_tipo_insumo" SERIAL NOT NULL,
                "nombre" text NOT NULL,
                CONSTRAINT "PK_tipo_de_alimentos" PRIMARY KEY ("id_tipo_insumo")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "razas" (
                "id_raza" SERIAL NOT NULL,
                "nombre_raza" text NOT NULL,
                "activo" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_razas" PRIMARY KEY ("id_raza")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "galpones" (
                "id_galpon" SERIAL NOT NULL,
                "nombre_galpon" text NOT NULL,
                "capacidad" integer NOT NULL,
                "ubicacion" text NOT NULL,
                "lote_id" integer,
                CONSTRAINT "PK_galpones" PRIMARY KEY ("id_galpon")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "lotes" (
                "id_lote" SERIAL NOT NULL,
                "cantidad_aves" integer NOT NULL,
                "fecha_ingreso" date NOT NULL,
                "estado" text NOT NULL DEFAULT 'Activo',
                "raza_id" integer,
                CONSTRAINT "PK_lotes" PRIMARY KEY ("id_lote")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "alimento" (
                "id_insumo" SERIAL NOT NULL,
                "nombre_alimento" text NOT NULL,
                "cantidad_disponible" numeric(10,2) NOT NULL DEFAULT 0,
                "tipo_alimento_id" integer,
                "unidad_medida_id" integer,
                CONSTRAINT "PK_alimento" PRIMARY KEY ("id_insumo")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "movimientos_insumo" (
                "id_movimiento" SERIAL NOT NULL,
                "tipo_movimiento" text NOT NULL,
                "cantidad" numeric(10,2) NOT NULL,
                "fecha" TIMESTAMP NOT NULL DEFAULT now(),
                "insumo_id" integer,
                "lote_id" integer,
                CONSTRAINT "PK_movimientos_insumo" PRIMARY KEY ("id_movimiento")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "estado" (
                "id" SERIAL NOT NULL,
                "nombre" text NOT NULL,
                CONSTRAINT "PK_estado" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "muertes" (
                "id_muerte" SERIAL NOT NULL,
                "fecha" date NOT NULL,
                "cantidad" integer NOT NULL,
                "causa" text NOT NULL,
                "lote_id" integer,
                "registrado_por" uuid,
                CONSTRAINT "PK_muertes" PRIMARY KEY ("id_muerte")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "produccion" (
                "id_produccion" SERIAL NOT NULL,
                "fecha" date NOT NULL,
                "total_huevos" integer NOT NULL DEFAULT 0,
                "huevos_buenos" integer NOT NULL DEFAULT 0,
                "huevos_rotos" integer NOT NULL DEFAULT 0,
                "huevos_sucios" integer NOT NULL DEFAULT 0,
                "huevos_deformes" integer NOT NULL DEFAULT 0,
                "lote_id" integer,
                "registrado_por" uuid,
                CONSTRAINT "PK_produccion" PRIMARY KEY ("id_produccion")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "tratamientos" (
                "id_tratamiento" SERIAL NOT NULL,
                "nombre_medicamento" text NOT NULL,
                "dosis" text NOT NULL,
                "fecha_inicio" date NOT NULL,
                "fecha_fin" date NOT NULL,
                "observaciones" text,
                "lote_id" integer,
                "creado_por" uuid,
                "estado_id" integer NOT NULL DEFAULT 1,
                CONSTRAINT "PK_tratamientos" PRIMARY KEY ("id_tratamiento")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "alertas" (
                "id_alerta" SERIAL NOT NULL,
                "tipo" text NOT NULL,
                "titulo" text NOT NULL,
                "mensaje" text NOT NULL,
                "gravedad" text NOT NULL,
                "fecha" TIMESTAMP NOT NULL DEFAULT now(),
                "leida" boolean NOT NULL DEFAULT false,
                "lote_id" integer,
                "galpon_id" integer,
                CONSTRAINT "PK_alertas" PRIMARY KEY ("id_alerta")
            )
        `);

        const hasRolesIdNumeric = await queryRunner.hasColumn("roles", "id_numeric");
        if (!hasRolesIdNumeric) {
            await queryRunner.query(`ALTER TABLE "roles" ADD "id_numeric" SERIAL NOT NULL`);
        }

        const hasUsersIdNumeric = await queryRunner.hasColumn("users", "id_numeric");
        if (!hasUsersIdNumeric) {
            await queryRunner.query(`ALTER TABLE "users" ADD "id_numeric" SERIAL NOT NULL`);
        }

        const hasUnidadesUuid = await queryRunner.hasColumn("unidades_de_medida", "uuid");
        if (!hasUnidadesUuid) {
            await queryRunner.query(`ALTER TABLE "unidades_de_medida" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
            await queryRunner.query(`ALTER TABLE "unidades_de_medida" ADD CONSTRAINT "UQ_593f76750f9c96bfaa23ae2d902" UNIQUE ("uuid")`);
        }

        const hasTratamientosUuid = await queryRunner.hasColumn("tratamientos", "uuid");
        if (!hasTratamientosUuid) {
            await queryRunner.query(`ALTER TABLE "tratamientos" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
            await queryRunner.query(`ALTER TABLE "tratamientos" ADD CONSTRAINT "UQ_7cda7035c0ceb87014928e2396d" UNIQUE ("uuid")`);
        }

        const hasTipoAlimentosUuid = await queryRunner.hasColumn("tipo_de_alimentos", "uuid");
        if (!hasTipoAlimentosUuid) {
            await queryRunner.query(`ALTER TABLE "tipo_de_alimentos" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
            await queryRunner.query(`ALTER TABLE "tipo_de_alimentos" ADD CONSTRAINT "UQ_0540bded9daf81859b97a7e14e6" UNIQUE ("uuid")`);
        }

        const hasRazasUuid = await queryRunner.hasColumn("razas", "uuid");
        if (!hasRazasUuid) {
            await queryRunner.query(`ALTER TABLE "razas" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
            await queryRunner.query(`ALTER TABLE "razas" ADD CONSTRAINT "UQ_b18e00d8232f602b7e3f2f6582a" UNIQUE ("uuid")`);
        }

        const hasGalponesUuid = await queryRunner.hasColumn("galpones", "uuid");
        if (!hasGalponesUuid) {
            await queryRunner.query(`ALTER TABLE "galpones" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
            await queryRunner.query(`ALTER TABLE "galpones" ADD CONSTRAINT "UQ_fe19c9e871116f420e6aa653052" UNIQUE ("uuid")`);
        }

        const hasLotesUuid = await queryRunner.hasColumn("lotes", "uuid");
        if (!hasLotesUuid) {
            await queryRunner.query(`ALTER TABLE "lotes" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
            await queryRunner.query(`ALTER TABLE "lotes" ADD CONSTRAINT "UQ_8740700a57542631430a34d6bf2" UNIQUE ("uuid")`);
        }

        const hasProduccionUuid = await queryRunner.hasColumn("produccion", "uuid");
        if (!hasProduccionUuid) {
            await queryRunner.query(`ALTER TABLE "produccion" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
            await queryRunner.query(`ALTER TABLE "produccion" ADD CONSTRAINT "UQ_01fa1702494c27f28cc29eb9ad0" UNIQUE ("uuid")`);
        }

        const hasMuertesUuid = await queryRunner.hasColumn("muertes", "uuid");
        if (!hasMuertesUuid) {
            await queryRunner.query(`ALTER TABLE "muertes" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
            await queryRunner.query(`ALTER TABLE "muertes" ADD CONSTRAINT "UQ_7b0066ae05bd3862aee687f65e6" UNIQUE ("uuid")`);
        }

        const hasAlimentoUuid = await queryRunner.hasColumn("alimento", "uuid");
        if (!hasAlimentoUuid) {
            await queryRunner.query(`ALTER TABLE "alimento" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
            await queryRunner.query(`ALTER TABLE "alimento" ADD CONSTRAINT "UQ_fcd7030650efef691b83a34da03" UNIQUE ("uuid")`);
        }

        const hasMovimientosUuid = await queryRunner.hasColumn("movimientos_insumo", "uuid");
        if (!hasMovimientosUuid) {
            await queryRunner.query(`ALTER TABLE "movimientos_insumo" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
            await queryRunner.query(`ALTER TABLE "movimientos_insumo" ADD CONSTRAINT "UQ_732eac62237e6e24451ac9de845" UNIQUE ("uuid")`);
        }

        const hasEstadoTable = await queryRunner.hasTable("estado");
        if (hasEstadoTable) {
            const hasEstadoUuid = await queryRunner.hasColumn("estado", "uuid");
            if (!hasEstadoUuid) {
                await queryRunner.query(`ALTER TABLE "estado" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
                await queryRunner.query(`ALTER TABLE "estado" ADD CONSTRAINT "UQ_96b2089d8c21da1e51c5c482920" UNIQUE ("uuid")`);
            }
        }

        const hasAlertasUuid = await queryRunner.hasColumn("alertas", "uuid");
        if (!hasAlertasUuid) {
            await queryRunner.query(`ALTER TABLE "alertas" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
            await queryRunner.query(`ALTER TABLE "alertas" ADD CONSTRAINT "UQ_65f6e0824730d9a8c5393d7a76f" UNIQUE ("uuid")`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "alertas" DROP CONSTRAINT "UQ_65f6e0824730d9a8c5393d7a76f"`);
        await queryRunner.query(`ALTER TABLE "alertas" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "estado" DROP CONSTRAINT "UQ_96b2089d8c21da1e51c5c482920"`);
        await queryRunner.query(`ALTER TABLE "estado" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "movimientos_insumo" DROP CONSTRAINT "UQ_732eac62237e6e24451ac9de845"`);
        await queryRunner.query(`ALTER TABLE "movimientos_insumo" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "alimento" DROP CONSTRAINT "UQ_fcd7030650efef691b83a34da03"`);
        await queryRunner.query(`ALTER TABLE "alimento" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "muertes" DROP CONSTRAINT "UQ_7b0066ae05bd3862aee687f65e6"`);
        await queryRunner.query(`ALTER TABLE "muertes" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "produccion" DROP CONSTRAINT "UQ_01fa1702494c27f28cc29eb9ad0"`);
        await queryRunner.query(`ALTER TABLE "produccion" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "lotes" DROP CONSTRAINT "UQ_8740700a57542631430a34d6bf2"`);
        await queryRunner.query(`ALTER TABLE "lotes" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "galpones" DROP CONSTRAINT "UQ_fe19c9e871116f420e6aa653052"`);
        await queryRunner.query(`ALTER TABLE "galpones" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "razas" DROP CONSTRAINT "UQ_b18e00d8232f602b7e3f2f6582a"`);
        await queryRunner.query(`ALTER TABLE "razas" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "tipo_de_alimentos" DROP CONSTRAINT "UQ_0540bded9daf81859b97a7e14e6"`);
        await queryRunner.query(`ALTER TABLE "tipo_de_alimentos" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "tratamientos" DROP CONSTRAINT "UQ_7cda7035c0ceb87014928e2396d"`);
        await queryRunner.query(`ALTER TABLE "tratamientos" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "unidades_de_medida" DROP CONSTRAINT "UQ_593f76750f9c96bfaa23ae2d902"`);
        await queryRunner.query(`ALTER TABLE "unidades_de_medida" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "id_numeric"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "id_numeric"`);
    }

}
