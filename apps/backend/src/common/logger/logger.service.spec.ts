import { Test, TestingModule } from '@nestjs/testing';
import { AppLogger } from './logger.service';
import { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

describe('AppLogger', () => {
  let service: AppLogger;

  // Mocking Winston logger
  const mockWinstonLogger: LoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppLogger,
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockWinstonLogger,
        },
      ],
    }).compile();

    service = module.get<AppLogger>(AppLogger);

    // Reset mock calls before every test
    jest.clearAllMocks();
  });

  it('should call winston.log when calling service.log', () => {
    service.log('Hello dost');

    expect(mockWinstonLogger.log).toHaveBeenCalledWith('Hello dost', undefined);
  });

  it('should call winston.error when calling service.error', () => {
    service.error('Error occurred', 'stacktrace', 'AuthModule');

    expect(mockWinstonLogger.error).toHaveBeenCalledWith(
      'Error occurred',
      'stacktrace',
      'AuthModule',
    );
  });

  it('should call winston.warn when calling service.warn', () => {
    service.warn('Warning here', 'AppModule');

    expect(mockWinstonLogger.warn).toHaveBeenCalledWith(
      'Warning here',
      'AppModule',
    );
  });
});
