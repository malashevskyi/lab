import { Entity, PrimaryColumn } from 'typeorm';

@Entity('flashcard_group_urls')
export class FlashcardGroupUrlEntity {
  @PrimaryColumn()
  id: string;
}
