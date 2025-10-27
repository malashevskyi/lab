export type KnowledgeLevel = 'junior' | 'middle' | 'senior';
export type UsageContext =
  | 'interview'
  | 'general-knowledge'
  | 'best-practice'
  | 'deep-dive';

export interface FlashcardType {
  /**
   * @format uuid
   */
  id: string;
  /**
   * @format 'string'
   * @minLength 1 'Question cannot be empty.'
   */
  question: string;
  /**
   * @format 'string'
   * @minLength 1 'Answer cannot be empty.'
   */
  answer: string;
  /**
   * @format url
   */
  sourceUrl: string;
  tags: string[];
  level: KnowledgeLevel;
  contexts: UsageContext[];
  /**
   * @format 'date-time'
   */
  createdAt: string;
  /**
   * @format 'date-time'
   */
  updatedAt: string;
}
