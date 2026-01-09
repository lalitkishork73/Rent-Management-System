import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { BcryptUtil } from '../../common/utils/bcrypt.util';
import { OtpUtil } from '../../common/utils/otp.util';
import { MailUtil } from '../../common/utils/mail.util';

// Mock dependencies
const redisMock = {
  incr: jest.fn(),
  expire: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};

const prismaMock = {
  oTP: {
    create: jest.fn(),
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
  },
};

jest.mock('../../common/utils/bcrypt.util');
jest.mock('../../common/utils/otp.util');
jest.mock('../../common/utils/mail.util');
jest.mock('ejs', () => ({
  renderFile: jest.fn().mockResolvedValue('<html>mock otp template</html>'),
}));

describe('OtpService', () => {
  let service: OtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: 'REDIS', useValue: redisMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('generateOtp', () => {
    it('should generate and send OTP successfully', async () => {
      redisMock.incr.mockResolvedValue(1);
      (OtpUtil.generateOtp as jest.Mock).mockReturnValue('123456');
      (BcryptUtil.hashPassword as jest.Mock).mockResolvedValue('hashed_otp');
      (MailUtil.sendMail as jest.Mock).mockResolvedValue(true);

      const result = await service.generateOtp('test@example.com');

      expect(result).toEqual({ message: 'OTP sent successfully' });
      expect(redisMock.set).toHaveBeenCalled();
      expect(MailUtil.sendMail).toHaveBeenCalled();
    });

    it('should throw rate limit error when too many requests', async () => {
      redisMock.incr.mockResolvedValue(10);
      await expect(service.generateOtp('rate@test.com')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      redisMock.get.mockResolvedValue('hashed_otp');
      (BcryptUtil.comparePassword as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyOtp('test@example.com', '123456');

      expect(result).toBe(true);
      expect(redisMock.del).toHaveBeenCalled();
    });

    it('should throw if OTP expired or not found', async () => {
      redisMock.get.mockResolvedValue(null);
      await expect(
        service.verifyOtp('user@test.com', '111111'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if OTP invalid', async () => {
      redisMock.get.mockResolvedValue('hashed_otp');
      (BcryptUtil.comparePassword as jest.Mock).mockResolvedValue(false);
      await expect(
        service.verifyOtp('user@test.com', '999999'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('revokeOtp', () => {
    it('should delete otp keys from redis', async () => {
      await service.revokeOtp('test@example.com');
      expect(redisMock.del).toHaveBeenCalledTimes(2);
    });
  });
});
