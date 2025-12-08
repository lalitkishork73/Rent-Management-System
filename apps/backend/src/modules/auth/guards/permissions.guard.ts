import { permission } from 'process';
import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ForbiddenException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { PERMISSION_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!requiredPermission || requiredPermission.length === 0) return true;

    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.permissions) throw new ForbiddenException('No permission found');

    const hasPermission = requiredPermission.some((permission) =>
      user.permissions.includes(permission),
    );

    if (!hasPermission)
      throw new ForbiddenException('Access Denied (missing Permission');

    return true;
  }
}
