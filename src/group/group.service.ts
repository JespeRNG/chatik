import { GroupRepository } from './group.repository';
import { GroupEntity } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GroupService {
  constructor(private readonly groupRepository: GroupRepository) {}

  public create(createGroupDto: CreateGroupDto): Promise<GroupEntity> {
    return this.groupRepository.create(createGroupDto);
  }

  public async findAll(): Promise<GroupEntity[]> {
    const groups = await this.groupRepository.findAll();
    if (!groups) throw new NotFoundException('Groups not found.');

    return groups;
  }

  public async findGroup(id: string): Promise<GroupEntity> {
    const group = await this.groupRepository.findOne(id);
    if (!group) throw new NotFoundException('Group not found.');

    return group;
  }

  public async remove(id: string): Promise<GroupEntity> {
    const group = await this.findGroup(id);
    return this.groupRepository.delete(group.id);
  }

  public async updateGroup(
    id: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupEntity> {
    const group = await this.findGroup(id);
    return this.groupRepository.update(group.id, updateGroupDto);
  }

  /* public async updateGroup(
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupEntity> {
    if (
      updateGroupDto.participantIdToAdd ||
      updateGroupDto.participantIdToRemove
    ) {
      const createParticipantDto = new CreateParticipantDto();
      createParticipantDto.groupId = updateGroupDto.id;

      if (updateGroupDto.participantIdToAdd) {
        createParticipantDto.userId = updateGroupDto.participantIdToAdd;
        updateGroupDto.participantIdToAdd = (
          await this.participantService.create(createParticipantDto)
        ).id;
      } else {
        createParticipantDto.userId = updateGroupDto.participantIdToRemove;
        updateGroupDto.participantIdToRemove = (
          await this.participantService.remove(createParticipantDto)
        ).id;
      }
    }
    return this.groupRepository.update(updateGroupDto);
  } */
}
