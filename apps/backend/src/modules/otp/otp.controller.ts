import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';
import { GenerateOtpDto } from './dto/generate-otp.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('generate')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async generateOtp(@Body() dto: GenerateOtpDto) {
    return this.otpService.generateOtp(dto.email);
  }
}
