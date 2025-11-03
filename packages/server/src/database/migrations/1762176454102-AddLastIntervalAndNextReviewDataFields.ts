import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastIntervalAndNextReviewDataFields1762176454102
  implements MigrationInterface
{
  name = 'AddLastIntervalAndNextReviewDataFields1762176454102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flashcards" ADD "next_review_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "flashcards" ADD "last_interval" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flashcards" DROP COLUMN "last_interval"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flashcards" DROP COLUMN "next_review_date"`,
    );
  }
}
