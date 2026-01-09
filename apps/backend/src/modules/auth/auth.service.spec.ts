import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from '../otp/otp.service';
import { AppLogger } from '../../common/logger/logger.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { BcryptUtil } from '../../common/utils/bcrypt.util';
import { SessionService } from './session.service';
import { Authorization } from './authorization.service';
import { GoogleOAuthService } from './google.service';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  let req: any;
  let res: any;

  const mockPrisma = {
    user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    role: { findUnique: jest.fn() },
    userRole: { create: jest.fn() },
  };

  const mockJwt = { sign: jest.fn(() => 'mockAccessToken') };

  const mockOtp = { generateOtp: jest.fn(), verifyOtp: jest.fn() };

  const mockLogger = { log: jest.fn() };

  const mockSession = {
    createSession: jest.fn().mockResolvedValue({
      session: { id: 'sess123' },
      refreshToken: 'refresh123',
    }),
  };

  const mockAuthorization = {
    getUserRBAC: jest.fn().mockResolvedValue({
      roles: ['USER'],
      permissions: [],
    }),
  };

  const mockGoogle = {
    verifyIdToken: jest.fn(),
    getUserFromCode: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    req = {
      ip: '127.0.0.1',
      headers: { 'user-agent': 'jest-agent' },
    };

    res = {
      cookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: OtpService, useValue: mockOtp },
        { provide: AppLogger, useValue: mockLogger },
        { provide: SessionService, useValue: mockSession },
        { provide: Authorization, useValue: mockAuthorization },
        { provide: GoogleOAuthService, useValue: mockGoogle },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });
 
  // -------- SIGNUP ---------

  describe('signUp', () => {
    it('should throw if user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ email: 'lalit@mail.com' });

      await expect(service.signUp('lalit@mail.com', '123456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a new user + USER role + OTP', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user123',
        email: 'lalit@mail.com',
      });
      mockPrisma.role.findUnique.mockResolvedValue({
        id: 'role-user',
        name: 'USER',
      });

      mockPrisma.userRole.create.mockResolvedValue({});
      jest.spyOn(BcryptUtil, 'hashPassword').mockResolvedValue('hashed');

      const result = await service.signUp('lalit@mail.com', 'password');

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.userRole.create).toHaveBeenCalledWith({
        data: { userId: 'user123', roleId: 'role-user' },
      });
      expect(mockOtp.generateOtp).toHaveBeenCalledWith('lalit@mail.com');

      expect(result).toEqual({
        message: 'Signup successful, please verify OTP sent to your email',
      });
    });
  });

  // -------- LOGIN --------

  describe('login', () => {
    it('should throw if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login(
          { email: 'missing@mail.com', password: 'pass', clientType: 'web' },
          req,
          res,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password invalid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@mail.com',
        password: 'hashed',
        isEmailVerified: true,
      });
      jest.spyOn(BcryptUtil, 'comparePassword').mockResolvedValue(false);

      await expect(
        service.login(
          { email: 'test@mail.com', password: 'wrong', clientType: 'web' },
          req,
          res,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should login (web) and set cookie', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@mail.com',
        password: 'hashed',
        isEmailVerified: true,
      });
      jest.spyOn(BcryptUtil, 'comparePassword').mockResolvedValue(true);

      const result = await service.login(
        { email: 'test@mail.com', password: 'pass', clientType: 'web' },
        req,
        res,
      );

      expect(result).toHaveProperty('accessToken');
      expect(res.cookie).toHaveBeenCalled();
      expect(mockSession.createSession).toHaveBeenCalled();
    });

    it('should login (mobile) and return refreshToken in JSON', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'test@mail.com',
        password: 'hashed',
        isEmailVerified: true,
      });
      jest.spyOn(BcryptUtil, 'comparePassword').mockResolvedValue(true);

      const result = await service.login(
        {
          email: 'test@mail.com',
          password: 'pass',
          clientType: 'mobile',
        },
        req,
        res,
      );

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockSession.createSession).toHaveBeenCalled();
    });
  });

  // ------ OTP VERIFY --------

  describe('verifyOtp', () => {
    it('should verify OTP and update user', async () => {
      mockOtp.verifyOtp.mockResolvedValue(true);
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.verifyOtp('test@mail.com', '123456');
      expect(result).toEqual({ message: 'Email verified successfully' });
    });

    it('should throw if OTP invalid', async () => {
      mockOtp.verifyOtp.mockResolvedValue(false);

      await expect(service.verifyOtp('test@mail.com', '0000')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
