import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { Controller, Get, Query, Render, UseGuards } from '@nestjs/common';

@ApiExcludeController()
@Controller()
export class GroupViewController {
  constructor() {}

  @Get('/')
  @UseGuards(AuthGuard)
  @Render('groups/groups-menu')
  public groupsMenuPage() {
    return;
  }

  @Get('/group')
  @UseGuards(AuthGuard)
  @Render('groups/group')
  public groupPage(@Query('groupId') groupId: string) {
    return;
  }
}
