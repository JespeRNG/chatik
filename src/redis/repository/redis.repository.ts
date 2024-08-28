import { Redis } from 'ioredis';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RedisRepository {
  constructor(@Inject('RedisClient') private readonly redisClient: Redis) {}

  onModuleDestroy(): void {
    this.redisClient.disconnect();
  }

  public async get(prefix: string, key: string): Promise<string | null> {
    return this.redisClient.get(`${prefix}:${key}`);
  }

  public async delete(prefix: string, key: string): Promise<void> {
    await this.redisClient.del(`${prefix}:${key}`);
  }

  public async clearMessagesCache(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  public async setWithExpiry(
    prefix: string,
    key: string,
    value: string,
    expiry: number,
  ): Promise<void> {
    await this.redisClient.set(`${prefix}:${key}`, value, 'EX', expiry);
  }

  public async rpush(key: string, ...values: string[]): Promise<number> {
    return this.redisClient.rpush(key, ...values);
  }

  public async lpop(key: string, count = 1): Promise<string[]> {
    return this.redisClient.lpop(key, count);
  }

  public async llen(key: string): Promise<number> {
    return this.redisClient.llen(key);
  }

  public async lrange(
    key: string,
    start: number,
    stop: number,
  ): Promise<string[]> {
    return this.redisClient.lrange(key, start, stop);
  }
}
