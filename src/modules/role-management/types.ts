import { UUID } from 'crypto';
import { Permissions } from 'src/constants/enums';

export type PermissionsChangeDetails = {
  role_id: UUID;
  permissions: Permissions[];
};

export type CreateRoleDetails = {
  name: string;
  permissions: Permissions[];
};
