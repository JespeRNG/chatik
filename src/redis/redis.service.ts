import { Inject, Injectable } from '@nestjs/common';
import { RedisRepository } from './repository/redis.repository';

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const TEN_MINUTES_IN_SECONDS = 60 * 10;

@Injectable()
export class RedisService {
  constructor(
    @Inject(RedisRepository) private readonly redisRepository: RedisRepository,
  ) {}
  public async saveToken(userId: string, access_token: string) {
    await this.redisRepository.set('access_token', userId, access_token);
  }

  public async getToken(userId: string) {
    return await this.redisRepository.get('access_token', userId);
  }
  /* public async saveProduct(
    productId: string,
    productData: ProductInterface,
  ): Promise<void> {
    // Expiry is set to 1 day
    await this.redisRepository.setWithExpiry(
      RedisPrefixEnum.PRODUCT,
      productId,
      JSON.stringify(productData),
      ONE_DAY_IN_SECONDS,
    );
  } */

  /* public async getProduct(productId: string): Promise<ProductInterface | null> {
    const product = await this.redisRepository.get(
      RedisPrefixEnum.PRODUCT,
      productId,
    );
    return JSON.parse(product);
  } */

  /* public async saveResetToken(userId: string, token: string): Promise<void> {
    // Expiry is set to 10 minutes
    await this.redisRepository.setWithExpiry(
      RedisPrefixEnum.RESET_TOKEN,
      token,
      userId,
      TEN_MINUTES_IN_SECONDS,
    );
  } */

  /* public async getResetToken(token: string): Promise<string | null> {
    return await this.redisRepository.get(RedisPrefixEnum.RESET_TOKEN, token);
  } */
}
