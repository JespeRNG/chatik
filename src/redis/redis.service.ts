import { Inject, Injectable } from '@nestjs/common';
import { RedisRepository } from './repository/redis.repository';
import { MessageDataDto } from 'src/group/message/dto/message-data.dto';

@Injectable()
export class RedisService {
  constructor(
    @Inject(RedisRepository) private readonly redisRepository: RedisRepository,
  ) {}
  public async saveTokens(
    userId: string,
    access_token: string,
    refresh_token: string,
  ) {
    await this.redisRepository.setWithExpiry(
      'access_token',
      userId,
      access_token,
      1800, //30 minutes
    );
    await this.redisRepository.setWithExpiry(
      'refresh_token',
      userId,
      refresh_token,
      604800, //7 days
    );
  }

  //#region Token
  public async getAccessToken(userId: string) {
    return await this.redisRepository.get('access_token', userId);
  }

  public async getRefreshToken(userId: string) {
    return await this.redisRepository.get('refresh_token', userId);
  }

  public async removeTokens(userId: string) {
    await this.redisRepository.delete('access_token', userId);
    await this.redisRepository.delete('refresh_token', userId);
  }
  //#endregion

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
    this.redisRepository.hset('user_sockets', userId, socketId);
  }

  public removeUserSocketId(userId: string): void {
    this.redisRepository.hdel('user_sockets', userId);
  }

  public async getSockets(userIds: string[]): Promise<string[]> {
    const sockets = Promise.all(
      userIds.map(
        async (userId) =>
          await this.redisRepository.hget('user_sockets', userId),
      ),
    );

    return sockets;
  }
  //#endregion
}
