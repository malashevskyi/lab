import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuestionAudioUrl1762941519610 implements MigrationInterface {
  name = 'AddQuestionAudioUrl1762941519610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flashcards" ADD "question_audio_url" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flashcards" DROP COLUMN "question_audio_url"`,
    );
  }
}
