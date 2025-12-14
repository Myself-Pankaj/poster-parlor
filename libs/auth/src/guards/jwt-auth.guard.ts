import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      // Check if route is marked as public
      const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isPublic === true) {
        return true;
      }

      // Proceed with JWT validation
      return super.canActivate(context);
    } catch (error) {
      this.logger.error('Error in canActivate:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  override handleRequest<
    TUser extends Record<string, unknown> = Record<string, unknown>
  >(err: Error | null, user: TUser | false, info: Error | undefined): TUser {
    // Handle errors from passport
    if (err) {
      this.logger.error('Authentication error:', err);
      throw err;
    }

    // Handle missing user (authentication failed)
    if (!user) {
      // Provide specific error messages based on info
      if (info) {
        if (info.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired');
        }
        if (info.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid token');
        }
        if (info.name === 'NotBeforeError') {
          throw new UnauthorizedException('Token not yet valid');
        }

        this.logger.warn(`Authentication failed: ${info.message}`);
      }

      throw new UnauthorizedException('Login required to access this route');
    }

    // Return validated user
    return user;
  }
}
