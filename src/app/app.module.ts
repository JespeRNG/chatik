import * as path from 'path';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AppController } from './app.controller';
import { GroupModule } from '../group/group.module';
import { RedisModule } from 'src/redis/redis.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '../../', 'public'),
      serveRoot: '/',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    GroupModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
