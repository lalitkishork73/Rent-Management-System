import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto.email, dto.password);
  }

  @Post('signup')
  async signup(@Body() dto: SignupDto) {

    return await this.authService.signUp(dto.email, dto.password);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: OtpVerifyDto) {
    return await this.authService.verifyOtp(dto.email, dto.otp);
  }
}
