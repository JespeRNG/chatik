import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, MaxLength, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @MaxLength(500)
  @MinLength(1)
  @IsNotEmpty()
  @ApiProperty({
    description:
      'Message in the group. Should be between 1 and 500 characters.',
    maxLength: 500,
    minLength: 1,
  })
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
