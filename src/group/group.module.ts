import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { UserModule } from 'src/user/user.module';
import { GroupRepository } from './group.repository';
import { GroupController } from './group.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ParticipantModule } from 'src/participant/participant.module';
import { GroupParticipantRepository } from './participant/group-participant.repository';
import { GroupParticipantService } from './participant/group-participant.service';

@Module({
  controllers: [GroupController],
  providers: [
    GroupService,
    GroupRepository,
    GroupParticipantRepository,
    GroupParticipantService,
  ],
  imports: [PrismaModule, UserModule, ParticipantModule],
})
export class GroupModule {}
