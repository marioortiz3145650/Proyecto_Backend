import { MigrationInterface, QueryRunner } from "typeorm";

export class DropEstadoTable1782868306921 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "estado" CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
