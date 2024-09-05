import { Group } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class GroupInfoEntity implements Group {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  picture: string;

  @ApiProperty()
  creatorId: string;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  participants: string[];
}
