import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigrationAndUUIDSetup1782867387441 implements MigrationInterface {
    name = 'InitialMigrationAndUUIDSetup1782867387441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" ADD "id_numeric" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "id_numeric" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "unidades_de_medida" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "unidades_de_medida" ADD CONSTRAINT "UQ_593f76750f9c96bfaa23ae2d902" UNIQUE ("uuid")`);
        await queryRunner.query(`ALTER TABLE "tratamientos" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "tratamientos" ADD CONSTRAINT "UQ_7cda7035c0ceb87014928e2396d" UNIQUE ("uuid")`);
        await queryRunner.query(`ALTER TABLE "tipo_de_alimentos" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "tipo_de_alimentos" ADD CONSTRAINT "UQ_0540bded9daf81859b97a7e14e6" UNIQUE ("uuid")`);
        await queryRunner.query(`ALTER TABLE "razas" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "razas" ADD CONSTRAINT "UQ_b18e00d8232f602b7e3f2f6582a" UNIQUE ("uuid")`);
        await queryRunner.query(`ALTER TABLE "galpones" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "galpones" ADD CONSTRAINT "UQ_fe19c9e871116f420e6aa653052" UNIQUE ("uuid")`);
        await queryRunner.query(`ALTER TABLE "lotes" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "lotes" ADD CONSTRAINT "UQ_8740700a57542631430a34d6bf2" UNIQUE ("uuid")`);
        await queryRunner.query(`ALTER TABLE "produccion" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "produccion" ADD CONSTRAINT "UQ_01fa1702494c27f28cc29eb9ad0" UNIQUE ("uuid")`);
        await queryRunner.query(`ALTER TABLE "muertes" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "muertes" ADD CONSTRAINT "UQ_7b0066ae05bd3862aee687f65e6" UNIQUE ("uuid")`);
        await queryRunner.query(`ALTER TABLE "alimento" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "alimento" ADD CONSTRAINT "UQ_fcd7030650efef691b83a34da03" UNIQUE ("uuid")`);
        await queryRunner.query(`ALTER TABLE "movimientos_insumo" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "movimientos_insumo" ADD CONSTRAINT "UQ_732eac62237e6e24451ac9de845" UNIQUE ("uuid")`);
        await queryRunner.query(`ALTER TABLE "estado" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "estado" ADD CONSTRAINT "UQ_96b2089d8c21da1e51c5c482920" UNIQUE ("uuid")`);
        await queryRunner.query(`ALTER TABLE "alertas" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "alertas" ADD CONSTRAINT "UQ_65f6e0824730d9a8c5393d7a76f" UNIQUE ("uuid")`);
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
