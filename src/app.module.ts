import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities';
import { AuthModule } from './modules/auth/auth.module';
import { RoleManagementModule } from './modules/role-management/role-management.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: entities,
      synchronize: true,
    }),
    AuthModule,
    RoleManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
