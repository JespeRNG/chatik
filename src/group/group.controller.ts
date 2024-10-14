import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
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
  Patch,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request as req } from 'express';
import { GroupService } from './group.service';
import { GroupEntity } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { MessageService } from './message/message.service';
import { MessageEntity } from './message/entities/message.entity';
import { CreateMessageDto } from './message/dto/create-message.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { GroupParticipantService } from './participant/group-participant.service';
import { GroupParticipantEntity } from './participant/entities/group-participant.entity';

@ApiBearerAuth()
@ApiTags('api/groups')
@Controller('api/groups')
export class GroupApiController {
  constructor(
    private readonly groupService: GroupService,
    private readonly messageService: MessageService,
    private readonly groupParticipantService: GroupParticipantService,
  ) {}

  //#region Group
  @Post()
  @ApiOperation({ summary: 'Creates a group' })
  @ApiBody({
    description: 'Group data for creating',
    type: CreateGroupDto,
  })
  @ApiCreatedResponse({ type: GroupEntity })
  @ApiResponse({ status: 409, description: 'Group already exists.' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @Request() req: req,
  ): Promise<GroupEntity> {
    const creatorId = req.user['sub'];

    return this.groupService.create(createGroupDto, creatorId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups' })
  @ApiOkResponse({ type: GroupEntity, isArray: true })
  @ApiResponse({ status: 404, description: 'Groups not found.' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public async getGroups(): Promise<GroupEntity[]> {
    return this.groupService.findAll();
  }

  @Get('related')
  @ApiOperation({ summary: 'Get all related groups to user' })
  @ApiOkResponse({
    type: GroupEntity,
    isArray: true,
    description: 'Array of related groups or null if none found.',
  })
  @ApiResponse({ status: 409, description: 'There is no user with such id.' })
  @ApiResponse({
    status: 404,
    description: 'There are no related groups to this user.',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public async getRelatedGroups(@Request() req: req): Promise<GroupEntity[]> {
    const userId = req.user['sub'];

    return await this.groupService.findRelated(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a group by ID' })
  @ApiOkResponse({ type: GroupEntity })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the group',
    type: String,
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public async getGroup(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GroupEntity> {
    return this.groupService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove group by ID' })
  @ApiOkResponse({ type: GroupEntity })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public async deleteGroup(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GroupEntity> {
    return this.groupService.remove(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group by ID' })
  @ApiBody({
    description: 'Group data for updating',
    type: UpdateGroupDto,
  })
  @ApiOkResponse({ type: GroupEntity })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  @ApiResponse({ status: 400, description: 'Empty DTO received.' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public async updateGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<GroupEntity> {
    if (!updateGroupDto) {
      throw new BadRequestException('Empty DTO received.');
    }

    return await this.groupService.updateGroup(id, updateGroupDto);
  }
  //#endregion

  //#region Participant
  @Post(':groupId/participant/:userId')
  @ApiOperation({ summary: 'Add a new participant to group' })
  @ApiParam({
    name: 'groupId',
    required: true,
    description: 'ID of the group',
    type: String,
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'ID of the user',
    type: String,
  })
  @ApiResponse({ status: 404, description: 'Group or user not found.' })
  @ApiResponse({
    status: 409,
    description: 'Participant is already in this group.',
  })
  @ApiCreatedResponse({ type: GroupEntity })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public addParticipantToGroup(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<GroupParticipantEntity> {
    return this.groupParticipantService.createParticipant(groupId, userId);
  }

  @Delete(':groupId/participant/:userId')
  @ApiOperation({ summary: 'Remove participant from group' })
  @ApiParam({
    name: 'groupId',
    required: true,
    description: 'ID of the group',
    type: String,
  })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'ID of the user',
    type: String,
  })
  @ApiOkResponse({
    type: GroupEntity,
    description: 'User was removed successfully.',
  })
  @ApiResponse({
    status: 409,
    description: `Participant doesn't exist in this group.`,
  })
  @ApiResponse({
    status: 403,
    description: `Group creator cannot be removed from the group.`,
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public removeParticipantFromGroup(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<GroupParticipantEntity> {
    return this.groupParticipantService.removeParticipant(groupId, userId);
  }
  //#endregion

  //#region Message
  @Post('/message')
  @ApiOperation({ summary: 'Creates a new message in group' })
  @ApiBody({
    description: 'Message data for creating',
    type: CreateMessageDto,
  })
  @ApiCreatedResponse({
    type: MessageEntity,
    description: 'A message was successfully created.',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public createMessage(
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<MessageEntity> {
    return this.messageService.createMessage(createMessageDto);
  }
  //#endregion
}
