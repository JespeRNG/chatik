import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/user/user.service';
import { JWT_ACCESS_SECRET } from 'src/constants/constants';
import { IS_SKIP_AUTH_KEY } from './skip-auth.guard';

@Injectable()
export class HeaderAuthGuard implements CanActivate {
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

    const request = context.switchToHttp().getRequest();
    const accessToken = this.extractTokenFromHeader(request);

    if (!accessToken) {
      throw new UnauthorizedException('No tokens provided.');
    }
    const decodedToken = this.jwtService.verify(accessToken, {
      secret: JWT_ACCESS_SECRET,
    });

    const user = await this.userService.findUserById(decodedToken['sub']);
    if (!user) {
      throw new UnauthorizedException('Not valid user.');
    }

    request['user'] = decodedToken;
    request['user']._meta = {
      accessToken: accessToken,
    };

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
