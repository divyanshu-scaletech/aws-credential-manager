import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload } from 'src/types';
import { Permissions } from 'src/constants/enums';

/**
 *
 * This guard will block every request by default.
 * It will allow any request if `@AllowUnauthorized()` decorator is applied.
 * It will allow users having all permission mentioned in `@PermissionNeeded()` decorator (both decorator i.e. applied on controller and on handler).
 * eg: `@PermissionNeeded('permission1', 'permission2)` will allow users having both permission: 'permission1' & 'permission2'.
 *
 * Note: if no parameter are passed in the `@PermissionNeeded()` decorator then it means "No Permission needed" for that particular method and/or controller.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const allowUnauthorized = this.reflector.get<boolean[]>(
      'allowUnauthorized',
      context.getHandler(),
    );
    const handlerPermissions = this.reflector.get<Permissions[]>(
      'permissions',
      context.getHandler(),
    );
    const controllerPermissions = this.reflector.get<Permissions[]>(
      'permissions',
      context.getClass(),
    );

    if (allowUnauthorized) return true;
    if (!handlerPermissions || !controllerPermissions) return false;
    if (!handlerPermissions.length && !controllerPermissions.length) {
      return true;
    }

    const request: Request & { user: JwtPayload } = context
      .switchToHttp()
      .getRequest();

    const rolePermissions = request.user.role.role_permissions;
    const rolePermissionsSet = new Set(rolePermissions);

    for (const permission of handlerPermissions) {
      if (!rolePermissionsSet.has(permission)) {
        return false;
      }
    }

    for (const permission of controllerPermissions) {
      if (!rolePermissionsSet.has(permission)) {
        return false;
      }
    }

    return true;
  }
}
