import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';

@ApiBearerAuth()
@ApiTags('api/users')
@Controller('api/users')
export class UserApiController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOkResponse({
    type: UserEntity,
    isArray: true,
    description: 'All user successfully returned.',
  })
  @ApiResponse({ status: 409, description: 'There are no users in DB yet.' })
  public async getUsers() {
    const users = await this.userService.findAllUsers();
    return users.map((user) => new UserEntity(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the user',
    type: String,
  })
  @UseGuards(AccessTokenGuard)
  @ApiOkResponse({
    type: UserEntity,
    description: 'User was successfully created.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public async getUser(@Param('id') userId: string) {
    return new UserEntity(await this.userService.findUserById(userId));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove user by ID' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID of the user',
    type: String,
  })
  @UseGuards(AccessTokenGuard)
  @ApiOkResponse({ type: UserEntity })
  @ApiResponse({ status: 404, description: 'User not found.' })
  public async deleteUser(@Param('id') id: string) {
    return new UserEntity(await this.userService.removeUser(id));
  }
}
