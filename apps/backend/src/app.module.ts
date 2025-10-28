import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { OtpModule } from './otp/otp.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, RoleModule, OtpModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
