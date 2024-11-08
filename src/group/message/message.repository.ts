import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { BaseRepository } from 'src/common/base.repository';

@Injectable()
export class MessageRepository extends BaseRepository {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  public create(createMessageDto: CreateMessageDto): Promise<MessageEntity> {
    return this.prisma.message.create({
      data: {
        content: createMessageDto.content,
        senderId: createMessageDto.senderId,
        groupId: createMessageDto.groupId,
      },
    });
  }

  public createMany(
    groupId: string,
    messages: CreateMessageDto[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.message.createMany({
      data: messages.map((msg) => ({
        content: msg.content,
        senderId: msg.senderId,
        groupId: groupId,
        createdAt: msg.createdAt,
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
      take: 10,
    });

    return messages.length > 0 ? messages[0] : null;
  }
}
