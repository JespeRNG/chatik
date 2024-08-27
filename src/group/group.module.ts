import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { GroupService } from './group.service';
import { UserModule } from 'src/user/user.module';
import { GroupRepository } from './group.repository';
import { RedisService } from 'src/redis/redis.service';
import { GroupApiController } from './group.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GroupGateway } from './gateways/group.gateway';
import { UserRepository } from 'src/user/user.repository';
import { MessageService } from './message/message.service';
import { GroupViewController } from './group.view.controller';
import { MessageRepository } from './message/message.repository';
import { GroupsMenuGateway } from './gateways/groups-menu.gateway';
import { redisClientFactory } from 'src/redis/redis.client.factory';
import { RedisRepository } from 'src/redis/repository/redis.repository';
import { GroupParticipantService } from './participant/group-participant.service';
import { GroupParticipantRepository } from './participant/group-participant.repository';

@Module({
  controllers: [GroupApiController, GroupViewController],
  providers: [
    GroupService,
    MessageService,
    GroupRepository,
    MessageRepository,
    GroupsMenuGateway,
    GroupGateway,
    GroupParticipantService,
    GroupParticipantRepository,
    UserRepository,
    RedisService,
    RedisRepository,
    redisClientFactory,
  ],
  imports: [PrismaModule, UserModule, JwtModule, GroupModule],
})
export class GroupModule {}
