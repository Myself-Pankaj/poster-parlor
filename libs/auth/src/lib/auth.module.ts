import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AppConfigModule, AppConfigService } from '@poster-parlor-api/config';
import { User, UserSchema } from '@poster-parlor-api/models';
import { GoogleAuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (
        config: AppConfigService
      ): Promise<JwtModuleOptions> => {
        const secret = config.authConfig.jwtRefreshTokenSecret;
        const expiresIn = config.authConfig.jwtRefreshTokenExpiry;

        const normalizedExpiresIn = expiresIn;

        return {
          secret,
          signOptions: {
            expiresIn: normalizedExpiresIn,
          },
        };
      },
      inject: [AppConfigService],
    }),
  ],
  controllers: [GoogleAuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtStrategy],
})
export class AuthModule {}
