import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

const redisFactory = {
  provide: 'REDIS',
  useFactory: () => {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = process.env.REDIS_PORT || 6379;
    const password = process.env.REDIS_PASSWORD || undefined;

    const redisConfig = {
      host,
      port: Number(port),
      password,
    };
    const client = new Redis(redisConfig);
    client.on('error', (err) => {
      console.error('Redis error:', err);
    });
    return client;
  },
};

@Global()
@Module({
  providers: [redisFactory],
  exports: ['REDIS'],
})
export class RedisModule {}
