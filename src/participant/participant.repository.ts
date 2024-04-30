import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ParticipantEntity } from './entities/participant.entity';
import { CreateParticipantDto } from '../group/participant/dto/create-participant.dto';

@Injectable()
export class ParticipantRepository {
  constructor(private readonly prisma: PrismaService) {}

  public create(
    createParticipantDto: CreateParticipantDto,
  ): Promise<ParticipantEntity> {
    return this.prisma.participant.create({
      data: {
        ...createParticipantDto,
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

  public findOne(id: string) {}

  public update() {}

  public delete(id: string) {}
}
