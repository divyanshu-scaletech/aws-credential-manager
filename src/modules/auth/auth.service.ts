import { Injectable } from '@nestjs/common';
import { LoginDetails, RegistrationDetails } from './types';
import { AuthRepository } from './auth.repository';
import * as bcrypt from 'bcrypt';
import { IncorrectPasswordError } from './auth.custom-erros';
import * as jsonwebtoken from 'jsonwebtoken';

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
   * throw if credentials are incorrect. otherwise signs a JTW and returns it.
   * @param loginDetails
   */
  async login(loginDetails: LoginDetails): Promise<string> {
    const { password, username } = loginDetails;
    const { password_hash, ...userDetailsWithoutPasswordHash } =
      await this.authRepository.getUserDetails(username);

    const isPasswordCorrect = await bcrypt.compare(password, password_hash);
    if (!isPasswordCorrect) throw new IncorrectPasswordError();

    return jsonwebtoken.sign(
      userDetailsWithoutPasswordHash,
      process.env.JWT_SECRET,
    );
  }
}
