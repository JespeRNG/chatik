import { Injectable } from '@nestjs/common';
import { GroupEntity } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  public create(groupDto: CreateGroupDto): Promise<GroupEntity> {
    return this.prisma.group.create({
      data: {
        name: groupDto.name,
        picture: groupDto.picturePath,
        creator: {
          connect: {
            id: groupDto.creatorId,
          },
        },
      },
      include: {
        creator: true,
        participants: true,
      },
    });
  }

  public findAll(): Promise<GroupEntity[]> {
    return this.prisma.group.findMany({
      include: {
        creator: true,
        participants: true,
      },
    });
  }

  public findOne(id: string): Promise<GroupEntity | null> {
    return this.prisma.group.findFirst({
      where: { id },
      include: {
        creator: true,
        participants: true,
      },
    });
  }

  public update(
    id: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupEntity> {
    const { name, picturePath } = updateGroupDto;

    return this.prisma.group.update({
      where: { id },
      data: {
        name: name || undefined,
        picture: picturePath || undefined,
      },
      include: {
        participants: true,
      },
    });
  }

  public delete(id: string): Promise<GroupEntity> {
    return this.prisma.group.delete({
      where: { id },
      include: {
        creator: true,
        participants: true,
      },
    });
  }
}
