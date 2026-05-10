import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRole } from '../../users/enums/user-role.enum';
import { UserEntity } from '../../users/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'requiredRoles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request: Request = context.switchToHttp().getRequest();
    if (!request.user)
      throw new ForbiddenException('User not found in request context');

    const user = request.user as UserEntity;
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
