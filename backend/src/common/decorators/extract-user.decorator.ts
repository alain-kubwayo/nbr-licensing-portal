import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';
import { UserEntity } from '../../users/user.entity';

export const ExtractUserFromRequest = createParamDecorator(
  (_data, ctx: ExecutionContext): UserEntity => {
    const req: Request = ctx.switchToHttp().getRequest();
    if (!req.user) throw new Error('User not found in request context');
    return req.user as UserEntity;
  },
);
