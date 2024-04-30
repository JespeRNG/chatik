import { Participant } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ParticipantEntity implements Participant {
  @ApiProperty()
  id: string;

  @ApiProperty()
  groupId: string;

  @ApiProperty()
  userId: string;
}
