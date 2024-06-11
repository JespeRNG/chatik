import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
//import { UserService } from 'src/user/user.service';
import { JWT_ACCESS_SECRET } from 'src/constants/constants';
//import { JWT_ACCESS_SECRET } from 'src/constants/constants';
import { Injectable /*, UnauthorizedException*/ } from '@nestjs/common';

type JwtPayload = {
  sub: string;
  username: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_ACCESS_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
