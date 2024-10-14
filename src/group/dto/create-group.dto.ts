import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateGroupDto {
  @MaxLength(16)
  @MinLength(4)
  @IsNotEmpty()
  @ApiProperty({ description: 'Name of the group.' })
  name: string;

  @MaxLength(64)
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Group picture path to file.' })
  pictureName: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(16, { each: true })
  @MinLength(4, { each: true })
  @IsOptional()
  usersToAdd?: string[];
}
