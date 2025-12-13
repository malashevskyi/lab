import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AudioRecord } from './entities/audio-record.entity.js';
import { CreateAudioRecordDto } from './dto/create-audio-record.dto.js';
import {
  createAudioRecordSchema,
  updateAudioRecordSchema,
} from '@lab/types/assistant/audio-records/index.js';
import type { UpdateAudioRecordType } from '@lab/types/assistant/audio-records/index.js';
import { AppException } from '../shared/exceptions/AppException.js';
import { AppErrorCode } from 'src/shared/exceptions/AppErrorCode';

@Injectable()
export class AudioRecordsService {
  constructor(
    @InjectRepository(AudioRecord)
    private readonly audioRecordRepository: Repository<AudioRecord>,
  ) {}

  /**
   * Creates a new audio record.
   * Throws a ConflictException if a record with the same ID already exists.
   * @param recordData {@link CreateAudioRecordDto} - The data for the new audio record.
   * @returns The newly created audio record entity.
   */
  async createAudioRecord(
    recordData: CreateAudioRecordDto,
  ): Promise<AudioRecord> {
    const newRecord = this.audioRecordRepository.create(recordData);
    return this.audioRecordRepository.save(newRecord);
  }

  /**
   * Updates the dictionary entry association for an existing audio record.
   * @param id - The ID of the audio record to update.
   * @param dictionaryEntryId - The new dictionary entry ID to associate.
   * @returns The updated audio record entity.
   */

  async updateAudioRecordDictionary({
    id,
    dictionaryEntryId,
  }: UpdateAudioRecordType): Promise<AudioRecord> {
    const existingRecord = await this.audioRecordRepository.findOne({
      where: { id },
    });

    if (!existingRecord) {
      throw AppException.create(
        AppErrorCode.AUDIO_RECORD_NOT_FOUND,
        `Audio record with ID "${id}" not found.`,
      );
    }

    existingRecord.dictionaryEntryId = dictionaryEntryId;

    return this.audioRecordRepository.save(existingRecord);
  }

  /**
   * Creates a new audio record or updates the dictionary entry association
   * if the audio record already exists.
   * @param id - The ID of the audio record.
   * @param dictionaryEntryId - The dictionary entry ID to associate.
   * @returns The created or updated audio record entity.
   */
  async createOrUpdateAudioRecord(
    dto: CreateAudioRecordDto | UpdateAudioRecordType,
  ): Promise<AudioRecord> {
    const existingRecord = await this.findOneById(dto.id);

    if (existingRecord) {
      return this.updateAudioRecordDictionary(
        updateAudioRecordSchema.parse(dto),
      );
    }

    return this.createAudioRecord(createAudioRecordSchema.parse(dto));
  }

  /**
   * Finds a single audio record by its ID.
   * @param id - The ID of the audio record to find.
   * @returns The found audio record entity or null.
   */
  async findOneById(id: string): Promise<AudioRecord | null> {
    return this.audioRecordRepository.findOneBy({ id });
  }

  /**
   * Finds a single audio record by its ID.
   * @param id - The ID of the audio record to find.
   * @returns The found audio record entity.
   */
  async findOneByIdOrThrow(id: string): Promise<AudioRecord> {
    const record = await this.audioRecordRepository.findOneBy({ id });

    if (!record) {
      throw AppException.create(
        AppErrorCode.AUDIO_RECORD_NOT_FOUND,
        `Audio record with ID "${id}" not found.`,
      );
    }

    return record;
  }
}
