import { Module } from '@nestjs/common';
import { HandleFilesService } from './handle-files.service';
import { HandleFilesController } from './handle-files.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [HandleFilesController],
  providers: [HandleFilesService],
  imports: [ConfigModule],
})
export class HandleFilesModule {}
