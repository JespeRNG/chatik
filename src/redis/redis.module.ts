import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { GroupModule } from 'src/group/group.module';
import { redisClientFactory } from './redis.client.factory';
import { RedisRepository } from './repository/redis.repository';
import { MessageService } from 'src/group/message/message.service';
import { MessageRepository } from 'src/group/message/message.repository';
import { UserRepository } from 'src/user/user.repository';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [GroupModule, UserModule, PrismaModule],
  controllers: [],
  providers: [
    redisClientFactory,
    RedisRepository,
    RedisService,
    MessageService,
    MessageRepository,
    UserRepository,
  ],

  exports: [RedisService],
})
export class RedisModule {}
