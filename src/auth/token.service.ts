import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from 'src/constants/constants';
import { Cron } from '@nestjs/schedule';
import { JwtService } from '@nestjs/jwt';
import { TokensDto } from './dto/tokens.dto';
import { UserService } from 'src/user/user.service';
import { TokenRepository } from './token.repository';
import { TokenWhitelistDto } from './dto/token-whitelist.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenWhiteListEntity } from './entity/token-whiteList.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokenRepository: TokenRepository,
  ) {}

  public async createTokens(
    userId: string,
    username: string,
  ): Promise<TokensDto> {
    const accessToken = await this.createAccessToken({
      sub: userId,
      username,
    });
    const refreshToken = this.createRefreshToken({
      sub: userId,
      username,
    });

    return { accessToken, refreshToken };
  }

  public async createWhitelist(
    whitelistDto: TokenWhitelistDto,
  ): Promise<TokenWhiteListEntity> {
    return this.tokenRepository.createWhitelist(whitelistDto);
  }

  public async refreshToken(
    refreshToken: string,
    deviceInfo: string,
  ): Promise<TokensDto> {
    const tokenFromWhitelist = await this.tokenRepository.findRefreshToken(
      deviceInfo,
      refreshToken,
    );

    if (!tokenFromWhitelist) {
      throw new UnauthorizedException('No refreshToken in whitelist');
    }

    try {
      const userInfo = await this.jwtService.verifyAsync(refreshToken, {
        secret: JWT_REFRESH_SECRET,
      });

      const accessToken = await this.createAccessToken({
        sub: userInfo.sub,
        username: userInfo.username,
        role: userInfo.role,
      });

      return { accessToken, refreshToken };
    } catch (error) {
      await this.tokenRepository.deleteRefreshToken(
        tokenFromWhitelist.userId,
        refreshToken,
        deviceInfo,
      );

      throw new UnauthorizedException('Token is invalid or expired');
    }
  }

  public async existsByDeviceInfo(
    deviceInfo: string,
    userId: string,
  ): Promise<TokenWhitelistDto> {
    const token = await this.tokenRepository.findRefreshTokenByUserId(
      deviceInfo,
      userId,
    );

    return token;
  }

  public async deleteRefreshToken(
    userId: string,
    refreshToken: string,
    deviceInfo: string,
  ): Promise<TokenWhitelistDto> {
    const removedRefreshToken = await this.tokenRepository.deleteRefreshToken(
      userId,
      refreshToken,
      deviceInfo,
    );

    return removedRefreshToken;
  }

  //#region  private methods
  private createAccessToken(payload: object): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: JWT_ACCESS_SECRET,
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });
  }

  private createRefreshToken(payload: object): string {
    return this.jwtService.sign(payload, {
      secret: JWT_REFRESH_SECRET,
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
  }

  //clears expired refresh tokens every day at 12:00 am
  @Cron('0 0 * * *')
  private async clearExpiredTokens(): Promise<void> {
    const now = new Date();
    const expiredTokens = await this.tokenRepository.findExpiredTokens(now);

    if (expiredTokens) {
      await this.tokenRepository.deleteExpiredTokens(expiredTokens);
    }
  }
  //#endregion
}
