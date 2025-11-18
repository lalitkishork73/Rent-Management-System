import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthModule } from './auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisModule } from '../../common/redis/redis.provider';

describe('AuthService (Integration)', () => {
  let authService: AuthService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, RedisModule],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.user.deleteMany(); // Clean DB before test
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should sign up a new user successfully', async () => {
    const result = await authService.signUp('lalit2@yopmail.com', '12345678');
    expect(result.message).toContain('Signup successful');

    const user:any = await prisma.user.findUnique({
      where: { email: 'lalit2@yopmail.com' },
    });
    expect(user).not.toBeNull();
    expect(user.isEmailVerified).toBeFalsy();
  });
});
