import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ROUNDS_OF_HASHING } from 'src/constants/constants';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();
    this.$use(async (params, next) => {
      if (params.model === 'User' && params.action === 'create') {
        if (params.args.data.password) {
          params.args.data.password = await bcrypt.hash(
            params.args.data.password,
            ROUNDS_OF_HASHING,
          );
        }
      }

      return next(params);
    });
  }
}
