import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GroupService } from '../group.service';
import { UserService } from 'src/user/user.service';
import { USER_NOT_FOUND_EXCEPTION } from 'src/constants/constants';
import { GroupParticipantRepository } from './group-participant.repository';
import { GroupParticipantEntity } from './entities/group-participant.entity';

@Injectable()
export class GroupParticipantService {
  constructor(
    private readonly userService: UserService,
    private readonly groupService: GroupService,
    private readonly groupParticipantRepository: GroupParticipantRepository,
  ) {}

  public async createParticipant(
    groupId: string,
    userId: string,
  ): Promise<GroupParticipantEntity> {
    await this.validateParticipant(groupId, userId);

    const group = await this.groupService.findOne(groupId);
    if (group.creatorId === userId) {
      throw new ConflictException(
        'Group creator cannot be added to the group.',
      );
    }

    return this.groupParticipantRepository.create(groupId, userId);
  }

  public async createParticipants(
    groupId: string,
    userIds: string[],
  ): Promise<GroupParticipantEntity[]> {
    const group = await this.groupService.findOne(groupId);

    for (const userId of userIds) {
      await this.validateParticipant(groupId, userId);

      if (group.creatorId === userId) {
        throw new ConflictException(
          'Group creator cannot be added to the group.',
        );
      }
    }

    return await this.groupParticipantRepository.createMany(groupId, userIds);
  }

  public async removeParticipant(
    groupId: string,
    userId: string,
  ): Promise<GroupParticipantEntity> {
    const existingParticipant =
      await this.groupParticipantRepository.findByUserId(userId);
    if (!existingParticipant) {
      throw new ConflictException(`Participant doesn't exist in this group.`);
    }

    const group = await this.groupService.findOne(groupId);
    if (group.creatorId === userId) {
      throw new ConflictException(
        'Group creator cannot be removed from the group.',
      );
    }

    const participantId = (
      await this.groupParticipantRepository.findByUserId(userId)
    ).id;
    return this.groupParticipantRepository.delete(participantId);
  }

  private async validateParticipant(
    groupId: string,
    userId: string,
  ): Promise<void> {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND_EXCEPTION);
    }

    const group = await this.groupService.findOne(groupId);
    if (!group) {
      throw new NotFoundException('Group not found.');
    }

    const existingParticipantInGroup =
      await this.groupParticipantRepository.findByUserIdInGroup(
        groupId,
        userId,
      );
    if (existingParticipantInGroup) {
      throw new ConflictException('Participant is already in this group.');
    }
  }
}
