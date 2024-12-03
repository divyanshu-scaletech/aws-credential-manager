import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { IamUser } from 'src/entities/iam-user.entity';
import { DataSource } from 'typeorm';
import { IamUserNotFoundError } from './aws.custom-errors';

@Injectable()
export class AwsRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * save username in database and execute provided callback in same transaction.
   * @param username
   * @param callback
   */
  async saveUsername(
    iam_username: string,
    expiration_time: Date,
    callback: () => Promise<void>,
  ): Promise<UUID> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const insertResult = await transactionalEntityManager.insert(IamUser, {
          username: iam_username,
          expiration_time,
        });

        const iamUserId = insertResult.identifiers[0].id;
        await callback();

        return iamUserId;
      },
    );
  }

  /**
   * updates `IamUser` table with provided data and execute provided callback in same transaction.
   * @param id
   * @param policy_name
   * @param callback
   */
  async updatePolicyAndExpiration(
    id: UUID,
    policy_name: string,
    callback: () => Promise<void>,
  ) {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.update(
          IamUser,
          { id },
          { policy_name },
        );
        await callback();
      },
    );
  }

  /**
   * updates `has_login_profile` to be true and executes callback in same transaction.
   * @param id
   * @param callback
   */
  async setLoginProfileFlag(id: UUID, callback: () => Promise<void>) {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.update(
          IamUser,
          { id },
          { has_login_profile: true },
        );
        await callback();
      },
    );
  }

  /**
   * filter all rows from `IamUser` and gives only those rows with data of user that should be deleted.
   */
  async getUsersDataToBeDeleted(): Promise<IamUser[]> {
    return await this.dataSource.manager
      .createQueryBuilder(IamUser, 'iam_user')
      .where('iam_user.expiration_time < NOW()')
      .getMany();
  }

  /**
   * get data of `IamUser` with provided `username`. throws if no user was found.
   * @param username
   */
  async getUserDataFromUsername(username: string): Promise<IamUser> {
    const iamUser = await this.dataSource.manager.findOneBy(IamUser, {
      username,
    });

    if (!iamUser) throw new IamUserNotFoundError();
    return iamUser;
  }

  /**
   * update `IamUser` to make `has_login_profile` false and execute the provided callback in a transaction.
   * @param id
   * @param callback
   */
  async makeLoginProfileFlagFalse(id: UUID, callback: () => Promise<void>) {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.update(
          IamUser,
          { id },
          { has_login_profile: false },
        );
        await callback();
      },
    );
  }

  /**
   * update `IamUser` to make `policy_name` null and execute the provided callback in a transaction.
   * @param id
   * @param callback
   */
  async removePolicyName(id: UUID, callback: () => Promise<void>) {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.update(
          IamUser,
          { id },
          { policy_name: null },
        );
        await callback();
      },
    );
  }

  /**
   * delete `IamUser` with provided id and execute the provided callback in a transaction.
   * @param id
   * @param callback
   */
  async deleteIamUser(id: UUID, callback: () => Promise<void>) {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.delete(IamUser, { id });
        await callback();
      },
    );
  }
}
