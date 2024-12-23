import { Injectable } from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import { User } from '../../entities/user.entity';
import { RegistrationDetails } from './auth.types';
import {
  RoleNotFoundError,
  UsernameTakenError,
  UserNotFoundError,
} from './auth.custom-erros';
import { UUID } from 'crypto';
import { ReplacePropertyType } from '../../types';
import { Role } from '../../entities/role.entity';
import { RolePermissions } from '../../entities/role-permissions.entity';

@Injectable()
export class AuthRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * stores user details in user table. handles errors using `handleErrorsInRegistration`.
   * @param registrationDetails
   */
  async saveUserDetails(
    registrationDetails: Omit<RegistrationDetails, 'password'> & {
      password_hash: string;
    },
  ) {
    const { password_hash, role_id, username } = registrationDetails;

    return await this.dataSource.manager
      .insert(User, {
        is_accepted: false,
        password_hash,
        role: { id: role_id },
        username,
      })
      .catch(this.handleErrorsInSavingUserDetails);
  }

  /**
   * handles errors that might occur in storing user details
   * @param err
   */
  private handleErrorsInSavingUserDetails(err: unknown): never {
    if (err instanceof QueryFailedError) {
      if (
        err.driverError.code === '23505' &&
        err.driverError.constraint === 'UQ_User_username'
      ) {
        throw new UsernameTakenError();
      }

      if (
        err.driverError.code === '23503' &&
        err.driverError.constraint === 'FK_User_role_id'
      ) {
        throw new RoleNotFoundError();
      }
    }

    throw err;
  }

  /**
   * gives user details from database of user having provided username.
   * throws if user is not found.
   * @param username
   */
  async getUserDetails(username: string): Promise<User> {
    const user = await this.dataSource.manager.findOne(User, {
      where: { username },
      relations: {
        role: {
          role_permissions: true,
        },
      },
      select: {
        role: {
          id: true,
          name: true,
          role_permissions: {
            permission: true,
          },
        },
      },
    });
    if (!user) throw new UserNotFoundError();

    return user;
  }

  /**
   * gets all user with `is_accepted` as false
   */
  async getNotAcceptedRequests(): Promise<
    ReplacePropertyType<
      User,
      'role',
      ReplacePropertyType<
        Role,
        'role_permissions',
        Omit<RolePermissions, 'role'>[]
      >
    >[]
  > {
    return await this.dataSource.manager.find(User, {
      where: { is_accepted: false },
      relations: {
        role: {
          role_permissions: true,
        },
      },
    });
  }

  /**
   * updates `User` and set `is_accepted` to be true.
   * throws if user with provided it is not found
   * @param user_ids
   */
  async approveRegistrationRequests(user_id: UUID) {
    const updateResult = await this.dataSource.manager.update(
      User,
      { id: user_id },
      { is_accepted: true },
    );

    if (updateResult.affected === 0) throw new UserNotFoundError();
  }
}
