import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { GroupParticipantEntity } from './entities/group-participant.entity';
import { BaseRepository } from 'src/common/base.repository';

@Injectable()
export class GroupParticipantRepository extends BaseRepository {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  public create(
    groupId: string,
    userId: string,
  ): Promise<GroupParticipantEntity> {
    return this.prisma.participant.create({
      data: {
        groupId: groupId,
        userId: userId,
      },
    });
  }

  public async createMany(
    groupId: string,
    userIds: string[],
  ): Promise<GroupParticipantEntity[]> {
    await this.prisma.participant.createMany({
      data: userIds.map((userId) => ({
        groupId,
        userId,
      })),
    });

    const createdParticipants = await this.prisma.participant.findMany({
      where: {
        groupId,
        userId: { in: userIds },
      },
    });

    return createdParticipants;
  }

  public findAll(): Promise<GroupParticipantEntity[]> {
    return this.prisma.participant.findMany({
      include: {
        group: true,
        user: true,
      },
    });
  }

  public findByUserId(userId: string): Promise<GroupParticipantEntity> {
    return this.prisma.participant.findFirst({ where: { userId } });
  }

  public async findByUserIdInGroup(
    groupId: string,
    userId: string,
  ): Promise<GroupParticipantEntity> {
    return this.prisma.participant.findFirst({
      where: { userId, groupId },
    });
  }

  public delete(id: string): Promise<GroupParticipantEntity> {
    return this.prisma.participant.delete({ where: { id } });
  }
}
