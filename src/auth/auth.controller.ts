import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as UAParser from 'ua-parser-js';
import { Request as req } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { TokensDto } from './dto/tokens.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SkipAuth } from './guards/skip-auth.guard';
import { UserEntity } from 'src/user/entities/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { HeaderAuthGuard } from './guards/header-auth.guard';

@ApiTags('api/auth')
@Controller('api/auth')
export class AuthApiController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    type: TokensDto,
    description: 'User was created and tokens were returned',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists.',
  })
  @SkipAuth()
  public async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserEntity> {
    return new UserEntity(await this.authService.signUp(createUserDto));
  }

  @Post('signin')
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Sign in and return tokens' })
  @ApiOkResponse({ type: TokensDto })
  @ApiResponse({
    status: 404,
    description: 'No user found for username: ${username}',
  })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  @ApiResponse({
    status: 429,
    description: 'ThrottlerException: Too Many Requests',
  })
  @SkipAuth()
  public signin(
    @Body() { username, password }: LoginDto,
    @Request() request: req,
  ): Promise<TokensDto> {
    const deviceInfo = this.getDeviceInfo(request);

    return this.authService.signIn(username, password, deviceInfo);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log user out' })
  @ApiOkResponse({ description: 'A user was logged out successfully' })
  @ApiBearerAuth()
  @UseGuards(HeaderAuthGuard)
  public logout(@Request() request: req): { message: string } {
    const refreshToken = request.cookies['refreshToken'];
    const deviceInfo = this.getDeviceInfo(request);

    this.authService.logout(request.user['sub'], refreshToken, deviceInfo);

    return { message: 'Logged out successfully.' };
  }

  //To test it you should put refresh token as a bearer token in the Authorization tab in postman
  @Get('refresh')
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiOkResponse({ description: 'Access token has been refreshed' })
  @ApiResponse({
    status: 401,
    description: 'No refreshToken in whitelist or token is invalid or expired',
  })
  @SkipAuth()
  public refreshToken(@Request() request: req): Promise<TokensDto> {
    const refreshToken = request.headers['authorization']?.split(' ')[1];
    const deviceInfo = this.getDeviceInfo(request);

    return this.authService.refreshToken(refreshToken, deviceInfo);
  }

  private getDeviceInfo(@Request() request: req): string {
    const parser = new UAParser();
    const userAgent = request.headers['user-agent'];

    const browserInfo = parser.setUA(userAgent).getResult();

    const browserName = browserInfo.browser.name || 'Unknown browser';
    const osName = browserInfo.os.name || 'Unknown OS';
    const osVersion = browserInfo.os.version || 'Unknown version';

    return `Browser: ${browserName}, OS: ${osName} ${osVersion}`;
  }
}
