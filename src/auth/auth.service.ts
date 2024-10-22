import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TokensDto } from './dto/tokens.dto';
import { TokenService } from './token.service';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { TokenWhitelistDto } from './dto/token-whitelist.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  public async signUp(createUserDto: CreateUserDto): Promise<UserEntity> {
    const userExists = await this.userService.findByUsername(
      createUserDto.username,
    );
    if (userExists) {
      throw new ConflictException('User already exists.');
    }

    const newUser = await this.userService.createUser(createUserDto);
    return newUser;
  }

  public async signIn(
    username: string,
    password: string,
    deviceInfo: string,
  ): Promise<TokensDto> {
    const user = await this.userService.findByUsername(username);

    if (!user) {
      throw new NotFoundException(`No user found for username: ${username}`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const tokenFromWhitelist = await this.tokenService.existsByDeviceInfo(
      deviceInfo,
      user.id,
    );

    const tokens = this.tokenService.createTokens(user.id, user.username);

    if (!tokenFromWhitelist) {
      await this.tokenService.createWhitelist({
        userId: user.id,
        refreshToken: tokens.refreshToken,
        deviceInfo,
      });

      return tokens;
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokenFromWhitelist.refreshToken,
    };
  }

  public refreshToken(
    refreshToken: string,
    deviceInfo: string,
  ): Promise<TokensDto> {
    return this.tokenService.refreshToken(refreshToken, deviceInfo);
  }

  public async logout(
    userId: string,
    refreshToken: string,
    deviceInfo: string,
  ): Promise<TokenWhitelistDto> {
    const removedRefreshToken = await this.tokenService.deleteRefreshToken(
      userId,
      refreshToken,
      deviceInfo,
    );

    return removedRefreshToken;
  }
}
