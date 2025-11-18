import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StacksController } from './stacks.controller';
import { StacksService } from './stacks.service';
import { StackEntity } from './entities/stack.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StackEntity])],
  controllers: [StacksController],
  providers: [StacksService],
  exports: [StacksService],
})
export class StacksModule {}
