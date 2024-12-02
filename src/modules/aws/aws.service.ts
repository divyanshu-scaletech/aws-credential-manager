import { Injectable } from '@nestjs/common';
import { AwsRepository } from './aws.repository';
import { CreateIamCredentialsDetails } from './aws.types';
import {
  CreateLoginProfileCommand,
  CreateUserCommand,
  IAMClient,
  PutUserPolicyCommand,
} from '@aws-sdk/client-iam';
import { randomUUID } from 'crypto';
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
   * generate a random username and password. and creates AWS iam user, login profile and gives permissions.
   * also calls methods from `AwsRepository` to store data for cron job and also passes callbacks that needs to be executed in transaction.
   * @param createConsoleCredentialsDetails
   */
  async createConsoleCredential(
    username: string,
    createConsoleCredentialsDetails: CreateIamCredentialsDetails,
  ) {
    const randomIamUsername = this.generateRandomIamUsername(username);

    const createIamUser = async () => {
      const command = new CreateUserCommand({
        UserName: randomIamUsername,
      });

      await this.iamClient.send(command);
    };
    const iamUserId = await this.awsRepository.saveUsername(
      randomIamUsername,
      createIamUser,
    );

    const policyJson = this.createPolicyJson(createConsoleCredentialsDetails);
    const policyName = `${randomIamUsername}_policy`;
    const attachInlinePolicy = async () => {
      const command = new PutUserPolicyCommand({
        UserName: randomIamUsername,
        PolicyName: policyName,
        PolicyDocument: policyJson,
      });

      await this.iamClient.send(command);
    };
    await this.awsRepository.updatePolicyName(
      iamUserId,
      policyName,
      attachInlinePolicy,
    );

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
   * generates AWS policy json with provided details.
   * throws if any IAM related actions are provided.
   * @param details
   */
  private createPolicyJson(details: CreateIamCredentialsDetails): string {
    const { actions, resources, duration_in_milliseconds } = details;

    for (const action of actions) {
      if (action.toLocaleLowerCase().startsWith('iam:')) {
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
            'aws:TokenIssueTime': new Date(
              Date.now() + duration_in_milliseconds,
            ).toISOString(),
          },
        },
      },
    };

    return JSON.stringify(policyObj, null, 2);
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
