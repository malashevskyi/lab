import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuestionAudioUrlExpiresAtToFlashcards1768222271411
  implements MigrationInterface
{
  name = 'AddQuestionAudioUrlExpiresAtToFlashcards1768222271411';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flashcards" ADD "question_audio_url_expires_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flashcards" DROP COLUMN "question_audio_url_expires_at"`,
    );
  }
}
