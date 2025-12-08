import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AppLogger } from './common/logger/logger.service';
import cookiesParser from 'cookie-parser';

async function bootstrap() {
  try{
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const logger = app.get(AppLogger);
  logger.log('app is running...');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.use(cookiesParser());

  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT ?? 5000);}
  catch(err){
    console.log(err)
  }
}
bootstrap();
