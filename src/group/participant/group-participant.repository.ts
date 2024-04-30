import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GroupParticipantEntity } from './entities/group-participant.entity';

@Injectable()
export class GroupParticipantRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  public findAll() {
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

  public delete(id: string): Promise<GroupParticipantEntity> {
    return this.prisma.participant.delete({ where: { id } });
  }

  /* public findOne(id: string) {}

  public update() {} */
}
