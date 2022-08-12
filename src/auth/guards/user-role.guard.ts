import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { BadRequestException } from '@nestjs/common';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRole: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRole) return true;

    if (validRole.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new BadRequestException('User not found');

    for (const role of user.roles) {
      if (validRole.includes(role)) return true;
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${validRole}]`,
    );
  }
}
