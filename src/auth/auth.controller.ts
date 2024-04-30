import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { AuthEntity } from './entity/auth.entity';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: AuthEntity })
  public login(@Body() { username, password }: LoginDto) {
    return this.authService.login(username, password);
  }
}
