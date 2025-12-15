import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from '@poster-parlor-api/models';
import type { Response, Request } from 'express';
import { UnauthorizedException } from '@poster-parlor-api/utils';
import { RequestUser } from '@poster-parlor-api/shared';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.googleAuthService.loginWithGoogle(
      dto.idToken,
      res
    );
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response // ✅ Add Response object
  ) {
    const token = req.cookies?.['refresh_token'];

    if (!token) {
      throw new UnauthorizedException('No refresh token is provided');
    }

    const result = await this.googleAuthService.refreshAccessToken(token, res); // ✅ Pass res

    return result;
  }
  @Get('me')
  async getCurrentUser(@Res() req: Request & { user: RequestUser }) {
    const result = req.user;
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    const result = await this.googleAuthService.logout(res);
    return result;
  }
}
