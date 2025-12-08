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
import { SessionService } from './session.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { Request, Response } from 'express';
import { Authorization } from './authorization.service';
import { GoogleOAuthService } from './google.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly logger: AppLogger,
    private readonly session: SessionService,
    private readonly authorizationService: Authorization,
    private readonly googleOAuthService: GoogleOAuthService,
  ) {}

  private async getRoleId(roleName: string): Promise<string> {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role "${roleName}" not found`);
    }

    return role.id;
  }

  private async issueTokensForUser(
    user: any,
    clientType: 'web' | 'mobile' | undefined,
    req: Request,
    res: Response,
  ) {
    const rbac = await this.authorizationService.getUserRBAC(user.id);

    const payload = {
      sub: user.id,
      email: user.email,
      rbac: rbac.roles,
      permission: rbac.permissions,
    };

    const accessToken = this.jwtService.sign(payload);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { session, refreshToken } = await this.session.createSession(user, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      device: clientType === 'mobile' ? 'mobile' : 'web',
      expiresAt,
    });

    if (clientType === 'web') {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        sameSite: 'strict',
        path: '/api/v1/auth/refresh', // match your real route
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return { accessToken };
    }

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
    };
  }

  getGoogleAuthUrl() {
    return this.googleOAuthService.getAuthUrl();
  }

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

    const userRoleId = await this.getRoleId('USER');

    await this.prisma.userRole.create({
      data: {
        userId: newUser.id,
        roleId: userRoleId,
      },
    });

    await this.otpService.generateOtp(email);

    this.logger.log(`New user registered: ${email}`);

    return {
      message: 'Signup successful, please verify OTP sent to your email',
    };
  }

  async handleGoogleCallback(
    code: string,
    req: Request,
    res: Response,
    clientType: 'web' | 'mobile' = 'web',
  ) {
    const { googleId, email, name, tokens } =
      await this.googleOAuthService.getUserFromCode(code);

    // 1️⃣ Try find OAuthAccount
    let oauthAccount: any = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider: 'google',
          providerId: googleId,
        },
      },
      include: { user: true },
    });

    let user: any;

    if (oauthAccount?.user) {
      user = oauthAccount.user;
    } else {
      // 2️⃣ If no OAuthAccount, try find existing user by email
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        user = existingUser;
      } else {
        // 3️⃣ Auto-create user with USER role
        user = await this.prisma.user.create({
          data: {
            email,
            name,
            password: null,
            isEmailVerified: true, // Google verified email
          },
        });

        // Assign default USER role
        const userRoleId = await this.getRoleId('USER');
        await this.prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: userRoleId,
          },
        });
      }

      // 4️⃣ Create/link OAuth account
      oauthAccount = await this.prisma.oAuthAccount.upsert({
        where: {
          provider_providerId: {
            provider: 'google',
            providerId: googleId,
          },
        },
        update: {
          accessToken: tokens.access_token ?? null,
          refreshToken: tokens.refresh_token ?? null,
          userId: user.id,
        },
        create: {
          provider: 'google',
          providerId: googleId,
          accessToken: tokens.access_token ?? null,
          refreshToken: tokens.refresh_token ?? null,
          userId: user.id,
        },
      });
    }

    // 5️⃣ Issue access/refresh tokens + session (same as normal login)
    return this.issueTokensForUser(user, clientType, req, res);
  }

  async login(dto: LoginDto, req: Request, res: Response) {
    const { email, password, clientType } = dto;

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

    return this.issueTokensForUser(user, clientType, req, res);
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

  async refresh(req, res, clientType: 'web' | 'mobile') {
    console.log(req.cookies);
    const oldRefreshToken =
      clientType === 'web'
        ? req.cookies['refreshToken']
        : req.body.refreshToken;

    if (!oldRefreshToken)
      throw new UnauthorizedException('Missing refresh token');

    const rotated = await this.session.rotateRefreshToken(oldRefreshToken);

    if (!rotated) throw new UnauthorizedException('Invalid or Expired session');

    const { session, refreshToken } = rotated;

    const accessToken = this.jwtService.sign({
      sub: session.id,
      email: '',
    });

    if (clientType === 'web') {
      res.cookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/api/v1/auth/refresh',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return { accessToken };
    }

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
    };
  }

  async logout(dto: LogoutDto, req: Request, res: Response) {
    const clientType = dto.clientType ?? 'web';

    const refreshToken =
      clientType === 'web' ? req.cookies?.['refreshToken'] : dto.refreshToken;

    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    const session = await this.session.getSessionFromRefreshToken(refreshToken);

    if (!session) {
      if (clientType === 'web') {
        res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
      }
      return { message: 'Logged out' };
    }

    await this.session.revokeSession(session.id);

    if (clientType === 'web') {
      res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
    }

    return { message: 'Logged out successfully' };
  }

  async logoutAll(req: Request, res: Response) {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
      throw new UnauthorizedException('Missing Authorization header');

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer')
      throw new UnauthorizedException('Invalid Authorization header');

    const token = parts[1];

    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }

    const userId = payload.sub as string;
    if (!userId) throw new UnauthorizedException('Invalid token payload');

    await this.session.revokeAllUsers(userId);

    res.clearCookie('refreshToken', { path: '/auth/refresh' });

    return { message: 'Logged out from all devices' };
  }
}
