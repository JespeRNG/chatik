import { Injectable } from '@nestjs/common';
import { USER_SOCKET_REDISKEY } from 'src/constants/constants';
import { RedisRepository } from './repository/redis.repository';
import { MessageDataDto } from 'src/group/message/dto/message-data.dto';

@Injectable()
export class RedisService {
  constructor(private readonly redisRepository: RedisRepository) {}

  //#region Add message
  public async addMessageToCache(
    message: MessageDataDto,
  ): Promise<MessageDataDto> {
    const cacheKey = `group:${message.groupId}:messages`;

    await this.redisRepository.rpush(cacheKey, JSON.stringify(message));

    return message;
  }

  public async getMessagesCount(groupId: string): Promise<number> {
    const cacheKey = `group:${groupId}:messages`;

    return await this.redisRepository.llen(cacheKey);
  }

  public async getAllMessagesFromCache(
    groupId: string,
  ): Promise<MessageDataDto[]> {
    const cacheKey = `group:${groupId}:messages`;
    const allMessages = await this.redisRepository.lrange(cacheKey, 0, -1);

    return allMessages.map((msg) => JSON.parse(msg));
  }

  public async clearMessagesCache(groupId: string): Promise<void> {
    const cacheKey = `group:${groupId}:messages`;

    await this.redisRepository.clearMessagesCache(cacheKey);
  }

  public async getLastMessageFromCache(
    groupId: string,
  ): Promise<MessageDataDto> {
    const cacheKey = `group:${groupId}:messages`;
    const messages = await this.redisRepository.lrange(cacheKey, 0, -1);

    if (messages.length === 0) {
      return null;
    }

    return JSON.parse(messages[messages.length - 1]);
  }
  //#endregion

  //#region userSockets
  public setUserSocketId(userId: string, socketId: string): void {
    this.redisRepository.hset(USER_SOCKET_REDISKEY, userId, socketId);
  }

  public removeUserSocketId(userId: string): void {
    this.redisRepository.hdel(USER_SOCKET_REDISKEY, userId);
  }

  public async getSockets(userIds: string[]): Promise<string[]> {
    const sockets = Promise.all(
      userIds.map(async (userId) =>
        this.redisRepository.hget(USER_SOCKET_REDISKEY, userId),
      ),
    );

    return sockets;
  }
  //#endregion
}
