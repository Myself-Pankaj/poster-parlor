import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@poster-parlor-api/models';
import { AuthenticatedUser, RequestWithUser } from '@poster-parlor-api/shared';
import { UnauthorizedException } from '@poster-parlor-api/utils';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const Roles = (...roles: UserRole[]) => {
  if (!roles || roles.length === 0) {
    throw new Error('Roles decorator requires at least one role');
  }
  return SetMetadata(ROLES_KEY, roles);
};

export const Auth = (...roles: UserRole[]) => {
  // Validate roles if provided
  if (roles.length > 0) {
    const invalidRoles = roles.filter(
      (role) => typeof role !== 'string' || !role
    );
    if (invalidRoles.length > 0) {
      throw new Error(`Invalid roles provided: ${invalidRoles.join(', ')}`);
    }
  }

  // Authentication only
  if (roles.length === 0) {
    return applyDecorators(UseGuards(JwtAuthGuard));
  }

  // Authentication + role-based authorization
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles));
};
export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext
  ): AuthenticatedUser | string | undefined => {
    try {
      const request = ctx.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      // User should exist if route is protected
      if (!user) {
        throw new UnauthorizedException('Login required to access this route');
      }

      // Validate user object structure
      if (typeof user !== 'object' || !user.id || !user.email || !user.role) {
        throw new UnauthorizedException('Invalid user object in request');
      }

      // Return specific field if requested
      if (data) {
        const value = user[data];

        if (value === undefined || value === null) {
          throw new UnauthorizedException(`User property '${data}' not found`);
        }

        return value;
      }

      // Return entire user object
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to extract user from request');
    }
  }
);
