import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @MaxLength(16)
  @MinLength(4)
  @IsNotEmpty()
  @ApiProperty({ description: 'Name of the group.' })
  name: string;

  @MaxLength(64)
  @IsString()
  @ApiProperty({ description: 'Group picture path to file.' })
  pictureName: string;
}
