import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateGroupDto {
  @MaxLength(16)
  @MinLength(4)
  @IsOptional()
  @ApiProperty({
    description: 'Name of the group. Should be between 4 and 16 characters',
    minLength: 4,
    maxLength: 16,
  })
  name?: string;

  @MaxLength(64)
  @MinLength(4)
  @IsOptional()
  @ApiProperty({ description: 'Group picture file name.', maxLength: 64 })
  pictureName?: string;
}
