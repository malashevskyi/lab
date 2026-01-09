export abstract class AiChunkAdjusterPort {
  /**
   * Adjust a chunk by adding capitalization, punctuation, or minimal grammar fixes
   * to make it a standalone sentence without changing core words or meaning.
   * @param chunk - raw text copied from page
   * @param lang - language code (default 'en')
   * @returns adjusted chunk text
   */
  abstract adjustChunk(chunk: string, lang?: string): Promise<string>;
}
