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
  @ApiProperty({
    description: 'Name of the group. Should be between 4 and 16 characters',
    minLength: 4,
    maxLength: 16,
  })
  name: string;

  @MaxLength(64)
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Group picture file name.', maxLength: 64 })
  pictureName: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(16, { each: true })
  @MinLength(4, { each: true })
  @IsOptional()
  usersToAdd?: string[];
}
