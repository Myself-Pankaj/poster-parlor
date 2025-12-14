import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '@poster-parlor-api/shared';
import { UserRole } from '@poster-parlor-api/models';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      // Get required roles from metadata
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
        'roles',
        [context.getHandler(), context.getClass()]
      );

      // If no roles required, allow access
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      // Validate requiredRoles is an array
      if (!Array.isArray(requiredRoles)) {
        throw new ForbiddenException('Invalid role configuration');
      }

      // Get request and user
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      // User must be authenticated (should be handled by JwtAuthGuard)
      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }

      // Validate user object structure
      if (!user.role || typeof user.role !== 'string') {
        throw new ForbiddenException('Invalid user role');
      }

      // Check if user has required role
      const hasRole = requiredRoles.some((role) => role === user.role);

      if (!hasRole) {
        throw new ForbiddenException(
          `Access denied. Required role(s): ${requiredRoles.join(' or ')}`
        );
      }

      return true;
    } catch (error) {
      // Re-throw ForbiddenExceptions
      if (error instanceof ForbiddenException) {
        throw error;
      }

      throw new ForbiddenException('Role validation failed');
    }
  }
}
