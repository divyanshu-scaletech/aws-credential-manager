import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import {
  IncorrectPasswordError,
  UserNotAcceptedError,
  UserNotFoundError,
} from './auth.custom-erros';
import { UnauthorizedException } from '@nestjs/common';

const moduleMocker = new ModuleMocker(global);
const mockFactory = (token: unknown) => {
  if (typeof token === 'function') {
    const mockMetadata = moduleMocker.getMetadata(
      token,
    ) as MockFunctionMetadata<any, any>;
    const Mock = moduleMocker.generateFromMetadata(mockMetadata);
    return new Mock();
  }
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, AuthRepository],
    })
      .useMocker(mockFactory)
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Login', () => {
    it('should be defined', () => {
      expect(controller.login).toBeDefined();
    });

    it('should call login function from AuthService', () => {
      const testUsername = 'test';
      const testPassword = 'Password@1234';

      jest.spyOn(service, 'login').mockImplementation(
        () =>
          new Promise((resolve) => {
            resolve('some jwt');
          }),
      );

      controller.login({
        username: testUsername,
        password: testPassword,
      });
      expect(service.login).toHaveBeenCalled();
    });

    it('should map IncorrectPasswordError to UnauthorizedException', () => {
      const testUsername = 'test';
      const testPassword = 'Password@1234';

      jest.spyOn(service, 'login').mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            reject(new IncorrectPasswordError());
          }),
      );

      expect(
        controller.login({
          username: testUsername,
          password: testPassword,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should map UserNotFoundError to UnauthorizedException', () => {
      const testUsername = 'test';
      const testPassword = 'Password@1234';

      jest.spyOn(service, 'login').mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            reject(new UserNotFoundError());
          }),
      );

      expect(
        controller.login({
          username: testUsername,
          password: testPassword,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should map UserNotAcceptedError to UnauthorizedException', () => {
      const testUsername = 'test';
      const testPassword = 'Password@1234';

      jest.spyOn(service, 'login').mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            reject(new UserNotAcceptedError());
          }),
      );

      expect(
        controller.login({
          username: testUsername,
          password: testPassword,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
