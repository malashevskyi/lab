import { AudioRecordType } from '../../audio-records/index.js';
import { DictionaryExampleType } from '../../dictionary-examples/index.js';

export interface DictionaryEntryType {
  /**
   * @format 'uuid'
   */
  id: string;
  /**
   * @format 'string'
   * @minLength 1 Text is required
   */
  text: string;
  /**
   * @format 'ipa'
   * @minLength 1 "Transcription is required"
   */
  transcription: string;
  pronounceVideoLinks: string[];
  examples: DictionaryExampleType[];
  audioRecords: AudioRecordType[];
  /**
   * @format 'date-time'
   */
  createdAt: string;
  /**
   * @format 'date-time'
   */
  updatedAt: string;
}
