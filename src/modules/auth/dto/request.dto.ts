import { IsString, IsStrongPassword, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class LoginRequestDto {
  /**
   * @example steve1234
   */
  @IsString()
  username: string;

  /**
   * @example Password@1234
   */
  @IsStrongPassword()
  password: string;
}

export class RegisterRequestDto {
  /**
   * @example steve1234
   */
  @IsString()
  username: string;

  /**
   * @example Password@1234
   */
  @IsStrongPassword()
  password: string;

  /**
   * id of a role that will be assigned to this user
   * @example af77bf4a-bf05-4d82-8887-a8bfb78f87d3
   */
  @IsUUID()
  role_id: UUID;
}

export class ApproveRegistrationRequestDto {
  /**
   * @example af77bf4a-bf05-4d82-8887-a8bfb78f87d3
   */
  @IsUUID('all')
  user_id: UUID;
}
