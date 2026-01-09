import { Injectable, Inject } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class AppLogger implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService, // <-- important
  ) {}

  log(message: any, context?: string) {
    this.logger.log(message, context);
  }

  error(message: any, stack?: string, context?: string) {
    this.logger.error(message, stack, context);
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, context);
  }

  // debug(message: any, context?: string) {
  //   this.logger.debug(message, context);
  // }

  // verbose(message: any, context?: string) {
  //   this.logger.verbose(message, context);
  // }
}
