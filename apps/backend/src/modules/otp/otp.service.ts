import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BcryptUtil } from '../../common/utils/bcrypt.util';
import { OtpUtil } from '../../common/utils/otp.util';
import { MailUtil } from '../../common/utils/mail.util';
import * as ejs from 'ejs';
import * as path from 'node:path';
import Redis from 'ioredis';

@Injectable()
export class OtpService {
  private readonly otpExpiresSeconds = Number(process.env.OTP_EXPIRES_SECONDS) || 300;
  private readonly rateLimit = Number(process.env.OTP_RATE_LIMIT) || 5;
  private readonly rateWindow = Number(process.env.OTP_RATE_WINDOW) || 3600;

  constructor(
    @Inject('REDIS') private readonly redisClint: Redis,
    private readonly prisma: PrismaService,
  ) {}

  private readonly otpKey = (email: string) => `otp:${email.toLowerCase()}`;
  private readonly rateKey = (email: string) => `otp:rate:${email.toLowerCase()}`;

  async generateOtp(email: string) {
    const rateKey = this.rateKey(email);
    const currentRate = await this.redisClint.incr(rateKey);
    if (currentRate === 1) {
      await this.redisClint.expire(rateKey, this.rateWindow);
    }

    if (currentRate > this.rateLimit) {
      throw new BadRequestException(
        'Too many OTP requests. Please try again later.',
      );
    }

    const otp = OtpUtil.generateOtp();
    const hashed = await BcryptUtil.hashPassword(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const key = this.otpKey(email);
    await this.redisClint.set(key, hashed, 'EX', this.otpExpiresSeconds);

    // await this.prisma.oTP.create({
    //   data: {
    //     email,
    //     code: hashed,
    //     expiresAt,
    //   },rateLimit
    // });

    const templatePath = path.join('public', 'templates', 'otp', 'otp.ejs');

    const html = await ejs.renderFile(templatePath, {
      name: email,
      otp,
      expiry: '10 minutes',
      appName: 'Rent Management System',
    });

    await MailUtil.sendMail(email, 'Your OTP Code', html);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(email: string, code: string) {
    const key = this.otpKey(email);
    const storedHash = await this.redisClint.get(key);
    if (!storedHash) {
      throw new BadRequestException('OTP has expired or is invalid');
    }

    const isValid = await BcryptUtil.comparePassword(code, storedHash);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.redisClint.del(key);

    // const otpRecord = await this.prisma.oTP.findFirst({
    //   where: { email },
    //   orderBy: { createdAt: 'desc' },
    // });

    // if (!otpRecord) throw new BadRequestException('Invalid OTP');

    // if (otpRecord.expiresAt < new Date())
    //   throw new BadRequestException('OTP has expired');

    // const isCodeValid = await BcryptUtil.comparePassword(code, otpRecord.code);
    // if (!isCodeValid) throw new BadRequestException('Invalid OTP');

    // await this.prisma.oTP.deleteMany({ where: { email } });

    return true;
  }

  async revokeOtp(email: string) {
    await this.redisClint.del(this.otpKey(email));
    await this.redisClint.del(this.rateKey(email));
  }
}
