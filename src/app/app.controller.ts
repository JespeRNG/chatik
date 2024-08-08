import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { join } from 'path';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';

@Controller()
export class AppController {
  @Get('signup')
  getSignupPage(@Res() res) {
    return res.sendFile(join(__dirname, '../../public/signup.html'));
  }

  @Get('signin')
  getSigninPage(@Res() res) {
    return res.sendFile(join(__dirname, '../../public/signin.html'));
  }

  @UseGuards(AccessTokenGuard)
  @Get('home')
  getHomePage(@Res() res) {
    return res.sendFile(join(__dirname, '../../public/home.html'));
  }
}
