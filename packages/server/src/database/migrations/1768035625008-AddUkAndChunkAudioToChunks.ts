import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUkAndChunkAudioToChunks1768035625008 implements MigrationInterface {
    name = 'AddUkAndChunkAudioToChunks1768035625008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chunks" ADD "uk" text`);
        await queryRunner.query(`ALTER TABLE "chunks" ADD "chunk_audio" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chunks" DROP COLUMN "chunk_audio"`);
        await queryRunner.query(`ALTER TABLE "chunks" DROP COLUMN "uk"`);
    }

}
