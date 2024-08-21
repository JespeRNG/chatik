import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ACCESS_TOKEN_EXPIRY,
  JWT_REFRESH_SECRET,
} from 'src/constants/constants';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const accessToken = req.cookies['access_token'];
    const refreshToken = req.cookies['refresh_token'];

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('No tokens provided.');
    }

    try {
      const decodedAccessToken = (await this.jwtService.decode(
        accessToken,
      )) as any;

      if (decodedAccessToken) {
        const tokenInRedis = await this.redisService.getAccessToken(
          decodedAccessToken.sub,
        );
        if (tokenInRedis) {
          req.user = decodedAccessToken;
          return true;
        }
      }

      if (refreshToken) {
        try {
          const decodedRefreshToken = (await this.jwtService.decode(
            refreshToken,
          )) as any;

          if (decodedRefreshToken) {
            const isValidRefreshToken = await this.redisService.getRefreshToken(
              decodedRefreshToken.sub,
            );
            if (isValidRefreshToken) {
              const username = decodedRefreshToken.username;
              const newAccessToken = await this.jwtService.signAsync(
                { sub: decodedRefreshToken.sub, username },
                { secret: JWT_REFRESH_SECRET, expiresIn: ACCESS_TOKEN_EXPIRY },
              );
              await this.redisService.saveTokens(
                decodedRefreshToken.sub,
                newAccessToken,
                refreshToken,
              );
              res.cookie('access_token', newAccessToken, {
                httpOnly: true,
              });
              req.user = decodedRefreshToken;
              return true;
            }
          }
        } catch (refreshErr) {
          res.redirect('/signin');
        }
      }

      throw new UnauthorizedException(
        'The Access token is invalid or has expired.',
      );
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException(
        'An error occurred during token validation.',
      );
    }
  }
}
