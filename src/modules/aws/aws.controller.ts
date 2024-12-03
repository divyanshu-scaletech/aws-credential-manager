import {
  Body,
  Controller,
  Delete,
  NotFoundException,
  Post,
} from '@nestjs/common';
import {
  CreateIamCredentialsRequestDto,
  DeleteIamUserRequestDto,
  DeleteProgrammaticCredentialsRequestDto,
} from './dto/request.dto';
import { CustomResponse, JwtPayload } from 'src/types';
import { User } from 'src/decorators/user.decorator';
import { AwsService } from './aws.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsNeeded } from 'src/decorators/permissions-needed.decorator';
import { Permissions } from 'src/constants/enums';
import { IamUserNotFoundError } from './aws.custom-errors';

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

  /**
   * handles the request to create temporary programmatic credentials with help of `AwsService`.
   * @param createConsoleCredentialsPayload
   */
  @PermissionsNeeded(Permissions.ProgrammaticCreate)
  @Post('programmatic/credentials')
  async createProgrammaticCredentials(
    @Body()
    createProgrammaticCredentialsPayload: CreateIamCredentialsRequestDto,
    @User() userInfo: JwtPayload,
  ) {
    const credentials = await this.awsService.createProgrammaticCredential(
      userInfo.username,
      createProgrammaticCredentialsPayload,
    );

    return {
      data: credentials,
    };
  }

  /**
   * handles request to delete console credentials with help of `AwsService`.
   * @param deleteConsoleCredentialsDetails
   */
  @PermissionsNeeded(Permissions.ConsoleDelete)
  @Delete('console/credentials')
  async deleteConsoleCredentials(
    @Body() deleteConsoleCredentialsDetails: DeleteIamUserRequestDto,
  ): Promise<CustomResponse> {
    await this.awsService
      .deleteConsoleCredentials(deleteConsoleCredentialsDetails.iam_username)
      .catch(this.handleCredentialsDeletionErrors);

    return {
      message: 'Console Credentials deleted successfully',
    };
  }

  /**
   * handles request to delete programmatic credentials with help of `AwsService`.
   * @param deleteProgrammaticCredentialsDetails
   */
  @PermissionsNeeded(Permissions.ProgrammaticDelete)
  @Delete('programmatic/credentials')
  async deleteProgrammaticCredentials(
    @Body()
    deleteProgrammaticCredentialsDetails: DeleteProgrammaticCredentialsRequestDto,
  ) {
    const { access_key_id, iam_username } =
      deleteProgrammaticCredentialsDetails;
    await this.awsService
      .deleteProgrammaticCredentials(iam_username, access_key_id)
      .catch(this.handleCredentialsDeletionErrors);

    return {
      message: 'Programmatic Credentials deleted successfully',
    };
  }

  /**
   * handles any errors that might occur in deleting credentials
   * @param err
   */
  private handleCredentialsDeletionErrors(err: unknown): never {
    if (err instanceof IamUserNotFoundError) {
      throw new NotFoundException(err.message);
    }

    throw err;
  }
}
