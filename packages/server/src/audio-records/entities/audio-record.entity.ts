import type { AudioRecordType } from '@lab/types/deep-read/audio-records/index.js';
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DictionaryEntry } from '../../dictionary-entries/entities/dictionary-entry.entity.js';

@Entity('audio_records')
export class AudioRecord implements AudioRecordType {
  @PrimaryColumn('text')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'audio_url', type: 'varchar' })
  audioUrl: string;

  @Column({ name: 'storage_path', type: 'varchar' })
  storagePath: string;

  @Index()
  @Column({ name: 'dictionary_entry_id', type: 'uuid', nullable: true })
  dictionaryEntryId: string | null;

  @ManyToOne(() => DictionaryEntry, (entry) => entry.audioRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dictionary_entry_id' })
  dictionaryEntry: DictionaryEntry;

  @Column({ name: 'audio_url_expires_at', type: 'timestamptz', nullable: true })
  audioUrlExpiresAt: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: string;
}
