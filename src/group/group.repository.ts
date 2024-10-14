import { Injectable } from '@nestjs/common';
import { GroupEntity } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GroupInfoEntity } from './entities/group-info.entity';

@Injectable()
export class GroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  public create(
    groupDto: CreateGroupDto,
    creatorId: string,
  ): Promise<GroupEntity> {
    return this.prisma.group.create({
      data: {
        name: groupDto.name,
        picture: groupDto.pictureName || null,
        creator: {
          connect: {
            id: creatorId,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        participants: true,
      },
    });
  }

  public findAll(): Promise<GroupEntity[]> {
    return this.prisma.group.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        participants: true,
      },
    });
  }

  public findOne(id: string): Promise<GroupEntity | null> {
    return this.prisma.group.findFirst({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        participants: true,
      },
    });
  }

  public async findInfo(id: string): Promise<GroupInfoEntity | null> {
    const group = await this.prisma.group.findFirst({
      where: { id },
      include: {
        creator: true,
        participants: true,
      },
    });

    if (!group) return null;

    const participants = group.participants.map(
      (participant) => participant.userId,
    );
    return { ...group, participants };
  }

  public async findRelated(userId: string): Promise<GroupEntity[]> {
    return this.prisma.group.findMany({
      where: {
        OR: [
          {
            creatorId: userId,
          },
          {
            participants: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
    });
  }

  public update(
    id: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupEntity> {
    const { name, pictureName: picturePath } = updateGroupDto;

    const updateData: any = {
      name: name || undefined,
    };

    if (picturePath !== null) {
      updateData.picture = picturePath;
    }

    return this.prisma.group.update({
      where: { id },
      data: updateData,
      include: {
        participants: true,
      },
    });
  }

  public delete(id: string): Promise<GroupEntity> {
    return this.prisma.group.delete({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        participants: true,
      },
    });
  }

  public findByName(groupName: string): Promise<GroupEntity> {
    return this.prisma.group.findUnique({ where: { name: groupName } });
  }
}
