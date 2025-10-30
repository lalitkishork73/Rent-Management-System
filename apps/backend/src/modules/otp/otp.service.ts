import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BcryptUtil } from 'src/common/utils/bcrypt.util';
import { OtpUtil } from 'src/common/utils/otp.util';
import { MailUtil } from 'src/common/utils/mail.util';
import * as ejs from 'ejs';
import * as path from 'path';

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  async generateOtp(email: string) {
    const otp = OtpUtil.generateOtp();
    const hashed = await BcryptUtil.hashPassword(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await this.prisma.oTP.create({
      data: {
        email,
        code: hashed,
        expiresAt,
      },
    });

    const templatePath = path.join('public', 'templates', 'otp', 'otp.ejs');

    console.log('Template Path:', templatePath); // Debugging line

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
    const otpRecord = await this.prisma.oTP.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) throw new BadRequestException('Invalid OTP');

    if (otpRecord.expiresAt < new Date())
      throw new BadRequestException('OTP has expired');

    const isCodeValid = await BcryptUtil.comparePassword(code, otpRecord.code);
    if (!isCodeValid) throw new BadRequestException('Invalid OTP');

    await this.prisma.oTP.deleteMany({ where: { email } });

    return true;
  }
}
