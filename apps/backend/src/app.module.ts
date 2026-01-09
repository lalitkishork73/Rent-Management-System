import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { OtpModule } from './modules/otp/otp.module';
import { LoggerModule } from './common/logger/logger.module';
import { RedisModule } from './common/redis/redis.provider';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    RoleModule,
    OtpModule,
    LoggerModule,
    RedisModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 30,
        },
      ],
    }),
    PrometheusModule.register({
      path:'/metrics',
      defaultMetrics:{
        enabled:true
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
