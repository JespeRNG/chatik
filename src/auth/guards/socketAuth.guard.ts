import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
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

    const tokenInRedis = await this.redisService.getToken(user.sub);
    if (!tokenInRedis) {
      throw new UnauthorizedException();
    }

    context.switchToWs().getClient().user = user;
    return true;
  }
}
