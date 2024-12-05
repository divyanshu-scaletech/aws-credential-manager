import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotAcceptableException,
  NotFoundException,
  Param,
  Post,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApproveRegistrationRequestDto,
  LoginRequestDto,
  RegisterRequestDto,
} from './dto/request.dto';
import {
  LoginResponseDto,
  NotAcceptedUserResponseDto,
} from './dto/response.dto';
import { AuthService } from './auth.service';
import {
  IncorrectPasswordError,
  RoleNotFoundError,
  UsernameTakenError,
  UserNotAcceptedError,
  UserNotFoundError,
} from './auth.custom-erros';
import { AllowUnauthorized } from '../../decorators/allow-unauthorized.decorator';
import { CustomResponse } from '../../types';
import { PermissionsNeeded } from '../../decorators/permissions-needed.decorator';
import { Permissions } from '../../constants/enums';
import { ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

@PermissionsNeeded()
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * handles the request for login. verifies credentials with help of `AuthService`.
   * handles errors using `handleErrorsInLogin`.
   * @param loginPayload
   */
  @AllowUnauthorized()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginPayload: LoginRequestDto,
  ): Promise<CustomResponse<LoginResponseDto>> {
    const jwt = await this.authService
      .login(loginPayload)
      .catch(this.handleErrorsInLogin);

    return {
      data: { jwt },
      message: 'Login Successful',
    };
  }

  /**
   * handles errors that might occur during login
   * @param err
   */
  private handleErrorsInLogin(err: unknown): never {
    if (
      err instanceof IncorrectPasswordError ||
      err instanceof UserNotFoundError ||
      err instanceof UserNotAcceptedError
    ) {
      throw new UnauthorizedException();
    }

    throw err;
  }

  /**
   * handles the request for registration. register user with help of `AuthService`.
   * handles errors using `handleErrorsInRegistration`
   * @param registerPayload
   */
  @AllowUnauthorized()
  @Post('register')
  async register(
    @Body() registerPayload: RegisterRequestDto,
  ): Promise<CustomResponse> {
    await this.authService
      .register(registerPayload)
      .catch(this.handleErrorsInRegistration);

    return {
      message: 'Registration request sent successfully',
    };
  }

  /**
   * handles errors that might occur during registration
   * @param err
   */
  private handleErrorsInRegistration(err: unknown): never {
    if (err instanceof UsernameTakenError) {
      throw new NotAcceptableException(err.message);
    } else if (err instanceof RoleNotFoundError) {
      throw new NotFoundException(err.message);
    }

    throw err;
  }

  /**
   * list all the request for new registration
   */
  @PermissionsNeeded(Permissions.Admin)
  @Get('registration-requests')
  async getRegistrationRequests() {
    const data = plainToInstance(
      NotAcceptedUserResponseDto,
      await this.authService.getRegistrationRequests(),
    );

    return {
      data,
    };
  }

  /**
   * handles request to accept registration requests
   * @param approveRegistrationRequestPayload
   */
  @PermissionsNeeded(Permissions.Admin)
  @Put(':user_id/approve-registration-request')
  async approveRegistrationRequest(
    @Param() approveRegistrationRequestPayload: ApproveRegistrationRequestDto,
  ): Promise<CustomResponse> {
    const { user_id } = approveRegistrationRequestPayload;
    await this.authService
      .approveRegistrationRequests(user_id)
      .catch(this.handleErrorsInApproveRegistration);

    return {
      message: 'Permission Accepted',
    };
  }

  /**
   * handles errors that might occur during approving registration request.
   * @param err
   */
  private handleErrorsInApproveRegistration(err: unknown): never {
    if (err instanceof UserNotFoundError) {
      throw new NotFoundException(err.message);
    }

    throw err;
  }
}
