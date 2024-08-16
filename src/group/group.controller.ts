import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Param,
  Delete,
  Request,
  UseGuards,
  ParseIntPipe,
  Patch,
  BadRequestException,
  Render,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupEntity } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { GroupParticipantService } from './participant/group-participant.service';

@ApiBearerAuth()
@ApiTags('api/groups')
@Controller('api/groups')
export class GroupApiController {
  constructor(
    private readonly groupService: GroupService,
    private readonly groupParticipantService: GroupParticipantService,
  ) {}

  //#region MVC
  @Get('groups')
  @ApiOkResponse({ description: 'The page was successfully opened' })
  @Render('groups/groups')
  @ApiExcludeEndpoint()
  public groupsPage() {
    return;
  }
  //#endregion

  @Post()
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiCreatedResponse({ type: GroupEntity })
  public async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @Request() req,
  ) {
    createGroupDto.creatorId = req.user.id;
    return this.groupService.create(createGroupDto);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiOkResponse({ type: GroupEntity, isArray: true })
  public async getGroups() {
    return this.groupService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOkResponse({ type: GroupEntity })
  public async getGroup(@Param('id', ParseIntPipe) id: string) {
    return this.groupService.findGroup(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOkResponse({ type: GroupEntity })
  public async deleteGroup(@Param('id') id: string) {
    return this.groupService.remove(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiCreatedResponse({ type: GroupEntity })
  public async updateGroup(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    if (!updateGroupDto) {
      throw new BadRequestException('Empty DTO received.');
    }

    return await this.groupService.updateGroup(id, updateGroupDto);
  }

  @Post(':groupId/participant/:userId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiCreatedResponse({ type: GroupEntity })
  public addParticipantToGroup(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
  ) {
    return this.groupParticipantService.createParticipant(groupId, userId);
  }

  @Delete(':groupId/participant/:userId')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiCreatedResponse({ type: GroupEntity })
  public removeParticipantFromGroup(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
  ) {
    return this.groupParticipantService.removeParticipant(groupId, userId);
  }
}
