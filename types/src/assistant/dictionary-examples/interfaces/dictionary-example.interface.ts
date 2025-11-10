export interface DictionaryExampleType {
  /**
   * @format 'uuid'
   */
  id: string;
  /**
   * @format 'string'
   * @minLength 1 "Example is required"
   */
  example: string;
  /**
   * @format 'string'
   * @minLength 1 "Translation is required"
   */
  translation: string;
  /**
   * @format 'string'
   * @minLength 1 "Accent is required"
   */
  accent: string;
  /**
   * @format 'string'
   * @minLength 1 "Accent translation is required"
   */
  accentTranslation: string;
  /**
   * @format 'string'
   * @minLength 1 "Accent transcription is required"
   */
  accentTranscription: string;
  /**
   * @format 'uuid'
   */
  dictionaryEntryId: string;
  /**
   * We omit typing the ManyToOne/ForeignKey relationship here (like 'dictionaryEntry')
   * to prevent circular dependencies during Zod schema generation.
   * This practice is applied to all ManyToOne/OneToOne relations.
   * Only OneToMany collections are typed for relationship completion.
   */
  // import { DictionaryEntryType } from '@/dictionary-entries/interfaces/dictionary-entry.interface';
  // dictionaryEntry: DictionaryEntryType;
  /**
   * @format 'date-time'
   */
  createdAt: string;
  /**
   * @format 'date-time'
   */
  updatedAt: string;
}
