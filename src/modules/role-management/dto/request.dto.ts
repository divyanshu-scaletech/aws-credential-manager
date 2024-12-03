import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
} from 'class-validator';
import { UUID } from 'crypto';
import { Permissions } from '../../../constants/enums';

export class AddPermissionsRequestDto {
  /**
   * @example ["console.create", "console.delete"]
   */
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsArray()
  @IsEnum(Permissions, { each: true })
  permissions: Permissions[];
}

export class RoleIdDto {
  /**
   * @example 006a15b1-600d-4ba3-a70e-d4582c2bf371
   */
  @IsUUID()
  role_id: UUID;
}

export class RemovePermissionsRequestDto {
  /**
   * @example ["console.create", "console.delete"]
   */
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsArray()
  @IsEnum(Permissions, { each: true })
  permissions: Permissions[];
}

export class CreateRoleRequestDto {
  /**
   * @example Console Administrator
   */
  @IsString()
  name: string;

  /**
   * @example ["console.create", "console.delete"]
   */
  @ArrayUnique()
  @IsArray()
  @IsEnum(Permissions, { each: true })
  permissions: Permissions[];
}
