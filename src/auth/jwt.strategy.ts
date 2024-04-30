import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { JWT_SECRET } from 'src/constants/constants';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      secretOrKey: JWT_SECRET,
    });
  }

  public async validate(payload: { userId: string }) {
    const user = await this.userService.findUserById(payload.userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
