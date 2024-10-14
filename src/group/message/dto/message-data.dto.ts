import { IsNotEmpty, MinLength, MaxLength, IsUUID } from 'class-validator';

export class MessageDataDto {
  @MaxLength(500)
  @MinLength(1)
  @IsNotEmpty()
  readonly content: string;

  @IsNotEmpty()
  readonly createdAt: Date;

  @IsUUID()
  @IsNotEmpty()
  readonly senderId: string;

  @IsUUID()
  @IsNotEmpty()
  readonly groupId: string;
}
