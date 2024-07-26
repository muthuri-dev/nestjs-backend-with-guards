import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRepository } from '@app/shared';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userRepository: UserRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getClass(),
      context.getHandler(),
    ]);

    if (!roles) return true;

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    if (!user) return false;

    const dbUser = await this.userRepository.findUnique({ id: user.id });

    if (!dbUser || !dbUser.role) return false;
    return roles.includes(dbUser.role);
  }
}
