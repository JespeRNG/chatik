import {
  Controller,
  Get,
  Query,
  Render,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { AuthInterceptor } from 'src/auth/interceptors/auth.interceptor';

@ApiExcludeController()
@UseInterceptors(AuthInterceptor)
@UseFilters(HttpExceptionFilter)
@Controller()
export class GroupViewController {
  constructor(private readonly groupService: GroupService) {}

  @Get('/')
  @Render('groups/groups-menu')
  public groupsMenuPage(): void {
    return;
  }

  @Get('/group')
  @Render('groups/group')
  public async groupPage(
    @Query('groupId') groupId: string,
  ): Promise<{ name: string; picture: string }> {
    const { name, picture } = await this.groupService.findOne(groupId);

    return { name, picture };
  }
}
