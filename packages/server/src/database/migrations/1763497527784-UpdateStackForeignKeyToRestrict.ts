import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStackForeignKeyToRestrict1763497527784
  implements MigrationInterface
{
  name = 'UpdateStackForeignKeyToRestrict1763497527784';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flashcards" DROP CONSTRAINT "FK_4d6467f177c1f1bfdf3bc1b28ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flashcards" ADD CONSTRAINT "FK_4d6467f177c1f1bfdf3bc1b28ec" FOREIGN KEY ("context") REFERENCES "stacks"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flashcards" DROP CONSTRAINT "FK_4d6467f177c1f1bfdf3bc1b28ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flashcards" ADD CONSTRAINT "FK_4d6467f177c1f1bfdf3bc1b28ec" FOREIGN KEY ("context") REFERENCES "stacks"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }
}
