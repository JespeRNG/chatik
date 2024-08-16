import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Render, Req, Res } from '@nestjs/common';

@Controller()
export class AuthViewController {
  constructor(private readonly authService: AuthService) {}

  @Get('signup')
  @Render('auth/signup')
  public signupPage(@Req() req: Request, @Res() res: Response) {
    if (req.cookies['access_token']) {
      return res.redirect('/');
    }
    return;
  }

  @Get('signin')
  @Render('auth/signin')
  public signinPage(@Req() req: Request, @Res() res: Response) {
    if (req.cookies['access_token']) {
      return res.redirect('/');
    }
    return;
  }

  @Post('login')
  public async login(
    @Body() loginDto: { username: string; password: string },
    @Res() res: Response,
  ) {
    const tokens = await this.authService.signIn(
      loginDto.username,
      loginDto.password,
    );

    if (!tokens) {
      return res.redirect('/signin?error=invalid_credentials');
    }

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      maxAge: 1800000, // 30 minutes in milliseconds
    });
    return res.redirect('/');
  }
}
