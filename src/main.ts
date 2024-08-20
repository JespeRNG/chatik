import { join } from 'path';
import * as dotenv from 'dotenv';
import { AppModule } from './app/app.module';
import * as cookieParser from 'cookie-parser';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const viewsPath = join(__dirname, '../public/views');
  app.setViewEngine('hbs');
  app.set('views', viewsPath);
  app.set('view engine', '.hbs');
  app.use(cookieParser());

  app.enableCors({
    origin: `http://${process.env.APP_HOST}:${process.env.APP_PORT}`,
    methods: ['GET', 'POST'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Chatik')
    .setDescription('The group-based chat application.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableShutdownHooks();
  await app.listen(+process.env.APP_PORT);
}
bootstrap();
