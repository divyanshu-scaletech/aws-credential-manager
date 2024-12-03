import { Injectable } from '@nestjs/common';
import { AwsRepository } from './aws.repository';
import { CreateIamCredentialsDetails } from './aws.types';
import {
  CreateAccessKeyCommand,
  CreateLoginProfileCommand,
  CreateUserCommand,
  DeleteAccessKeyCommand,
  DeleteLoginProfileCommand,
  DeleteUserCommand,
  DeleteUserPolicyCommand,
  IAMClient,
  ListAccessKeysCommand,
  PutUserPolicyCommand,
} from '@aws-sdk/client-iam';
import { randomUUID, UUID } from 'crypto';
import { CannotAssignActionError } from './aws.custom-errors';

@Injectable()
export class AwsService {
  iamClient: IAMClient;
  constructor(private readonly awsRepository: AwsRepository) {
    this.iamClient = new IAMClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  /**
   * returns access key id of given user, if no id is present then returns null.
   * @param iam_username
   * @returns
   */
  async getAccessKeyId(iam_username: string) {
    const command = new ListAccessKeysCommand({ UserName: iam_username });
    const accessKeys = await this.iamClient.send(command);

    if (accessKeys.AccessKeyMetadata?.length) {
      return accessKeys.AccessKeyMetadata[0].AccessKeyId;
    }
    return null;
  }

  /**
   * generate a random username and password. and creates AWS iam user, login profile and gives permissions.
   * also calls methods from `AwsRepository` to store data for cron job and also passes callbacks that needs to be executed in transaction.
   * @param createConsoleCredentialsDetails
   */
  async createConsoleCredential(
    username: string,
    createConsoleCredentialsDetails: CreateIamCredentialsDetails,
  ) {
    const { duration_in_milliseconds, actions, resources } =
      createConsoleCredentialsDetails;
    const randomIamUsername = this.generateRandomIamUsername(username);
    const expirationTime = new Date(Date.now() + duration_in_milliseconds);

    const iamUserId = await this.createIamUserAndAttachPolicy({
      actions,
      expiration_time: expirationTime,
      iam_username: randomIamUsername,
      resources,
    });

    const randomIamPassword = this.createRandomPassword();
    const createLoginProfile = async () => {
      const command = new CreateLoginProfileCommand({
        UserName: randomIamUsername,
        Password: randomIamPassword,
      });

      await this.iamClient.send(command);
    };
    await this.awsRepository.setLoginProfileFlag(iamUserId, createLoginProfile);

    return {
      iam_username: randomIamUsername,
      iam_password: randomIamPassword,
    };
  }

  /**
   * generate a random `username` and pair of `access_key_id` and `secret_access_key`. and creates AWS iam user, gives permissions to it and generates access keys.
   * also calls methods from `AwsRepository` to store data for cron job and also passes callbacks that needs to be executed in transaction.
   * @param createConsoleCredentialsDetails
   */
  async createProgrammaticCredential(
    username: string,
    createProgrammaticCredentialsDetails: CreateIamCredentialsDetails,
  ) {
    const { duration_in_milliseconds, actions, resources } =
      createProgrammaticCredentialsDetails;
    const randomIamUsername = this.generateRandomIamUsername(username);
    const expirationTime = new Date(Date.now() + duration_in_milliseconds);

    await this.createIamUserAndAttachPolicy({
      actions,
      expiration_time: expirationTime,
      iam_username: randomIamUsername,
      resources,
    });

    const command = new CreateAccessKeyCommand({
      UserName: randomIamUsername,
    });

    const accessKeyResponse = await this.iamClient.send(command);
    return {
      username: randomIamUsername,
      access_key_id: accessKeyResponse.AccessKey?.AccessKeyId,
      secret_access_key: accessKeyResponse.AccessKey?.SecretAccessKey,
    };
  }

  /**
   * creates a IAM user and attaches a inline policy according to provided details.
   * @param details
   * @returns
   */
  private async createIamUserAndAttachPolicy(
    details: Omit<CreateIamCredentialsDetails, 'duration_in_milliseconds'> & {
      expiration_time: Date;
      iam_username: string;
    },
  ) {
    const { iam_username, expiration_time, actions, resources } = details;

    const createIamUser = async () => {
      const command = new CreateUserCommand({
        UserName: iam_username,
      });

      await this.iamClient.send(command);
    };
    const iamUserId = await this.awsRepository.saveUsername(
      iam_username,
      expiration_time,
      createIamUser,
    );

    const policyJson = this.createPolicyJson({
      resources,
      actions,
      expiration_time,
    });
    const policyName = `${iam_username}_policy`;

    const attachInlinePolicy = async () => {
      const command = new PutUserPolicyCommand({
        UserName: iam_username,
        PolicyName: policyName,
        PolicyDocument: policyJson,
      });

      await this.iamClient.send(command);
    };
    await this.awsRepository.updatePolicyAndExpiration(
      iamUserId,
      policyName,
      attachInlinePolicy,
    );

    return iamUserId;
  }

  /**
   * generates AWS policy json with provided details.
   * throws if any IAM related actions are provided.
   * @param details
   */
  private createPolicyJson(
    details: Omit<CreateIamCredentialsDetails, 'duration_in_milliseconds'> & {
      expiration_time: Date;
    },
  ): string {
    const { actions, resources, expiration_time } = details;

    for (const action of actions) {
      if (
        action.toLocaleLowerCase().startsWith('iam:') ||
        action.startsWith('*')
      ) {
        throw new CannotAssignActionError();
      }
    }

    const policyObj = {
      Version: '2012-10-17',
      Statement: {
        Effect: 'Allow',
        Action: actions,
        Resource: resources,
        Condition: {
          DateGreaterThanEquals: {
            'aws:TokenIssueTime': expiration_time,
          },
        },
      },
    };

    return JSON.stringify(policyObj, null, 2);
  }

  /**
   * deletes Iam login profile.
   * @param iamUserId
   * @param username
   */
  async deleteLoginProfile(iamUserId: UUID, username: string) {
    const deleteIamLoginProfile = async () => {
      const command = new DeleteLoginProfileCommand({
        UserName: username,
      });

      await this.iamClient.send(command);
    };
    await this.awsRepository.makeLoginProfileFlagFalse(
      iamUserId,
      deleteIamLoginProfile,
    );
  }

  /**
   * deletes iam access key
   * @param username
   * @param accessKeyId
   */
  async deleteIamAccessKey(username: string, accessKeyId: string) {
    const command = new DeleteAccessKeyCommand({
      AccessKeyId: accessKeyId,
      UserName: username,
    });

    await this.iamClient.send(command);
  }

  /**
   * deletes iam policy of user with provided details.
   * @param iamUserId
   * @param username
   * @param policyName
   */
  async deleteIamPolicy(iamUserId: UUID, username: string, policyName: string) {
    const deleteIamUserPolicy = async () => {
      const command = new DeleteUserPolicyCommand({
        UserName: username,
        PolicyName: policyName,
      });

      await this.iamClient.send(command);
    };
    await this.awsRepository.removePolicyName(iamUserId, deleteIamUserPolicy);
  }

  /**
   * deletes Iam user.
   * @param iamUserId
   * @param username
   */
  async deleteIamUser(iamUserId: UUID, username: string) {
    const deleteIamUser = async () => {
      const command = new DeleteUserCommand({
        UserName: username,
      });

      await this.iamClient.send(command);
    };
    await this.awsRepository.deleteIamUser(iamUserId, deleteIamUser);
  }

  /**
   * deletes Iam user along with policy and access keys.
   * @param username
   * @param accessKeyId
   */
  async deleteProgrammaticCredentials(username: string, accessKeyId: string) {
    const userData = await this.awsRepository.getUserDataFromUsername(username);
    const policyName = userData.policy_name;

    await this.deleteIamAccessKey(username, accessKeyId);
    if (policyName != null) {
      await this.deleteIamPolicy(userData.id, userData.username, policyName);
    }
    await this.deleteIamUser(userData.id, userData.username);
  }

  /**
   * deletes Iam user along with policy and login profile.
   * @param username
   */
  async deleteConsoleCredentials(username: string) {
    const userData = await this.awsRepository.getUserDataFromUsername(username);
    const policyName = userData.policy_name;

    await this.deleteLoginProfile(userData.id, username);
    if (policyName != null) {
      await this.deleteIamPolicy(userData.id, userData.username, policyName);
    }
    await this.deleteIamUser(userData.id, userData.username);
  }

  /**
   * generates a unique random iam username for given user
   * @param username
   */
  private generateRandomIamUsername(username: string): string {
    return `${username}-${Date.now()}`;
  }

  /**
   * creates random password
   */
  private createRandomPassword(): string {
    return randomUUID();
  }
}
