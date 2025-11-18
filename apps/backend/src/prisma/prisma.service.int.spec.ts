import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService (Integration)', () => {
  let service: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should connect to the database successfully', async () => {
    await expect(service.$connect()).resolves.not.toThrow();
  });

  it('should perform a simple query (check DB accessibility)', async () => {
    const result:any = await service.$queryRawUnsafe('SELECT 1 as test;');
    expect(result).toBeDefined();
    expect(result[0].test).toBe(1);
  });

  afterAll(async () => {
    await service.$disconnect();
  });
});
