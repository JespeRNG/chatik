import { Inject, Injectable } from '@nestjs/common';
import { RedisRepository } from './repository/redis.repository';

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

  public async getAccessToken(userId: string) {
    return await this.redisRepository.get('access_token', userId);
  }

  public async getRefreshToken(userId: string) {
    return await this.redisRepository.get('refresh_token', userId);
  }

  public async removeAccessToken(userId: string) {
    await this.redisRepository.delete('access_token', userId);
  }
}
