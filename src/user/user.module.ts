import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserApiController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [UserApiController],
  providers: [UserService, UserRepository],
  imports: [PrismaModule],
  exports: [UserService],
})
export class UserModule {}
