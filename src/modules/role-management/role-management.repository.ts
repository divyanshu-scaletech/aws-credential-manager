import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, In, QueryFailedError } from 'typeorm';
import {
  CreateRoleDetails,
  PermissionsChangeDetails,
} from './role-management.types';
import { Role } from '../../entities/role.entity';
import { RolePermissions } from '../../entities/role-permissions.entity';
import {
  PermissionAlreadyPresentError,
  RoleNotFoundError,
  RolePermissionsCombinationNotExist,
} from './role-management.custom-errors';

@Injectable()
export class RoleManagementRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * insert in `role` and `role_permissions` in transaction.
   * @param createRoleDetails
   */
  async CreateRoleWithPermissions(
    createRoleDetails: CreateRoleDetails,
  ): Promise<Pick<Role, 'id'>> {
    const { name, permissions } = createRoleDetails;
    return await this.dataSource.transaction(
      async (transactionalEntityManager: EntityManager) => {
        const roleInsertResult = await transactionalEntityManager.insert(Role, {
          name,
        });

        const roleId = roleInsertResult.identifiers[0].id;

        await transactionalEntityManager.insert(
          RolePermissions,
          permissions.map((permission) => {
            return {
              role: { id: roleId },
              permission,
            };
          }),
        );

        return roleId;
      },
    );
  }

  /**
   * gets array of roles along with there corresponding permissions
   */
  async getRolesWithPermissions(): Promise<Role[]> {
    return await this.dataSource.manager.find(Role, {
      relations: {
        role_permissions: true,
      },
      select: {
        role_permissions: {
          permission: true,
        },
      },
    });
  }

  /**
   * stores combination of `permission` and `role_id` in `role_permissions` table.
   * handles error using `handleErrorsInAddPermissionsToRole`.
   * @param addPermissionsDetails
   */
  async addPermissionsToRole(addPermissionsDetails: PermissionsChangeDetails) {
    const { permissions, role_id } = addPermissionsDetails;

    return await this.dataSource.manager
      .insert(
        RolePermissions,
        permissions.map((permission) => {
          return {
            role: { id: role_id },
            permission,
          };
        }),
      )
      .catch(this.handleErrorsInAddPermissionsToRole);
  }

  /**
   * handles any error that might occur during adding permissions to role
   * @param err
   */
  private handleErrorsInAddPermissionsToRole(err: unknown): never {
    if (err instanceof QueryFailedError) {
      if (
        err.driverError.code === '23505' &&
        err.driverError.constraint ===
          'PK_Role_Permissions_permission_id_role_id'
      ) {
        throw new PermissionAlreadyPresentError();
      } else if (
        err.driverError.code === '23503' &&
        err.driverError.constraint === 'FK_Role_Permissions_role_id'
      ) {
        throw new RoleNotFoundError();
      }
    }

    throw err;
  }

  /**
   * deletes combination of `permission` and `role_id` from `role_permissions` table.
   * handles error using `handleErrorsInRemovePermissionsFromRole`.
   * @param removePermissionsDetails
   */
  async removePermissionsFromRole(
    removePermissionsDetails: PermissionsChangeDetails,
  ) {
    const { permissions, role_id } = removePermissionsDetails;

    const deleteResult = await this.dataSource.manager.delete(RolePermissions, {
      role: { id: role_id },
      permission: In(permissions),
    });

    if (deleteResult.affected !== permissions.length) {
      throw new RolePermissionsCombinationNotExist();
    }
  }
}
