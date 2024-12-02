import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { IamUser } from 'src/entities/iam-user.entity';
import { DataSource } from 'typeorm';

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
    callback: () => Promise<void>,
  ): Promise<UUID> {
    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const insertResult = await transactionalEntityManager.insert(IamUser, {
          username: iam_username,
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
  async updatePolicyName(
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
}
