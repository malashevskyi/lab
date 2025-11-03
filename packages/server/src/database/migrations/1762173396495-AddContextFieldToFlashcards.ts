import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContextFieldToFlashcards1762173396495
  implements MigrationInterface
{
  name = 'AddContextFieldToFlashcards1762173396495';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flashcards" ADD "context" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "flashcards" DROP COLUMN "context"`);
  }
}
