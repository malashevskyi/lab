import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StackEntity } from './entities/stack.entity';

@Injectable()
export class StacksService {
  constructor(
    @InjectRepository(StackEntity)
    private readonly stacksRepository: Repository<StackEntity>,
  ) {}

  /**
   * Get all stacks from the database
   * @returns {Promise<StackEntity[]>} Array of all stack entities
   */
  async findAll(): Promise<StackEntity[]> {
    return this.stacksRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  /**
   * Find a stack by exact case-insensitive match
   * Uses LOWER() for exact match, not partial match
   * @param stackName - The stack name to search for
   * @returns {Promise<StackEntity | null>} Found stack entity or null
   */
  async findByName(stackName: string): Promise<StackEntity | null> {
    const stack = await this.stacksRepository
      .createQueryBuilder('stack')
      .where('LOWER(stack.id) = LOWER(:stackName)', { stackName })
      .getOne();

    return stack;
  }

  /**
   * Create a new stack or return existing one if already exists
   * @param stackName - The stack name to create
   * @returns {Promise<StackEntity>} Created or existing stack entity
   */
  async create(stackName: string): Promise<StackEntity> {
    // Check if stack already exists (case-insensitive)
    const existingStack = await this.findByName(stackName);

    if (existingStack) {
      return existingStack;
    }

    // Create new stack with the exact case as provided
    const newStack = this.stacksRepository.create({
      id: stackName,
    });

    return this.stacksRepository.save(newStack);
  }

  /**
   * Find or create a stack based on context string
   * This is the main method to use when working with flashcard contexts
   * @param context - The context string from AI response (e.g., "React", "node.js")
   * @returns {Promise<StackEntity>} Found or created stack entity
   */
  async findOrCreate(context: string): Promise<StackEntity> {
    const existingStack = await this.findByName(context);

    if (existingStack) {
      return existingStack;
    }

    return this.create(context);
  }

  /**
   * Update stack ID (rename stack)
   * This updates ONLY the case of the stack name (e.g., "react" → "React")
   * All flashcards with this stack will be updated automatically via CASCADE
   * @param oldId - Current stack ID
   * @param newId - New stack ID (must be case-insensitive match)
   * @returns {Promise<StackEntity>} Updated stack entity
   */
  async update(oldId: string, newId: string): Promise<StackEntity> {
    const stack = await this.findByName(oldId);

    if (!stack) {
      throw new Error(`Stack with id "${oldId}" not found`);
    }

    // Only allow case changes (same stack, different capitalization)
    if (oldId.toLowerCase() !== newId.toLowerCase()) {
      throw new Error(
        `Cannot rename stack "${oldId}" to "${newId}". Only case changes are allowed.`,
      );
    }

    // Update stack ID (case change only)
    await this.stacksRepository
      .createQueryBuilder()
      .update(StackEntity)
      .set({ id: newId })
      .where('LOWER(id) = LOWER(:oldId)', { oldId })
      .execute();

    const updated = await this.findByName(newId);
    if (!updated) {
      throw new Error(`Failed to update stack "${oldId}" to "${newId}"`);
    }
    return updated;
  }
}
