import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { ChunkType } from '@lab/types/assistant/chunks/index.js';
import { DEFAULT_LANGUAGE } from '../../shared/constants/languages.js';

@Entity('chunks')
export class ChunkEntity implements ChunkType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'varchar', default: DEFAULT_LANGUAGE })
  lang: string;

  @Column({ type: 'text', nullable: true })
  uk: string | null;

  @Column({ type: 'text', nullable: true, name: 'chunk_audio' })
  chunkAudio: string | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'chunk_audio_expires_at',
  })
  chunkAudioExpiresAt: string | null;

  @Column({ type: 'boolean', default: false })
  synced: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: string;
}
