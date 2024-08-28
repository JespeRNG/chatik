import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { UserModule } from 'src/user/user.module';
import { GroupModule } from 'src/group/group.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserRepository } from 'src/user/user.repository';
import { redisClientFactory } from './redis.client.factory';
import { RedisRepository } from './repository/redis.repository';

@Module({
  imports: [GroupModule, UserModule, PrismaModule],
  controllers: [],
  providers: [
    redisClientFactory,
    RedisRepository,
    RedisService,
    UserRepository,
  ],

  exports: [RedisService],
})
export class RedisModule {}
