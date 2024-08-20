import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Controller, Get, Render, UseGuards } from '@nestjs/common';

@Controller()
export class GroupViewController {
  constructor() {}

  @Get('/')
  @UseGuards(AuthGuard)
  @Render('groups/groups-menu')
  public signupPage() {
    return;
  }
}
