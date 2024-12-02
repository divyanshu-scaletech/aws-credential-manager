import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/types';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: Request & {
      user: JwtPayload;
    } = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
