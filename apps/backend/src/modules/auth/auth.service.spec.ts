import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from '../otp/otp.service';
import { AppLogger } from '../../common/logger/logger.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { BcryptUtil } from '../../common/utils/bcrypt.util';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let otp: OtpService;
  let logger: AppLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mockedToken'),
          },
        },
        {
          provide: OtpService,
          useValue: {
            generateOtp: jest.fn(),
            verifyOtp: jest.fn(),
          },
        },
        {
          provide: AppLogger,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    otp = module.get<OtpService>(OtpService);
    logger = module.get<AppLogger>(AppLogger);
  });

  describe('signUp', () => {
    it('should throw error if user already exists', async () => {
      prisma.user.findUnique = jest
        .fn()
        .mockResolvedValue({ email: 'lalit@yopmail.com' });

      await expect(service.signUp('lalit@yopmail.com', '123456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a new user and send OTP', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.user.create = jest
        .fn()
        .mockResolvedValue({ id: 1, email: 'lalit@yopmail.com' });
      otp.generateOtp = jest.fn().mockResolvedValue(true);
      jest.spyOn(BcryptUtil, 'hashPassword').mockResolvedValue('hashed');

      const result = await service.signUp('lalit@yopmail.com', 'password');

      expect(prisma.user.create).toHaveBeenCalled();
      expect(otp.generateOtp).toHaveBeenCalledWith('lalit@yopmail.com');
      expect(logger.log).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Signup successful, please verify OTP sent to your email',
      });
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      await expect(service.login('notfound@mail.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if password invalid', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        email: 'test@mail.com',
        password: 'hashedpass',
        isEmailVerified: true,
      });
      jest.spyOn(BcryptUtil, 'comparePassword').mockResolvedValue(false);

      await expect(service.login('test@mail.com', 'wrongpass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return tokens for valid user', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        email: 'test@mail.com',
        password: 'hashedpass',
        isEmailVerified: true,
      });
      jest.spyOn(BcryptUtil, 'comparePassword').mockResolvedValue(true);
      jwt.sign = jest.fn().mockReturnValue('mockToken');

      const result = await service.login('test@mail.com', 'pass');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and update user', async () => {
      otp.verifyOtp = jest.fn().mockResolvedValue(true);
      prisma.user.update = jest.fn().mockResolvedValue({});

      const result = await service.verifyOtp('test@mail.com', '123456');
      expect(result).toEqual({ message: 'Email verified successfully' });
    });

    it('should throw if OTP invalid', async () => {
      otp.verifyOtp = jest.fn().mockResolvedValue(false);
      await expect(
        service.verifyOtp('test@mail.com', '000000'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
