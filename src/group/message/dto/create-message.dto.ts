import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, MaxLength, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @MaxLength(500)
  @MinLength(1)
  @IsNotEmpty()
  @ApiProperty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  senderId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  groupId: string;

  createdAt: Date;
}
