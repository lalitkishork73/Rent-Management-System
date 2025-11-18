import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { securityExtension } from './prisma-extensions';
import { AppLogger } from '../common/logger/logger.service';
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{

  private readonly logger:AppLogger;

  constructor() {
    // Create and extend a base client BEFORE Nest lifecycle
    const extendedClient = new PrismaClient().$extends(securityExtension());

    // Call parent constructor properly
    super();

    // Merge the extended client into this instance (ensures DI consistency)
    Object.assign(this, extendedClient);
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('Prisma Postgres DB connected');
      this.logger.log('Prisma Postgres DB connected');
    } catch (error) {
      this.logger.log('Prisma connection failed:');
      console.error('Prisma connection failed:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma Postgres DB disconnected');
    console.log('Prisma Postgres DB disconnected');
  }
}
