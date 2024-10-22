import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/user/user.service';
import { IS_SKIP_AUTH_KEY } from './skip-auth.guard';
import { JWT_ACCESS_SECRET } from 'src/constants/constants';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(
      IS_SKIP_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isSkipAuth) {
      return true;
    }

    let request: Request;
    let accessToken: string;
    let wsClient = null;

    if (context.getType() === 'http') {
      request = context.switchToHttp().getRequest();
      ({ accessToken } = request.cookies);
    } else {
      request = context.switchToWs().getClient().handshake;
      wsClient = context.switchToWs().getClient();
      accessToken = this.extractAccessToken(wsClient.handshake.headers.cookie);
    }

    if (!accessToken) {
      throw new UnauthorizedException('No access token.');
    }

    try {
      const decodedToken = this.jwtService.verify(accessToken, {
        secret: JWT_ACCESS_SECRET,
      });

      const user = await this.userService.findUserById(decodedToken['sub']);
      if (!user) {
        throw new UnauthorizedException('Not valid user.');
      }

      wsClient ? (wsClient.user = decodedToken) : (request.user = decodedToken);

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }

  private extractAccessToken(cookieString: string) {
    const cookies = cookieString.split('; ');

    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');

      if (name === 'accessToken') {
        return value;
      }
    }

    return null;
  }
}
