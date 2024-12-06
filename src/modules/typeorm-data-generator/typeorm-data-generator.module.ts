import { Module } from '@nestjs/common';
import { TypeormDataGeneratorService } from './typeorm-data-generator.service';

@Module({
  providers: [TypeormDataGeneratorService],
  exports: [TypeormDataGeneratorService],
})
export class TypeormDataGeneratorModule {}
