import {
  createDictionaryEntryWithExampleResponseSchema,
  type CreateEntryWithExampleResponseType,
  findOrCreateDictionaryEntryResponseSchema,
  type FindOrCreateDictionaryEntryResponseType,
  getDictionaryEntryWithExamplesByTextResponseSchema,
  type GetDictionaryEntryWithExamplesByTextResponseType,
} from '@lab/types/assistant/dictionary-entries/index.js';
import { GetDictionaryExampleResponseType } from '@lab/types/assistant/dictionary-examples/index.js';
import { Injectable, UsePipes } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppException } from '../shared/exceptions/AppException.js';
import { DataSource, Repository } from 'typeorm';
import { AudioRecordsService } from '../audio-records/audio-records.service.js';
import { AudioRecord } from '../audio-records/entities/audio-record.entity.js';
import { DictionaryExample } from '../dictionary-examples/entities/dictionary-example.entity.js';
import { CreateEntryWithExampleDto } from './dto/create-entry-with-example.dto.js';
import { DictionaryEntry } from './entities/dictionary-entry.entity.js';

@Injectable()
@UsePipes(ZodValidationPipe)
export class DictionaryEntriesService {
  constructor(
    @InjectRepository(DictionaryEntry)
    private readonly dictionaryEntriesRepository: Repository<DictionaryEntry>,
    private readonly audioRecordsService: AudioRecordsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Finds a dictionary entry by its text content. If not found, creates a new entry
   * after verifying that a corresponding audio record exists.
   * @param text - The text of the word or phrase.
   * @param transcription - The phonetic transcription of the text.
   */
  async findOrCreate(
    text: string,
    transcription: string,
  ): Promise<FindOrCreateDictionaryEntryResponseType> {
    let existingEntry = await this.dictionaryEntriesRepository.findOne({
      where: { text },
    });

    const audioRecord = await this.audioRecordsService.findOneByIdOrThrow(text);

    if (!existingEntry) {
      const newEntry = this.dictionaryEntriesRepository.create({
        text,
        transcription,
      });
      existingEntry = await this.dictionaryEntriesRepository.save(newEntry);
    }

    await this.audioRecordsService.createOrUpdateAudioRecord({
      id: text,
      dictionaryEntryId: existingEntry.id,
    });

    return findOrCreateDictionaryEntryResponseSchema.parse({
      ...existingEntry,
      audioRecords: [audioRecord.audioUrl],
    });
  }

  /**
   * Orchestrates the creation of a dictionary entry with its first example
   * and links it to an existing audio record within a single transaction.
   * @param dto {@link CreateEntryWithExampleDto}
   * @returns The newly created entry with its relations.
   */
  async createWithExample(
    dto: CreateEntryWithExampleDto,
  ): Promise<CreateEntryWithExampleResponseType> {
    const createdOrUpdateEntry = await this.dataSource.transaction(
      async (manager) => {
        const { text, transcription, example } = dto;

        const audioRecord =
          await this.audioRecordsService.findOneByIdOrThrow(text);

        let entry = await manager.findOne(DictionaryEntry, { where: { text } });
        if (!entry) {
          const newEntry = manager.create(DictionaryEntry, {
            text,
            transcription,
          });
          entry = await manager.save(newEntry);
        }

        await manager.update(
          AudioRecord,
          { id: audioRecord.id },
          { dictionaryEntryId: entry.id },
        );

        let exampleEntity = await manager.findOne(DictionaryExample, {
          where: {
            example: example.example,
            accent: example.accent,
          },
        });

        if (!exampleEntity) {
          const newExample = manager.create(DictionaryExample, {
            ...example,
            dictionaryEntryId: entry.id,
          });
          exampleEntity = await manager.save(newExample);
        }

        return entry;
      },
    );

    if (!createdOrUpdateEntry) {
      throw AppException.unknown('Failed to retrieve entry after transaction.');
    }

    return createDictionaryEntryWithExampleResponseSchema.parse({
      text: createdOrUpdateEntry.text,
    });
  }

  /**
   * Finds a single dictionary entry by its text and formats it for the client.
   * @param text - The text of the word or phrase to find.
   * @returns {@link GetDictionaryEntryWithExamplesByTextResponseType} The formatted dictionary entry with all relations.
   */

  async getEntryWithExamplesByText(
    text: string,
  ): Promise<GetDictionaryEntryWithExamplesByTextResponseType | null> {
    const entry = await this.dictionaryEntriesRepository.findOne({
      where: { text },
      relations: {
        examples: true,
        audioRecords: true,
      },
      order: {
        examples: {
          createdAt: 'DESC',
        },
      },
      select: {
        id: true,
        text: true,
        transcription: true,
        pronounceVideoLinks: true,
        examples: {
          id: true,
          example: true,
          translation: true,
          accent: true,
          accentTranslation: true,
          accentTranscription: true,
          createdAt: true, // needed for sorting
        },
        audioRecords: {
          audioUrl: true,
        },
      },
    });

    if (!entry) return null;

    const exampleTranslations = new Set(
      entry.examples.map((ex) => ex.accentTranslation),
    );
    const translation = Array.from(exampleTranslations).join(', ');

    const examples: GetDictionaryExampleResponseType[] = entry.examples.map(
      (ex) => ({
        example: ex.example,
        translation: ex.translation,
        accent: ex.accent,
        accentTranslation: ex.accentTranslation,
        accentTranscription: ex.accentTranscription,
      }),
    );

    const audioRecords: string[] = entry.audioRecords.map((ar) => ar.audioUrl);

    const result: GetDictionaryEntryWithExamplesByTextResponseType =
      getDictionaryEntryWithExamplesByTextResponseSchema.parse({
        id: entry.id,
        text: entry.text,
        transcription: entry.transcription,
        pronounceVideoLinks: entry.pronounceVideoLinks,
        audioRecords,
        examples,
        translation,
      });

    return result;
  }
}
