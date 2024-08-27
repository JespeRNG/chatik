import { Injectable } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { MessageEntity } from './entities/message.entity';
import { UserRepository } from 'src/user/user.repository';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async createMessage(
    createMessageDto: CreateMessageDto,
  ): Promise<MessageEntity> {
    return this.messageRepository.create(createMessageDto);
  }

  public async saveMessagesToDb(
    groupId: string,
    createMessageDtos: CreateMessageDto[],
  ) {
    await this.messageRepository.createMany(groupId, createMessageDtos);
  }

  public async getSenderUsername(senderId: string): Promise<string> {
    return (await this.userRepository.findById(senderId)).username;
  }

  public async getAllMessagesFromGroup(
    groupId: string,
  ): Promise<MessageEntity[]> {
    return await this.messageRepository.getAllMessages(groupId);
  }
}
