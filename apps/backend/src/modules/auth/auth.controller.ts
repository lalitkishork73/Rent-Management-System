import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RequestUser } from './types/request-user.type';
import { RolesGuard } from './guards/roles.guard';
import { PermissionGuard } from './guards/permissions.guard';
import { Roles } from './decorators/roles.decorator';
import { Permissions } from './decorators/permissions.decorator';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.login(dto, req, res);
  }

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return await this.authService.signUp(dto.email, dto.password);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: OtpVerifyDto) {
    return await this.authService.verifyOtp(dto.email, dto.otp);
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body('clientType') clientType: 'web' | 'mobile' = 'web',
  ) {
    return this.authService.refresh(req, res, clientType);
  }

  @Post('logout')
  async logout(
    @Body() dto: LogoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(dto, req, res);
  }

  @Post('logout-all')
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logoutAll(req, res);
  }

  @Get('google')
  async googleLogin(@Res() res: Response) {
    const url = this.authService.getGoogleAuthUrl();
    return res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('code') code: string,
  ) {
    const result = await this.authService.handleGoogleCallback(
      code,
      req,
      res,
      'web',
    );


    res.redirect(`${process.env.FRONTEND_URL}/home`)
    // return result;
  }

  @Post('google/mobile')
  async googleMobile(
    @Body() idToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.handleGoogleMobileLogin(idToken, req, res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any) {
    return user;
  }

  @Get('data')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  // @Permissions('users:read')
  async data(data: string) {
    return 'dada';
  }
}
