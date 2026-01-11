import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSyncedToChunks1768076135655 implements MigrationInterface {
  name = 'AddSyncedToChunks1768076135655';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chunks" ADD "synced" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chunks" DROP COLUMN "synced"`);
  }
}
