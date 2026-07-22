import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSettingsTable1783640902738 implements MigrationInterface {
    name = 'CreateSettingsTable1783640902738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "settings" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying(120) NOT NULL, "value" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c8639b7626fa94ba8265628f214" UNIQUE ("key"), CONSTRAINT "PK_4ede76208970cde9dc26f4a4f87" PRIMARY KEY ("uuid"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "settings"`);
    }

}
