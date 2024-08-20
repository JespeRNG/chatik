import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GroupRepository } from './group.repository';
import { GroupEntity } from './entities/group.entity';
import { UpdateGroupDto } from './dto/update-group.dto';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly userService: UserService,
  ) {}

  public create(
    createGroupDto: CreateGroupDto,
    creatorId: string,
  ): Promise<GroupEntity> {
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
      throw new ConflictException('There is no user with such id');
    }

    return await this.groupRepository.findRelated(userId);
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
}
