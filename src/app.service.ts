import { UserRepository } from './user/user.repository';
import { TokenRepository } from './auth/token.repository';
import { GroupRepository } from './group/group.repository';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { GroupParticipantRepository } from './group/participant/group-participant.repository';

@Injectable()
export class AppService implements OnApplicationShutdown {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly groupRepository: GroupRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly groupParticipantRepository: GroupParticipantRepository,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    Promise.all([
      await this.userRepository.closeConnection(),
      await this.groupRepository.closeConnection(),
      await this.tokenRepository.closeConnection(),
      await this.groupParticipantRepository.closeConnection(),
    ]);
  }
}
