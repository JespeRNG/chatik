import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@ApiExcludeController()
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

  @Post('signup')
  public async signup(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.signUp(createUserDto);
    if (!tokens) {
      throw new ConflictException();
    }
    return res.redirect('signin');
  }

  @Post('login')
  public async login(@Body() loginDto: LoginDto, @Res() res: Response) {
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
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      maxAge: 604800000, // 7 days in milliseconds
    });
    return res.redirect('/');
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  public logout(@Req() req: Request, @Res() res: Response) {
    this.authService.logout(req.user['sub']);

    res.cookie('access_token', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.cookie('refresh_token', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.redirect('/signin');
  }
}
