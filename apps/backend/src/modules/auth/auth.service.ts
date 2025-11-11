import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BcryptUtil } from '../../common/utils/bcrypt.util';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from '../otp/otp.service';
import { AppLogger } from '../../common/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly logger: AppLogger,
  ) {}

  async signUp(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPasword = await BcryptUtil.hashPassword(password);
    const newUser = await this.prisma.user.create({
      data: { email, password: hashedPasword },
    });

    await this.otpService.generateOtp(email);

    this.logger.log(`New user registered: ${email}`);

    return {
      message: 'Signup successful, please verify OTP sent to your email',
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.password === null) {
      throw new UnauthorizedException('Please login using OAuth provider');
    }

    if (!user.isEmailVerified)
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );

    const isPasswordValid = await BcryptUtil.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async verifyOtp(email: string, code: string) {
    const isVerified = await this.otpService.verifyOtp(email, code);
    if (isVerified) {
      await this.prisma.user.update({
        where: { email },
        data: { isEmailVerified: true },
      });
      return { message: 'Email verified successfully' };
    } else {
      throw new BadRequestException('OTP verification failed');
    }
  }
}
