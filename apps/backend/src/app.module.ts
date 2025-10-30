import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { OtpModule } from './modules/otp/otp.module';
import { LoggerModule } from './common/logger/logger.module';


@Module({
  imports: [PrismaModule, AuthModule, UserModule, RoleModule, OtpModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
