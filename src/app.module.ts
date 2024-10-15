import * as path from 'path';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { RedisModule } from 'src/redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '../', 'public'),
      serveRoot: '/',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    GroupModule,
    RedisModule,
  ],
  controllers: [],
})
export class AppModule {}
