import {
  Body,
  Controller,
  Delete,
  Get,
  NotAcceptableException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CustomResponse } from '../auth/types';
import {
  AddPermissionsRequestDto,
  CreateRoleRequestDto,
  RemovePermissionsRequestDto,
  RoleIdDto,
} from './dto/request.dto';
import { RoleManagementService } from './role-management.service';
import { Role } from 'src/entities/role.entity';
import {
  PermissionAlreadyPresentError,
  RoleNotFoundError,
  RolePermissionsCombinationNotExist,
} from './role-management.custom-errors';

@Controller('role-management')
export class RoleManagementController {
  constructor(private readonly roleManagementService: RoleManagementService) {}

  /**
   * handles request to create role along with its permissions with help of `RoleManagementService`.
   * @param createRolePayload
   */
  @Post('roles')
  async createRole(
    @Body() createRolePayload: CreateRoleRequestDto,
  ): Promise<CustomResponse<Pick<Role, 'id'>>> {
    const role_id =
      await this.roleManagementService.createRole(createRolePayload);

    return {
      data: role_id,
      message: 'Role Created Successfully',
    };
  }

  /**
   * handles the request to list all the available roles along with its permissions with help of `RoleManagementService`.
   */
  @Get('roles')
  async listRoles(): Promise<CustomResponse<Role[]>> {
    const roles = await this.roleManagementService.listRoles();

    return {
      data: roles,
    };
  }

  /**
   * handles request to add permissions to role with provided id with help of `RoleManagementService`.
   * handle errors using `handleErrorsInAddPermissions`.
   * @param role_id
   * @param addPermissionsPayload
   */
  @Post(':role_id/permissions')
  async addPermissions(
    @Param() roleIdDetails: RoleIdDto,
    @Body() addPermissionsPayload: AddPermissionsRequestDto,
  ): Promise<CustomResponse> {
    await this.roleManagementService
      .addPermissions({
        role_id: roleIdDetails.role_id,
        permissions: addPermissionsPayload.permissions,
      })
      .catch(this.handleErrorsInAddPermissions);

    return {
      message: 'Permissions Added Successfully',
    };
  }

  /**
   * handles errors that might occur in `addPermissions`.
   * @param err
   */
  private handleErrorsInAddPermissions(err: unknown): never {
    if (err instanceof PermissionAlreadyPresentError) {
      throw new NotAcceptableException(err.message);
    } else if (err instanceof RoleNotFoundError) {
      throw new NotFoundException(err.message);
    }

    throw err;
  }

  /**
   * handles request to remove permissions from role with provided id with help of `RoleManagementService`.
   * handle errors using `handleErrorsInRemovePermissions`.
   * @param role_id
   * @param removePermissionsPayload
   */
  @Delete(':role_id/permissions')
  async removePermissions(
    @Param() roleIdDetails: RoleIdDto,
    @Body() removePermissionsPayload: RemovePermissionsRequestDto,
  ): Promise<CustomResponse> {
    await this.roleManagementService
      .removePermissions({
        role_id: roleIdDetails.role_id,
        permissions: removePermissionsPayload.permissions,
      })
      .catch(this.handleErrorsInRemovePermissions);

    return {
      message: 'Permissions Removed Successfully',
    };
  }

  /**
   * handles errors that might occur in `removePermissions`.
   * @param err
   */
  private handleErrorsInRemovePermissions(err: unknown): never {
    if (err instanceof RolePermissionsCombinationNotExist) {
      throw new NotAcceptableException(err.message);
    }

    throw err;
  }
}
