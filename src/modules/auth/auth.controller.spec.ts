import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import {
  IncorrectPasswordError,
  RoleNotFoundError,
  UsernameTakenError,
  UserNotAcceptedError,
  UserNotFoundError,
} from './auth.custom-erros';
import {
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Permissions } from '../../constants/enums';
import { NotAcceptedUserResponseDto } from './dto/response.dto';

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

  describe('login', () => {
    it('should be defined', () => {
      expect(controller.login).toBeDefined();
    });

    it('should call login function from AuthService', async () => {
      const testUsername = 'test';
      const testPassword = 'Password@1234';

      jest.spyOn(service, 'login').mockImplementation(
        () =>
          new Promise((resolve) => {
            resolve('some jwt');
          }),
      );

      await controller.login({
        username: testUsername,
        password: testPassword,
      });
      expect(service.login).toHaveBeenCalled();
    });

    it('should map IncorrectPasswordError to UnauthorizedException', async () => {
      const testUsername = 'test';
      const testPassword = 'Password@1234';

      jest.spyOn(service, 'login').mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            reject(new IncorrectPasswordError());
          }),
      );

      await expect(
        controller.login({
          username: testUsername,
          password: testPassword,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should map UserNotFoundError to UnauthorizedException', async () => {
      const testUsername = 'test';
      const testPassword = 'Password@1234';

      jest.spyOn(service, 'login').mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            reject(new UserNotFoundError());
          }),
      );

      await expect(
        controller.login({
          username: testUsername,
          password: testPassword,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should map UserNotAcceptedError to UnauthorizedException', async () => {
      const testUsername = 'test';
      const testPassword = 'Password@1234';

      jest.spyOn(service, 'login').mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            reject(new UserNotAcceptedError());
          }),
      );

      await expect(
        controller.login({
          username: testUsername,
          password: testPassword,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should be defined', () => {
      expect(controller.login).toBeDefined();
    });

    it('should call register function from AuthService', async () => {
      jest.spyOn(service, 'register').mockImplementation(
        () =>
          new Promise((resolve) => {
            resolve();
          }),
      );

      await controller.register({
        username: 'test',
        password: 'test',
        role_id: 'ee574441-e931-4335-8e73-784026c472b9',
      });
      expect(service.register).toHaveBeenCalled();
    });

    it('should map UsernameTakenError to NotAcceptableException', async () => {
      jest.spyOn(service, 'register').mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            reject(new UsernameTakenError());
          }),
      );

      await expect(
        controller.register({
          username: 'test',
          password: 'test',
          role_id: 'ee574441-e931-4335-8e73-784026c472b9',
        }),
      ).rejects.toThrow(NotAcceptableException);
    });

    it('should map RoleNotFoundError to NotFoundException', async () => {
      jest.spyOn(service, 'register').mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            reject(new RoleNotFoundError());
          }),
      );

      await expect(
        controller.register({
          username: 'test',
          password: 'test',
          role_id: 'ee574441-e931-4335-8e73-784026c472b9',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRegistrationRequests', () => {
    it('should be defined', () => {
      expect(controller.getRegistrationRequests).toBeDefined();
    });

    it('should call getRegistrationRequests function from AuthService', async () => {
      jest.spyOn(service, 'getRegistrationRequests').mockImplementation(
        () =>
          new Promise((resolve) => {
            resolve([
              {
                id: 'de4f93f2-996f-4c02-a83b-acc0f236035c',
                username: 'steve12345',
                password_hash:
                  '$2b$10$/5n5IGQd1m3bwEVxB962b.3y.Kpb5okvf3pYmWURj8qJkaWiuUDy.',
                is_accepted: false,
                role: {
                  id: '7b05dae6-3d2e-4e6c-a348-29d80bf43a6d',
                  name: 'console-all',
                  role_permissions: [],
                },
              },
            ]);
          }),
      );

      await controller.getRegistrationRequests();
      expect(service.getRegistrationRequests).toHaveBeenCalled();
    });

    it('should return array of instances of NotAcceptedUserResponseDto', async () => {
      jest.spyOn(service, 'getRegistrationRequests').mockImplementation(
        () =>
          new Promise((resolve) =>
            resolve([
              {
                id: 'ee574441-e931-4335-8e73-784026c472b9',
                is_accepted: true,
                username: 'test',
                password_hash: 'test',
                role: {
                  id: 'ee574441-e931-4335-8e73-784026c472b9',
                  name: 'test',
                  role_permissions: [
                    {
                      permission: Permissions.ConsoleCreate,
                      role_id: 'ee574441-e931-4335-8e73-784026c472b9',
                    },
                  ],
                },
              },
            ]),
          ),
      );

      const { data } = await controller.getRegistrationRequests();
      data.forEach((val) =>
        expect(val).toBeInstanceOf(NotAcceptedUserResponseDto),
      );
    });
  });

  describe('approveRegistrationRequest', () => {
    it('should be defined', () => {
      expect(controller.approveRegistrationRequest).toBeDefined();
    });

    it('should call approveRegistrationRequests function from AuthService', async () => {
      jest.spyOn(service, 'approveRegistrationRequests').mockImplementation(
        () =>
          new Promise((resolve) => {
            resolve();
          }),
      );

      await controller.approveRegistrationRequest({
        user_id: 'ee574441-e931-4335-8e73-784026c472b9',
      });
      expect(service.approveRegistrationRequests).toHaveBeenCalled();
    });

    it('should map UserNotFoundError to NotFoundException', async () => {
      jest.spyOn(service, 'approveRegistrationRequests').mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            reject(new UserNotFoundError());
          }),
      );

      await expect(
        controller.approveRegistrationRequest({
          user_id: 'ee574441-e931-4335-8e73-784026c472b9',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
