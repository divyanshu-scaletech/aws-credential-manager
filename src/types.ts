import { Permissions } from './constants/enums';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

export type JwtPayload = Omit<
  User,
  'password_hash' | 'is_accepted' | 'role'
> & {
  role: Omit<Role, 'role_permissions'> & { role_permissions: Permissions[] };
} & {
  iat: number;
  exp: number;
};

export type CustomResponse<T = undefined> = {
  is_error?: boolean;
  message?: string;
  data?: T;
};

export type ReplacePropertyType<
  Obj extends object & Record<PropertyKey, unknown>,
  PropertyKey extends string,
  ReplaceWith,
> = Omit<Obj, PropertyKey> & Record<PropertyKey, ReplaceWith>;
