import { SetMetadata } from '@nestjs/common';
import { Permissions } from 'src/constants/enums';

export const PermissionsNeeded = (...permissions: Permissions[]) =>
  SetMetadata('permissions', permissions);
