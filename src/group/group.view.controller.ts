import {
  Controller,
  Get,
  Query,
  Render,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters/http-exception.filter';

@ApiExcludeController()
@UseFilters(HttpExceptionFilter)
@Controller()
export class GroupViewController {
  constructor(private readonly groupService: GroupService) {}

  @Get('/')
  @UseGuards(AuthGuard)
  @Render('groups/groups-menu')
  public groupsMenuPage(): void {
    return;
  }

  @Get('/group')
  @UseGuards(AuthGuard)
  @Render('groups/group')
  public async groupPage(
    @Query('groupId') groupId: string,
  ): Promise<{ name: string; picture: string }> {
    const { name, picture } = await this.groupService.findGroup(groupId);

    return { name, picture };
  }
}
