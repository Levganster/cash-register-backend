import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { LoggerInterceptor, BigIntTransformInterceptor } from '@app/common';
import { swaggerInit } from '@app/common/swagger/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(helmet()); // https://docs.nestjs.com/security/helmet
  app.useGlobalInterceptors(
    new LoggerInterceptor(),
    new BigIntTransformInterceptor(),
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT_ADMIN || 3001;
  await swaggerInit(app);
  await app.listen(port);
}
bootstrap();
