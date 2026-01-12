import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChunkAudioExpiresAtToChunks1768221425100
  implements MigrationInterface
{
  name = 'AddChunkAudioExpiresAtToChunks1768221425100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chunks" ADD "chunk_audio_expires_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chunks" DROP COLUMN "chunk_audio_expires_at"`,
    );
  }
}
