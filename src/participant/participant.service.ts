import { Injectable } from '@nestjs/common';
import { ParticipantEntity } from './entities/participant.entity';
import { ParticipantRepository } from './participant.repository';
import { CreateParticipantDto } from '../group/participant/dto/create-participant.dto';

@Injectable()
export class ParticipantService {
  constructor(private readonly participantRepository: ParticipantRepository) {}

  public create(
    createParticipantDto: CreateParticipantDto,
  ): Promise<ParticipantEntity> {
    return this.participantRepository.create(createParticipantDto);
  }

  /* public remove(userId: string): Promise<ParticipantEntity> {
    return this.participantRepository.delete();
  } */
}
