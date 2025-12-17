import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChunksTable1765987018196 implements MigrationInterface {
  name = 'CreateChunksTable1765987018196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "flashcard_group_urls" ("id" text NOT NULL, CONSTRAINT "PK_d1c0b0819cb39bb57804030ad14" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chunks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" text NOT NULL, "lang" character varying NOT NULL DEFAULT 'en', CONSTRAINT "PK_a306e60b8fdf6e7de1be4be1e6a" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "chunks"`);
    await queryRunner.query(`DROP TABLE "flashcard_group_urls"`);
  }
}
