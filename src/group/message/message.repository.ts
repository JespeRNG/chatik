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

  public async createMany(
    groupId: string,
    messages: CreateMessageDto[],
  ): Promise<void> {
    await this.prisma.message.createMany({
      data: messages.map((msg) => ({
        content: msg.content,
        senderId: msg.senderId,
        groupId: groupId,
      })),
    });
  }

  public getAllMessages(groupId: string): Promise<MessageEntity[]> {
    return this.prisma.message.findMany({
      where: {
        groupId: groupId,
      },
    });
  }

  public async getLastMessage(groupId: string): Promise<MessageEntity> {
    const messages = await this.prisma.message.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    return messages.length > 0 ? messages[0] : null;
  }
}
