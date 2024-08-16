import { Redis } from 'ioredis';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private readonly redisClient: Redis) {}

  use(req: Request, res: Response, next: NextFunction) {
    const RedisStore = connectRedis(session);

    session({
      store: new RedisStore({ client: this.redisClient }),
      secret: 'superSecret',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    })(req, res, next);
  }
}
