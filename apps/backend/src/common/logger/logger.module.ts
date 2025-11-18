import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { AppLogger } from './logger.service';
import * as path from 'node:path';
import * as fs from 'node:fs';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: () => {
        const transports: any[] = [];

        // *** Ensure logs directory exists ***
        const logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }

        // -----------------------
        // CONSOLE LOGS
        // -----------------------
        transports.push(
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
          new winston.transports.File({
            dirname: logDir, // 👈 correct (directory only)
            filename: 'app.log', // 👈 correct (only file name)
            level: 'info',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            ),
          }),
        );

        // console.log(transports)


        // -----------------------
        // ELASTICSEARCH LOGS (optional)
        // -----------------------
        if (process.env.ENABLE_ELASTIC === 'true' && process.env.ELASTIC_URL) {
          const esTransport = new ElasticsearchTransport({
            level: 'info',
            clientOpts: { node: process.env.ELASTIC_URL },
            indexPrefix: process.env.ELASTIC_INDEX_PREFIX || 'app-logs',
            transformer: (logData) => {
              return {
                '@timestamp': logData.timestamp,
                message: logData.message,
                severity: logData.level,
                fields: {
                  ...logData.meta,
                },
              };
            },
          });

          transports.push(esTransport);
        }

        return {
          transports,
          exitOnError: false,
        };
      },
    }),
  ],
  providers: [AppLogger],
  exports: [AppLogger, WinstonModule],
})
export class LoggerModule {}
