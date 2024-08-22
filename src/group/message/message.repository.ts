import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  public create(createMessageDto: CreateMessageDto): Promise<MessageEntity> {
    return this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        senderId: createMessageDto.senderId,
        groupId: createMessageDto.groupId,
      },
    });
  }
}
