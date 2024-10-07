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
  ParseIntPipe,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupEntity } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { MessageService } from './message/message.service';
import { MessageEntity } from './message/entities/message.entity';
import { CreateMessageDto } from './message/dto/create-message.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { GroupParticipantService } from './participant/group-participant.service';

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
    schema: {
      example: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'strongPassword123',
      },
    },
  })
  @ApiCreatedResponse({ type: GroupEntity })
  @ApiResponse({ status: 409, description: 'Group already exists.' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @Request() req,
  ) {
    const creatorId = req.user.sub;
    return this.groupService.create(createGroupDto, creatorId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups' })
  @ApiOkResponse({ type: GroupEntity, isArray: true })
  @ApiResponse({ status: 404, description: 'Groups not found.' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public async getGroups() {
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
  public async getRelatedGroups(@Request() req) {
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
  public async getGroup(@Param('id') id: string) {
    return this.groupService.findGroup(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove group by ID' })
  @ApiOkResponse({ type: GroupEntity })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public async deleteGroup(@Param('id') id: string) {
    return this.groupService.remove(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update group by ID' })
  @ApiBody({
    description: 'Group data for updating',
    schema: {
      example: {
        name: 'Some Group',
        pictureName: 'somePicture.jpg',
      },
    },
  })
  @ApiOkResponse({ type: GroupEntity })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  @ApiResponse({ status: 400, description: 'Empty DTO received.' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public async updateGroup(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
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
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
  ) {
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
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
  ) {
    return this.groupParticipantService.removeParticipant(groupId, userId);
  }
  //#endregion

  //#region Message
  @Post('/message')
  @ApiOperation({ summary: 'Creates a new message in group' })
  @ApiBody({
    description: 'Message data for creating',
    schema: {
      example: {
        content: `It's an example message.`,
        senderId: 'senderId',
        groupId: 'groupId',
      },
    },
  })
  @ApiCreatedResponse({
    type: MessageEntity,
    description: 'A message was successfully created.',
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public createMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.createMessage(createMessageDto);
  }
  //#endregion
}
