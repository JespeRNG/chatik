import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, GroupModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
