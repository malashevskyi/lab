import type { DictionaryEntryType } from '@lab/types/assistant/dictionary-entries/index.js';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { DictionaryExample } from '../../dictionary-examples/entities/dictionary-example.entity.js';
import { AudioRecord } from '../../audio-records/entities/audio-record.entity.js';

@Entity('dictionary_entries')
export class DictionaryEntry implements DictionaryEntryType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column('text')
  text: string;

  @Column({ type: 'varchar' })
  transcription: string;

  @Column({
    name: 'pronounce_video_links',
    type: 'text',
    array: true,
    default: '{}',
  })
  pronounceVideoLinks: string[];

  @OneToMany(() => DictionaryExample, (example) => example.dictionaryEntry)
  examples: DictionaryExample[];

  @OneToMany(() => AudioRecord, (audio) => audio.dictionaryEntry)
  audioRecords: AudioRecord[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: string;
}
