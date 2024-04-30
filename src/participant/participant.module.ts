import { Module } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { ParticipantRepository } from './participant.repository';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [],
  providers: [ParticipantService, ParticipantRepository],
  imports: [PrismaModule],
  exports: [ParticipantService],
})
export class ParticipantModule {}
