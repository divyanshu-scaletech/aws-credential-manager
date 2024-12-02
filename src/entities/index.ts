import { IamUser } from './iam-user.entity';
import { RequestResponseHistory } from './request-history.entity';
import { RolePermissions } from './role-permissions.entity';
import { Role } from './role.entity';
import { User } from './user.entity';

export const entities = [
  Role,
  User,
  RequestResponseHistory,
  RolePermissions,
  IamUser,
];
