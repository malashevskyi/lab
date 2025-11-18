import { Entity, PrimaryColumn } from 'typeorm';
import type { StackType } from '@lab/types/assistant/stack/index.js';

@Entity('stacks')
export class StackEntity implements StackType {
  @PrimaryColumn({ type: 'varchar' })
  id: string;
}
