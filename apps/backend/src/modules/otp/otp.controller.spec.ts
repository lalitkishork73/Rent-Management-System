import { Test, TestingModule } from '@nestjs/testing';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';

describe('OtpController', () => {
  let controller: OtpController;
  let otpService: OtpService;

  const mockOtpService = {
    generateOtp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [
        {
          provide: OtpService,
          useValue: mockOtpService,
        },
      ],
    }).compile();

    controller = module.get<OtpController>(OtpController);
    otpService = module.get<OtpService>(OtpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call otpService.generateOtp and return message', async () => {
    mockOtpService.generateOtp.mockResolvedValue({
      message: 'OTP sent successfully',
    });

    const result = await controller.generateOtp({ email: 'test@example.com' });

    expect(result).toEqual({ message: 'OTP sent successfully' });
    expect(mockOtpService.generateOtp).toHaveBeenCalledWith('test@example.com');
  });
});
