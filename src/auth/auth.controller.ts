import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { TokensDto } from './dto/tokens.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

@ApiTags('api/auth')
@Controller('api/auth')
export class AuthApiController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({
    description: 'User credentials',
    schema: {
      example: {
        username: 'username',
        password: 'password',
      },
    },
  })
  @ApiResponse({
    status: 201,
    type: TokensDto,
    description: 'User was created and tokens were returned',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists.',
  })
  public signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in and return tokens' })
  @ApiOkResponse({ type: TokensDto })
  @ApiResponse({
    status: 404,
    description: 'No user found for username: ${username}',
  })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  public signin(@Body() { username, password }: LoginDto) {
    return this.authService.signIn(username, password);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log user out' })
  @ApiOkResponse({ description: 'A user was logged out successfully' })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  public logout(@Req() req: Request) {
    this.authService.logout(req.user['sub']);
    return { message: 'Logged out successfully.' };
  }

  //To test it you should put refresh token as a bearer token in the Authorization tab in postman
  @Get('refresh')
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiOkResponse({ description: 'Tokens were refreshed successfully' })
  @ApiResponse({ status: 403, description: 'Access Denied' })
  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  public refreshTokens(@Req() req: Request) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];

    return this.authService.refreshTokens(userId, refreshToken);
  }
}
