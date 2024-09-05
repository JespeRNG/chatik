import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { MessageDataDto } from './dto/message-data.dto';
import { MessageRepository } from './message.repository';
import { MessageEntity } from './entities/message.entity';
import { UserRepository } from 'src/user/user.repository';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly redisService: RedisService,
    private readonly userRepository: UserRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  public async createMessage(
    createMessageDto: CreateMessageDto,
  ): Promise<MessageEntity> {
    return this.messageRepository.create(createMessageDto);
  }

  public async saveMessagesToDb(
    groupId: string,
    createMessageDtos: CreateMessageDto[],
  ) {
    await this.messageRepository.createMany(groupId, createMessageDtos);
  }

  public async getSenderUsername(senderId: string): Promise<string> {
    return (await this.userRepository.findById(senderId)).username;
  }

  public async addMessage(message: MessageDataDto): Promise<MessageDataDto> {
    const cachedMessage = await this.redisService.addMessageToCache(message);
    const cachedMessageCount = await this.redisService.getMessagesCount(
      cachedMessage.groupId,
    );

    if (cachedMessageCount > 9) {
      const allMessages = await this.redisService.getAllMessagesFromCache(
        message.groupId,
      );
      await this.saveMessagesToDb(message.groupId, allMessages);
      await this.redisService.clearMessagesCache(message.groupId);
    }

    return cachedMessage;
  }

  public async getAllMessagesForGroup(
    groupId: string,
  ): Promise<MessageDataDto[]> {
    const cachedMessages =
      await this.redisService.getAllMessagesFromCache(groupId);

    const messagesFromDb = await this.messageRepository.getAllMessages(groupId);

    const allMessages = [...messagesFromDb, ...cachedMessages];

    allMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return allMessages;
  }

  public async getLastMessage(groupId: string): Promise<MessageDataDto | null> {
    const lastCachedMessage =
      (await this.redisService.getLastMessageFromCache(groupId)) || null;

    const lastMessageFromDb =
      (await this.messageRepository.getLastMessage(groupId)) || null;

    if (!lastCachedMessage && !lastMessageFromDb) {
      return null;
    }

    if (!lastCachedMessage) {
      return lastMessageFromDb;
    }
    if (!lastMessageFromDb) {
      return lastCachedMessage;
    }

    const lastCachedMessageCreatedAt = new Date(lastCachedMessage.createdAt);
    const lastMessageFromDbCreatedAt = new Date(lastMessageFromDb.createdAt);

    return lastCachedMessageCreatedAt > lastMessageFromDbCreatedAt
      ? lastCachedMessage
      : lastMessageFromDb;

    return null;
  }

  public async countMessages(groupId: string): Promise<number> {
    const dbMessagesLength = (
      await this.messageRepository.getAllMessages(groupId)
    ).length;

    const redisMessagesLength = (
      await this.redisService.getAllMessagesFromCache(groupId)
    ).length;

    return redisMessagesLength + dbMessagesLength;
  }
}
