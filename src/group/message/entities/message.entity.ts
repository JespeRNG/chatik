import { Message } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class MessageEntity implements Message {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  groupId: string;
}
