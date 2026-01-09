import { Test, TestingModule } from '@nestjs/testing';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('OtpController (Integration)', () => {
  let controller: OtpController;
  let service: OtpService;

  const mockRedis = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [
        OtpService,
        PrismaService,
        { provide: 'REDIS', useValue: mockRedis },
      ],
    }).compile();

    controller = module.get<OtpController>(OtpController);
    service = module.get<OtpService>(OtpService);
  });

  it('should generate OTP successfully for given email', async () => {
    jest.spyOn(service, 'generateOtp').mockResolvedValue({
      message: 'OTP sent successfully',
    });

    const result = await controller.generateOtp({ email: 'lalit1@yopmail.com' });
    expect(result).toEqual({
      message: 'OTP sent successfully'
    });
  });
});
