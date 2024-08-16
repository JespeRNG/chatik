import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const token = req.cookies['access_token'];

    const user = await this.jwtService.decode(token);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isValidToken = await this.redisService.getToken(user.sub);
    if (!isValidToken) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
