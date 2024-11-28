import {
  Body,
  Controller,
  NotAcceptableException,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginRequestDto, RegisterRequestDto } from './dto/request.dto';
import { CustomResponse } from './types';
import { LoginResponseDto } from './dto/response.dto';
import { AuthService } from './auth.service';
import {
  IncorrectPasswordError,
  RoleNotFoundError,
  UsernameTakenError,
  UserNotAcceptedError,
  UserNotFoundError,
} from './auth.custom-erros';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * handles the request for login. verifies credentials with help of `AuthService`.
   * handles errors using `handleErrorsInLogin`.
   * @param loginPayload
   */
  @Post('login')
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
  @Post('register')
  async register(
    @Body() registerPayload: RegisterRequestDto,
  ): Promise<CustomResponse> {
    await this.authService
      .register(registerPayload)
      .catch(this.handleErrorsInRegistration);

    return {
      message: 'User Registered Successfully',
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
}
