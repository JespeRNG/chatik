import { Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenWhitelistDto } from './dto/token-whitelist.dto';
import { REFRESH_TOKEN_EXPIRY } from 'src/constants/constants';
import { TokenWhiteListEntity } from './entity/token-whiteList.entity';

@Injectable()
export class TokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public createWhitelist(
    whitelistDto: TokenWhitelistDto,
  ): Promise<TokenWhiteListEntity> {
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);

    return this.prismaService.tokenWhiteList.create({
      data: {
        ...whitelistDto,
        expiresAt,
      },
    });
  }

  public findRefreshToken(
    deviceInfo: string,
    refreshToken: string,
  ): Promise<TokenWhiteListEntity> {
    return this.prismaService.tokenWhiteList.findFirst({
      where: {
        refreshToken,
        deviceInfo,
      },
    });
  }

  public findRefreshTokenByUserId(
    deviceInfo: string,
    userId: string,
  ): Promise<TokenWhiteListEntity> {
    return this.prismaService.tokenWhiteList.findFirst({
      where: {
        userId,
        deviceInfo,
      },
    });
  }

  public deleteRefreshToken(
    userId: string,
    refreshToken: string,
    deviceInfo,
  ): Promise<TokenWhiteListEntity> {
    return this.prismaService.tokenWhiteList.delete({
      where: {
        userId,
        refreshToken,
        deviceInfo,
      },
    });
  }

  public findExpiredTokens(now: Date): Promise<TokenWhiteListEntity[]> {
    return this.prismaService.tokenWhiteList.findMany({
      where: {
        expiresAt: {
          lte: now,
        },
      },
    });
  }

  public async deleteExpiredTokens(
    expiredTokens: TokenWhiteListEntity[],
  ): Promise<Prisma.BatchPayload> {
    const tokenIds = expiredTokens.map((token) => token.id);

    return this.prismaService.tokenWhiteList.deleteMany({
      where: {
        id: {
          in: tokenIds,
        },
      },
    });
  }
}
