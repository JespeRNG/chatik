import { Redis } from 'ioredis';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RedisRepository {
  constructor(@Inject('RedisClient') private readonly redisClient: Redis) {}

  onModuleDestroy(): void {
    this.redisClient.disconnect();
  }

  public async hset(
    redisKey: string,
    key: string,
    value: string,
  ): Promise<void> {
    await this.redisClient.hset(redisKey, key, value);
  }

  public hget(redisKey: string, key: string): Promise<string | null> {
    return this.redisClient.hget(redisKey, key);
  }

  public async hdel(redisKey: string, key: string): Promise<void> {
    await this.redisClient.hdel(redisKey, key);
  }

  public get(prefix: string, key: string): Promise<string | null> {
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

  public rpush(key: string, ...values: string[]): Promise<number> {
    return this.redisClient.rpush(key, ...values);
  }

  public llen(key: string): Promise<number> {
    return this.redisClient.llen(key);
  }

  public lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redisClient.lrange(key, start, stop);
  }
}
