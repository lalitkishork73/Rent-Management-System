import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Module (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.deleteMany(); // clean up before tests
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/signup should create user', async () => {
    const res: any = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'lalit2@yopmail.com',
        password: '12345678',
        name: 'lalit',
      })
      .expect(201);

    expect(res.body.message).toContain('Signup successful');
  });

  it('POST /auth/login should return token', async () => {
   await prisma.user.update({
      where: { email: 'lalit2@yopmail.com' },
      data: { isEmailVerified: true }
    });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'lalit2@yopmail.com', password: '12345678' })
      .expect(201)
      .expect((res) => {
        expect(res.body.accessToken).toBeDefined();
      });
  });
});
