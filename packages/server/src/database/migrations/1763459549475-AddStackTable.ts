import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStackTable1763459549475 implements MigrationInterface {
  name = 'AddStackTable1763459549475';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "stacks" ("id" character varying NOT NULL, CONSTRAINT "PK_04890620d6f2e3102d6756b1db0" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "stacks"`);
  }
}
