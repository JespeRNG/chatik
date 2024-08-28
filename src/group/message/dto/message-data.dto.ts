import { IsNotEmpty, MinLength, MaxLength, IsUUID } from 'class-validator';

export class MessageDataDto {
  @MaxLength(500)
  @MinLength(1)
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  createdAt: Date;

  @IsUUID()
  @IsNotEmpty()
  senderId: string;

  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}
