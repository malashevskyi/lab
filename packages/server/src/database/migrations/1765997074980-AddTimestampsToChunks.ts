import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsToChunks1765997074980 implements MigrationInterface {
  name = 'AddTimestampsToChunks1765997074980';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chunks" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "chunks" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chunks" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "chunks" DROP COLUMN "created_at"`);
  }
}
