import * as path from 'path';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { GroupModule } from './group/group.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TokenService } from './auth/token.service';
import { RedisModule } from 'src/redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TokenRepository } from './auth/token.repository';
import { CookieAuthGuard } from './auth/guards/cookie-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
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
    CaslModule,
    PrismaModule,
    AuthModule,
    UserModule,
    GroupModule,
    RedisModule,
  ],
  controllers: [],
  providers: [
    JwtService,
    TokenService,
    TokenRepository,
    {
      provide: APP_GUARD,
      useClass: CookieAuthGuard,
    },
  ],
})
export class AppModule {}
