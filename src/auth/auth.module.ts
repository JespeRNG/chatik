import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';
import { TokenRepository } from './token.repository';
import { AuthApiController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthViewController } from './auth.view.controller';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';

@Module({
  imports: [UserModule, RedisModule, PrismaModule],
  controllers: [AuthApiController, AuthViewController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    TokenService,
    TokenRepository,
  ],
})
export class AuthModule {}
