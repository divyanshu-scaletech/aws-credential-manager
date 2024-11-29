import { Injectable } from '@nestjs/common';
import { Role } from 'src/entities/role.entity';
import { PermissionsChangeDetails, CreateRoleDetails } from './role-management.types';
import { RoleManagementRepository } from './role-management.repository';

@Injectable()
export class RoleManagementService {
  constructor(
    private readonly roleManagementRepository: RoleManagementRepository,
  ) {}

  /**
   * passes details to `RoleManagementRepository` and returns what it gets.
   * @param createRoleDetails
   */
  async createRole(
    createRoleDetails: CreateRoleDetails,
  ): Promise<Pick<Role, 'id'>> {
    return await this.roleManagementRepository.CreateRoleWithPermissions(
      createRoleDetails,
    );
  }

  /**
   * takes data from `RoleManagementRepository` and returns it.
   */
  async listRoles(): Promise<Role[]> {
    return await this.roleManagementRepository.getRolesWithPermissions();
  }

  /**
   * passes details to `RoleManagementRepository` and returns the data it gets.
   * @param addPermissionsDetails
   */
  async addPermissions(addPermissionsDetails: PermissionsChangeDetails) {
    return await this.roleManagementRepository.addPermissionsToRole(
      addPermissionsDetails,
    );
  }

  /**
   * passes details to `RoleManagementRepository` and returns the data it gets.
   * @param removePermissionsDetails
   */
  async removePermissions(removePermissionsDetails: PermissionsChangeDetails) {
    return await this.roleManagementRepository.removePermissionsFromRole(
      removePermissionsDetails,
    );
  }
}
