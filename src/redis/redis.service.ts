import { Inject, Injectable } from '@nestjs/common';
import { RedisRepository } from './repository/redis.repository';

@Injectable()
export class RedisService {
  constructor(
    @Inject(RedisRepository) private readonly redisRepository: RedisRepository,
  ) {}
  public async saveToken(userId: string, access_token: string) {
    await this.redisRepository.setWithExpiry(
      'access_token',
      userId,
      access_token,
      1800, //30 minutes
    );
  }

  public async getToken(userId: string) {
    return await this.redisRepository.get('access_token', userId);
  }

  public async removeToken(userId: string) {
    await this.redisRepository.delete('access_token', userId);
  }
}
