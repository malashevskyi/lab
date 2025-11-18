import { Controller, Get, Post, Body, Param, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { StacksService } from './stacks.service';
import { StackEntity } from './entities/stack.entity';
import { CreateStackDto } from './dto/create-stack.dto';
import { GetAllStacksDocs } from './decorators/get-all-stacks.docs.decorator';
import { FindStackByNameDocs } from './decorators/find-stack-by-name.docs.decorator';
import { CreateStackDocs } from './decorators/create-stack.docs.decorator';

@ApiTags('Stacks')
@UsePipes(ZodValidationPipe)
@Controller('stacks')
export class StacksController {
  constructor(private readonly stacksService: StacksService) {}

  @Get()
  @GetAllStacksDocs()
  async getAllStacks(): Promise<StackEntity[]> {
    return this.stacksService.findAll();
  }

  @Get(':name')
  @FindStackByNameDocs()
  async findStackByName(
    @Param('name') name: string,
  ): Promise<StackEntity | null> {
    return this.stacksService.findByName(name);
  }

  @Post()
  @CreateStackDocs()
  async createStack(@Body() dto: CreateStackDto): Promise<StackEntity> {
    return this.stacksService.create(dto.id);
  }
}
