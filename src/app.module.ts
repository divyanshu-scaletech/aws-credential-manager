import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities';
import { AuthModule } from './modules/auth/auth.module';
import { RoleManagementModule } from './modules/role-management/role-management.module';
import * as dotenv from 'dotenv';
import { LoggingMiddleware } from './middlewares/logging.middleware';
import { AuditModule } from './modules/audit/audit.module';
import { AwsModule } from './modules/aws/aws.module';
import { CronModule } from './modules/cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';

dotenv.config();

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE,
      entities: entities,
    }),
    AuthModule,
    RoleManagementModule,
    AuditModule,
    AwsModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
