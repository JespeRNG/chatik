import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { GroupModule } from '../group/group.module';
import { ParticipantModule } from 'src/participant/participant.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    GroupModule,
    ParticipantModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
