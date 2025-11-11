import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
// import { PrismaModule } from '../../prisma/prisma.module';
import { OtpController } from './otp.controller';

@Module({
  imports: [],
  providers: [OtpService],
  exports: [OtpService],
  controllers: [OtpController],
})
export class OtpModule {}
