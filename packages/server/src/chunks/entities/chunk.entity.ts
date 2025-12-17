import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { ChunkType } from '@lab/types/assistant/chunks/index.js';

@Entity('chunks')
export class ChunkEntity implements ChunkType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'varchar', default: 'en' })
  lang: string;
}
