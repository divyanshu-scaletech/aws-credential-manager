import { Body, Controller, Post } from '@nestjs/common';
import { CreateIamCredentialsRequestDto } from './dto/request.dto';
import { JwtPayload } from 'src/types';
import { User } from 'src/decorators/user.decorator';
import { AwsService } from './aws.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsNeeded } from 'src/decorators/permissions-needed.decorator';
import { Permissions } from 'src/constants/enums';

@PermissionsNeeded()
@ApiBearerAuth()
@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  /**
   * handles the request to create temporary console credentials with help of `AwsService`.
   * @param createConsoleCredentialsPayload
   */
  @PermissionsNeeded(Permissions.ConsoleCreate)
  @Post('console/credentials')
  async createConsoleCredentials(
    @Body() createConsoleCredentialsPayload: CreateIamCredentialsRequestDto,
    @User() userInfo: JwtPayload,
  ) {
    const credentials = await this.awsService.createConsoleCredential(
      userInfo.username,
      createConsoleCredentialsPayload,
    );

    return {
      data: credentials,
    };
  }
}
