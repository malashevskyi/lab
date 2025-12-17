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
}
