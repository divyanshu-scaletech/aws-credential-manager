import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AwsService } from '../aws/aws.service';
import { AwsRepository } from '../aws/aws.repository';

@Injectable()
export class CronService {
  constructor(
    private readonly awsService: AwsService,
    private readonly awsRepository: AwsRepository,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async deleteIamUser() {
    const usersData = await this.awsRepository.getUsersDataToBeDeleted();

    for (const singleUserData of usersData) {
      const accessKeyId = await this.awsService.getAccessKeyId(
        singleUserData.username,
      );
      const hasLoginProfile = singleUserData.has_login_profile;
      const policyName = singleUserData.policy_name;
      let isAccessKeyDeleted = false;
      let isLoginProfileDeleted = false;
      let isPolicyDeleted = false;

      if (accessKeyId != null) {
        await this.awsService.deleteIamAccessKey(
          singleUserData.username,
          accessKeyId,
        );
        isAccessKeyDeleted = true;
      } else if (hasLoginProfile) {
        await this.awsService.deleteLoginProfile(
          singleUserData.id,
          singleUserData.username,
        );
        isLoginProfileDeleted = true;
      }

      if (policyName != null) {
        await this.awsService.deleteIamPolicy(
          singleUserData.id,
          singleUserData.username,
          policyName,
        );
        isPolicyDeleted = true;
      }

      if (
        (policyName == null || isPolicyDeleted) &&
        (!hasLoginProfile || isLoginProfileDeleted) &&
        (accessKeyId == null || isAccessKeyDeleted)
      ) {
        await this.awsService.deleteIamUser(
          singleUserData.id,
          singleUserData.username,
        );
      }
    }
  }
}
