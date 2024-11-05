import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as UAParser from 'ua-parser-js';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { TokensDto } from './dto/tokens.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request as req, Response } from 'express';
import { SkipAuth } from './guards/skip-auth.guard';
import { UserEntity } from 'src/user/entities/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { HeaderAuthGuard } from './guards/header-auth.guard';
import { CookieAuthGuard } from './guards/cookie-auth.guard';

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
  @ApiOperation({
    summary: 'Signs in, returns tokens and adds them to cookies',
  })
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
  public async signin(
    @Body() { username, password }: LoginDto,
    @Res() res: Response,
    @Request() request: req,
  ): Promise<void> {
    const deviceInfo = this.getDeviceInfo(request);

    const tokens = await this.authService.signIn(
      username,
      password,
      deviceInfo,
    );

    this.setCookies(res, tokens);

    res.status(200).json(tokens);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logs user out' })
  @ApiOkResponse({ description: 'A user was logged out successfully' })
  @ApiCookieAuth()
  @UseGuards(CookieAuthGuard)
  public logout(@Request() request: req, @Res() res: Response): void {
    const refreshToken = request.cookies['refreshToken'];
    const deviceInfo = this.getDeviceInfo(request);

    this.authService.logout(request.user['sub'], refreshToken, deviceInfo);
    this.removeCookies(res);

    res.sendStatus(200);
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

  //#region private methods
  private setCookies(@Res() res: Response, tokens: TokensDto): void {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      maxAge: 1800000, // 30 minutes in milliseconds
      secure: false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 604800000, // 7 days in milliseconds
      secure: false,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
  }

  private removeCookies(@Res() res: Response): void {
    res.cookie('accessToken', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
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
  //#endregion
}
