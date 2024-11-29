import { Injectable } from '@nestjs/common';
import { LoginDetails, RegistrationDetails } from './auth.types';
import { AuthRepository } from './auth.repository';
import * as bcrypt from 'bcrypt';
import {
  IncorrectPasswordError,
  UserNotAcceptedError,
} from './auth.custom-erros';
import * as jsonwebtoken from 'jsonwebtoken';
import { JwtPayload } from 'src/types';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * hashes password and pass it along with other details to `AuthRepository`.
   * @param registrationDetails
   */
  async register(registrationDetails: RegistrationDetails) {
    const { password, ...registrationDetailsWithoutPassword } =
      registrationDetails;

    const password_hash = await bcrypt.hash(password, 10);

    return await this.authRepository.saveUserDetails({
      password_hash,
      ...registrationDetailsWithoutPassword,
    });
  }

  /**
   * takes user details from `AuthRepository` and verifies the credentials.
   * throw if credentials are incorrect or user is not accepted. otherwise signs a JTW and returns it.
   * @param loginDetails
   */
  async login(loginDetails: LoginDetails): Promise<string> {
    const { password, username } = loginDetails;
    const { password_hash, is_accepted, ...userDetails } =
      await this.authRepository.getUserDetails(username);

    if (!is_accepted) throw new UserNotAcceptedError();

    const isPasswordCorrect = await bcrypt.compare(password, password_hash);
    if (!isPasswordCorrect) throw new IncorrectPasswordError();

    const jwtPayload: Partial<JwtPayload> = {
      ...userDetails,
      role: {
        ...userDetails.role,
        role_permissions: userDetails.role.role_permissions.map(
          (obj) => obj.permission,
        ),
      },
    };

    return jsonwebtoken.sign(jwtPayload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRATION_LIMIT,
    });
  }
}
