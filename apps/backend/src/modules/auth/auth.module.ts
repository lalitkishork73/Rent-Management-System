import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { LoggerModule } from '../../common/logger/logger.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtpModule } from '../otp/otp.module';
import { SessionService } from './session.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionGuard } from './guards/permissions.guard';
import { Authorization } from './authorization.service';
import { GoogleOAuthService } from './google.service';
@Module({
  imports: [
    OtpModule,
    PrismaModule,
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'default_secret',
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [
    AuthService,
    SessionService,
    JwtAuthGuard,
    Authorization,
    RolesGuard,
    PermissionGuard,
    GoogleOAuthService
  ],
  controllers: [AuthController],
  exports: [AuthService, SessionService, JwtAuthGuard,RolesGuard,PermissionGuard],
})
export class AuthModule {}
