import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
  ParseIntPipe,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GroupEntity } from './entities/group.entity';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupParticipantService } from './participant/group-participant.service';

@ApiTags('groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly groupParticipantService: GroupParticipantService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: GroupEntity })
  public async create(@Body() createGroupDto: CreateGroupDto, @Request() req) {
    createGroupDto.creatorId = req.user.id;
    return this.groupService.create(createGroupDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GroupEntity, isArray: true })
  public async findAll() {
    return this.groupService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GroupEntity })
  public async findOne(@Param('id', ParseIntPipe) id: string) {
    return this.groupService.findGroup(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GroupEntity })
  public async remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: GroupEntity })
  public async update(
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
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: GroupEntity })
  public addParticipantToGroup(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
  ) {
    return this.groupParticipantService.createParticipant(groupId, userId);
  }

  @Delete(':groupId/participant/:userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: GroupEntity })
  public removeParticipantFromGroup(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
  ) {
    return this.groupParticipantService.removeParticipant(groupId, userId);
  }
}
