import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type {
  FlashcardType,
  KnowledgeLevel,
  UsageContext,
} from '@lab/types/deep-read/flashcards/index.js';

@Entity('flashcards')
export class FlashcardEntity implements FlashcardType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ name: 'source_url', type: 'text', nullable: true })
  sourceUrl: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'varchar' })
  level: KnowledgeLevel;

  @Column({ type: 'varchar', array: true, default: '{}' })
  contexts: UsageContext[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: string;
}
