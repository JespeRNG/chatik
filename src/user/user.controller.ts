import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOkResponse({ type: UserEntity, isArray: true })
  public async getUsers() {
    const users = await this.userService.findAllUsers();
    return users.map((user) => new UserEntity(user));
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOkResponse({ type: UserEntity })
  public async getUser(@Param('id') userId: string) {
    return new UserEntity(await this.userService.findUserById(userId));
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOkResponse({ type: UserEntity })
  public async deleteUser(@Param('id') id: string) {
    return new UserEntity(await this.userService.removeUser(id));
  }
}
