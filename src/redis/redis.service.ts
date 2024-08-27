import { Inject, Injectable } from '@nestjs/common';
import { RedisRepository } from './repository/redis.repository';
import { CacheMessageDto } from 'src/group/message/dto/cache-message.dto';
import { MessageService } from 'src/group/message/message.service';

@Injectable()
export class RedisService {
  constructor(
    @Inject(RedisRepository) private readonly redisRepository: RedisRepository,
    @Inject(MessageService) private readonly messageService: MessageService,
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

  public async addMessageToCache(
    message: CacheMessageDto,
  ): Promise<CacheMessageDto> {
    const cacheKey = `group:${message.groupId}:messages`;

    await this.redisRepository.rpush(cacheKey, JSON.stringify(message));

    const messageCount = await this.redisRepository.llen(cacheKey);

    if (messageCount > 9) {
      const allMessages = await this.redisRepository.lrange(cacheKey, 0, -1);

      if (allMessages.length > 0) {
        await this.messageService.saveMessagesToDb(
          message.groupId,
          allMessages.map((msg) => JSON.parse(msg)),
        );
      }
      await this.redisRepository.clearMessagesCache(cacheKey);
    }
    return message;
  }
}
