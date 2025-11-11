import { Test, TestingModule } from '@nestjs/testing';
import { AppLogger } from './logger.service';
import { Logger } from '@nestjs/common';

describe('LoggerService', () => {
  let service: AppLogger;
  let logSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppLogger],
    }).compile();

    service = module.get<AppLogger>(AppLogger);
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log message using NestJS Logger', () => {
    service.log('Hello Dost');
    expect(logSpy).toHaveBeenCalledWith('Hello Dost');
  });
});
