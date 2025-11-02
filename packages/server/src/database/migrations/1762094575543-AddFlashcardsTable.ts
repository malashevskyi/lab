import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFlashcardsTable1762094575543 implements MigrationInterface {
  name = 'AddFlashcardsTable1762094575543';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "flashcards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" text NOT NULL, "answer" text NOT NULL, "source_url" text, "tags" text array NOT NULL DEFAULT '{}', "level" character varying NOT NULL, "contexts" character varying array NOT NULL DEFAULT '{}', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9acf891ec7aaa7ca05c264ea94d" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "flashcards"`);
  }
}
