import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, MaxLength, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @MaxLength(500)
  @MinLength(1)
  @IsNotEmpty()
  @ApiProperty()
  readonly content: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  readonly senderId: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  readonly groupId: string;

  readonly createdAt: Date;
}
