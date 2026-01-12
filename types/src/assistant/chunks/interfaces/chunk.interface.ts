export interface ChunkType {
  /**
   * @format uuid
   */
  id: string;
  /**
   * @format 'string'
   * @minLength 1 'Text cannot be empty.'
   */
  text: string;
  /**
   * @format 'string'
   * @minLength 2
   * @maxLength 10
   */
  lang: string;
  /**
   * Ukrainian translation of the chunk
   * @format 'string'
   */
  uk: string | null;
  /**
   * URL to the audio file for the chunk (English pronunciation)
   * @format 'string'
   */
  chunkAudio: string | null;
  /**
   * Expiration date for the chunk audio signed URL
   * @format 'date-time'
   */
  chunkAudioExpiresAt: string | null;
  /**
   * Whether this chunk has been synced to the old project
   * @format 'boolean'
   */
  synced: boolean;
  /**
   * @format 'date-time'
   */
  createdAt: string;
  /**
   * @format 'date-time'
   */
  updatedAt: string;
}

export interface CreateChunkType {
  /**
   * @format 'string'
   * @minLength 1 'Text cannot be empty.'
   */
  text: string;
  /**
   * @format 'string'
   * @minLength 2
   * @maxLength 10
   */
  lang?: string;
}

export interface CreateChunksBodyType {
  chunks: CreateChunkType[];
  /**
   * Whether to adjust the chunks with AI before saving
   * (add capitalization, punctuation, minimal grammar fixes)
   */
  adjust?: boolean;
}
