import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GroupInfoDto } from './dto/group-info.dto';
import { UserService } from 'src/user/user.service';
import { GroupRepository } from './group.repository';
import { GroupEntity } from './entities/group.entity';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { MessageService } from './message/message.service';
import { GROUP_PICTURE_DEFAULT_PATH } from 'src/constants/constants';

@Injectable()
export class GroupService {
  constructor(
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly groupRepository: GroupRepository,
  ) {}

  public async create(
    createGroupDto: CreateGroupDto,
    creatorId: string,
  ): Promise<GroupEntity> {
    createGroupDto.pictureName = `${GROUP_PICTURE_DEFAULT_PATH}/${createGroupDto.pictureName}`;

    const groupExists = await this.groupRepository.findByName(
      createGroupDto.name,
    );

    if (groupExists) {
      throw new ConflictException('Group already exists.');
    }

    return this.groupRepository.create(createGroupDto, creatorId);
  }

  public async findAll(): Promise<GroupEntity[]> {
    const groups = await this.groupRepository.findAll();
    if (!groups) throw new NotFoundException('Groups not found.');

    return groups;
  }

  public async findRelated(userId: string): Promise<GroupEntity[] | null> {
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new ConflictException('There is no user with such id.');
    }

    const relatedGroups = await this.groupRepository.findRelated(userId);

    if (relatedGroups.length === 0) {
      return null;
    }

    return relatedGroups;
  }

  public async findGroup(id: string): Promise<GroupEntity> {
    const group = await this.groupRepository.findOne(id);
    if (!group) throw new NotFoundException('Group not found.');

    return group;
  }

  public async findGroupInfo(id: string): Promise<GroupInfoDto> {
    const group = await this.groupRepository.findInfo(id);

    const participants = await Promise.all(
      group.participants.map(async (participantId) => {
        const user = await this.userService.findUserById(participantId);
        return user.username;
      }),
    );

    const creator = (await this.userService.findUserById(group.creatorId))
      .username;

    const groupInfo = new GroupInfoDto();
    groupInfo.name = group.name;
    groupInfo.picture = group.picture;
    groupInfo.participants = participants;
    groupInfo.creator = creator;
    groupInfo.messages = await this.messageService.countMessages(id);
    groupInfo.creatorId = group.creatorId;

    return groupInfo;
  }

  public async remove(id: string): Promise<GroupEntity> {
    const group = await this.findGroup(id);
    return this.groupRepository.delete(group.id);
  }

  public async updateGroup(
    id: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupEntity | null> {
    const group = await this.findGroup(id);

    if (updateGroupDto.pictureName !== null) {
      updateGroupDto.pictureName = `${GROUP_PICTURE_DEFAULT_PATH}/${updateGroupDto.pictureName}`;
    }

    return this.groupRepository.update(group.id, updateGroupDto);
  }
}
