import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-role.enum';

export const RequiredRoles = (...roles: UserRole[]) =>
  SetMetadata('requiredRoles', roles);
