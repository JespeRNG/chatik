import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { UserModule } from 'src/user/user.module';
import { GroupRepository } from './group.repository';
import { RedisModule } from 'src/redis/redis.module';
import { GroupApiController } from './group.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GroupViewController } from './group.view.controller';
import { GroupParticipantService } from './participant/group-participant.service';
import { GroupParticipantRepository } from './participant/group-participant.repository';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [GroupApiController, GroupViewController],
  providers: [
    GroupService,
    GroupRepository,
    GroupParticipantRepository,
    GroupParticipantService,
  ],
  imports: [PrismaModule, UserModule, RedisModule, JwtModule],
})
export class GroupModule {}
