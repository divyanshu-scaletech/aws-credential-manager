import { Module } from '@nestjs/common';
import { RoleManagementController } from './role-management.controller';
import { RoleManagementService } from './role-management.service';
import { RoleManagementRepository } from './role-management.repository';

@Module({
  controllers: [RoleManagementController],
  providers: [RoleManagementService, RoleManagementRepository],
})
export class RoleManagementModule {}
