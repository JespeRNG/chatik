import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  private extractAccessToken(cookieString: string) {
    const cookies = cookieString.split('; ');
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === 'access_token') {
        return value;
      }
    }
    return null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = this.extractAccessToken(client.handshake.headers.cookie);

    if (!token) {
      throw new UnauthorizedException();
    }

    const user = this.jwtService.decode(token);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isUserValid = (await this.userService.findUserById(user['sub']))
      ? true
      : false;

    if (!isUserValid) {
      throw new UnauthorizedException('User is not valid');
    }

    const tokenInRedis = await this.redisService.getAccessToken(user.sub);
    if (!tokenInRedis) {
      throw new UnauthorizedException();
    }

    context.switchToWs().getClient().user = user;
    return true;
  }
}
