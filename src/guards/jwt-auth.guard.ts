import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

/**
 * verifies jwt and attaches user to request.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const allowUnauthorized = this.reflector.get<string>(
      'allowUnauthorized',
      context.getHandler(),
    );
    if (allowUnauthorized) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.getTokenFromHeader(request);
    const user = jwt.verify(token, process.env.JWT_SECRET!);

    if (user) {
      request.user = user;
      return true;
    }

    return false;
  }

  getTokenFromHeader(request: Request) {
    const token = request.headers['authorization'];
    if (token?.startsWith('Bearer ')) {
      return token.slice(7);
    }

    throw new UnauthorizedException();
  }
}
