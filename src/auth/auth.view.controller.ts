import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Render,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as UAParser from 'ua-parser-js';
import { LoginDto } from './dto/login.dto';
import { Request as req, Response } from 'express';
import { AuthService } from './auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiExcludeController } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { TokensDto } from './dto/tokens.dto';
import { SkipAuth } from './guards/skip-auth.guard';

@ApiExcludeController()
@Controller()
export class AuthViewController {
  constructor(private readonly authService: AuthService) {}

  @Get('signup')
  @Render('auth/signup')
  @SkipAuth()
  public signupPage(@Request() request: req, @Res() res: Response): void {
    if (request.cookies['access_token']) {
      return res.redirect('/');
    }

    return;
  }

  @Get('signin')
  @Render('auth/signin')
  @SkipAuth()
  public signinPage(@Request() request: req, @Res() res: Response): void {
    if (request.cookies['accessToken']) {
      return res.redirect('/');
    }

    return;
  }

  @Post('signup')
  @SkipAuth()
  public async signup(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<void> {
    const tokens = await this.authService.signUp(createUserDto);
    if (!tokens) {
      throw new ConflictException();
    }

    return res.redirect('signin');
  }

  @UseGuards(ThrottlerGuard)
  @Post('login')
  @SkipAuth()
  public async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
    @Request() request: req,
  ): Promise<void> {
    const deviceInfo = this.getDeviceInfo(request);

    const tokens = await this.authService.signIn(
      loginDto.username,
      loginDto.password,
      deviceInfo,
    );

    if (!tokens) {
      return res.redirect('/signin?error=invalid_credentials');
    }

    this.setCookies(res, tokens);

    return res.redirect('/');
  }

  @Get('refresh')
  @SkipAuth()
  async refreshToken(@Request() request: req, @Res() res: Response) {
    const refreshToken = request.cookies['refreshToken'];
    const deviceInfo = this.getDeviceInfo(request);

    const tokens = await this.authService.refreshToken(
      refreshToken,
      deviceInfo,
    );

    if (!tokens) {
      return res.redirect('/signin');
    }

    this.setCookies(res, tokens);

    const redirectUrl = request.headers['referer'] || '/';
    return res.redirect(redirectUrl);
  }

  @Post('logout')
  public async logout(
    @Request() request: req,
    @Res() res: Response,
  ): Promise<void> {
    const deviceInfo = this.getDeviceInfo(request);
    const refreshToken = request.cookies['refreshToken'];
    const userId = request.user['sub'];

    await this.authService.logout(userId, refreshToken, deviceInfo);

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

    return res.redirect('/signin');
  }

  //#region private methods
  private setCookies(@Res() res: Response, tokens: TokensDto) {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      maxAge: 1800000, // 30 minutes in milliseconds
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 604800000, // 7 days in milliseconds
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
