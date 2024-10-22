import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenWhitelistDto } from './dto/token-whitelist.dto';
import { TokenWhiteListEntity } from './entity/token-whiteList.entity';

@Injectable()
export class TokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public createWhitelist(
    whitelistDto: TokenWhitelistDto,
  ): Promise<TokenWhiteListEntity> {
    return this.prismaService.tokenWhiteList.create({
      data: whitelistDto,
    });
  }

  public getRefreshToken(
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

  public getRefreshTokenByUserId(
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
}
