import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CreateGroupDto {
  @MaxLength(16)
  @MinLength(4)
  @IsNotEmpty()
  @ApiProperty({ description: 'Name of the group.' })
  name: string;

  @MaxLength(64)
  @IsString()
  @ApiProperty({ description: 'Group picture path to file.' })
  picturePath: string;

  @IsUUID()
  @IsString()
  @ApiProperty({ description: 'Id of group creator.' })
  creatorId: string;
}
