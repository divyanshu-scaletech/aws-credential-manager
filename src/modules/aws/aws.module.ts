import { Module } from '@nestjs/common';
import { AwsController } from './aws.controller';
import { AwsService } from './aws.service';
import { AwsRepository } from './aws.repository';

@Module({
  controllers: [AwsController],
  providers: [AwsService, AwsRepository],
})
export class AwsModule {}
