import { OmitType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { User } from 'src/entities/user.entity';

export class LoginResponseDto {
  jwt: string;
}

export class NotAcceptedUserResponseDto extends OmitType(User, [
  'password_hash',
  'is_accepted',
]) {
  @Exclude()
  password_hash: string;

  @Exclude()
  is_accepted: boolean;
}
