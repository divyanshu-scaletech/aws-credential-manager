import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { AwsService } from '../aws/aws.service';
import { AwsRepository } from '../aws/aws.repository';

@Module({
  imports: [],
  providers: [CronService, AwsService, AwsRepository],
})
export class CronModule {}
