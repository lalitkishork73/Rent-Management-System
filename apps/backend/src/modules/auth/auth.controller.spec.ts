import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            signUp: jest.fn(),
            verifyOtp: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should call login service method', async () => {
    (service.login as jest.Mock).mockResolvedValue({ accessToken: 'token' });

    const result = await controller.login({
      email: 'test@mail.com',
      password: '1234',
    });
    expect(service.login).toHaveBeenCalledWith('test@mail.com', '1234');
    expect(result).toEqual({ accessToken: 'token' });
  });

  it('should call signup service method', async () => {
    (service.signUp as jest.Mock).mockResolvedValue({ message: 'OK' });

    const result = await controller.signup({
      email: 'test@mail.com',
      password: '1234',
      name:"jane doe"
    });
    expect(service.signUp).toHaveBeenCalledWith('test@mail.com', '1234');
    expect(result).toEqual({ message: 'OK' });
  });

  it('should call verifyOtp service method', async () => {
    (service.verifyOtp as jest.Mock).mockResolvedValue({ message: 'verified' });

    const result = await controller.verifyOtp({
      email: 'test@mail.com',
      otp: '123456',
    });
    expect(service.verifyOtp).toHaveBeenCalledWith('test@mail.com', '123456');
    expect(result).toEqual({ message: 'verified' });
  });
});
