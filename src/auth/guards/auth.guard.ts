import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import {
  JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRY,
  JWT_ACCESS_SECRET,
} from 'src/constants/constants';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const { access_token: accessToken, refresh_token: refreshToken } =
      req.cookies;

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('No tokens provided.');
    }

    try {
      const validatedAccessToken = await this.validateAccessToken(
        accessToken,
        req,
        res,
      );
      if (accessToken && validatedAccessToken) {
        return true;
      }

      if (
        refreshToken &&
        (await this.validateRefreshToken(refreshToken, req, res))
      ) {
        return true;
      }

      throw new UnauthorizedException('Invalid or expired tokens.');
    } catch (err) {
      this.clearTokens(res);
      throw new UnauthorizedException(
        'An error occurred during token validation.',
      );
    }
  }

  private async validateAccessToken(
    token: string,
    req: Request,
    res: Response,
  ): Promise<boolean> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: JWT_ACCESS_SECRET,
      });
      const tokenInRedis = await this.redisService.getAccessToken(decoded.sub);

      if (tokenInRedis) {
        req.user = decoded;
        return true;
      } else {
        this.clearAccessToken(res);
      }
    } catch (err) {
      this.clearAccessToken(res);
    }
    return false;
  }

  private async validateRefreshToken(
    token: string,
    req: Request,
    res: Response,
  ): Promise<boolean> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: JWT_REFRESH_SECRET,
      });
      const tokenInRedis = await this.redisService.getRefreshToken(decoded.sub);

      if (tokenInRedis) {
        const newAccessToken = await this.jwtService.signAsync(
          { sub: decoded.sub, username: decoded.username },
          { secret: JWT_REFRESH_SECRET, expiresIn: ACCESS_TOKEN_EXPIRY },
        );

        await this.redisService.saveTokens(decoded.sub, newAccessToken, token);
        res.cookie('access_token', newAccessToken, { httpOnly: true });
        req.user = decoded;
        return true;
      } else {
        this.clearRefreshToken(res);
      }
    } catch {
      this.clearRefreshToken(res);
    }
    return false;
  }

  private clearAccessToken(res: Response): void {
    res.clearCookie('access_token');
  }

  private clearRefreshToken(res: Response): void {
    res.clearCookie('refresh_token');
  }

  private clearTokens(res: Response): void {
    this.clearAccessToken(res);
    this.clearRefreshToken(res);
  }
}
