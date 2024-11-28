import { Injectable } from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { RegistrationDetails } from './types';
import {
  RoleNotFoundError,
  UsernameTakenError,
  UserNotFoundError,
} from './auth.custom-erros';

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
}
