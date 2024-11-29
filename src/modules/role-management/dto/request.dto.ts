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
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsArray()
  @IsEnum(Permissions, { each: true })
  permissions: Permissions[];
}

export class RoleIdDto {
  @IsUUID()
  role_id: UUID;
}

export class RemovePermissionsRequestDto {
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsArray()
  @IsEnum(Permissions, { each: true })
  permissions: Permissions[];
}

export class CreateRoleRequestDto {
  @IsString()
  name: string;

  @ArrayUnique()
  @IsArray()
  @IsEnum(Permissions, { each: true })
  permissions: Permissions[];
}
