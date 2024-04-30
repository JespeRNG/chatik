import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateGroupDto {
  @MaxLength(16)
  @MinLength(4)
  @IsOptional()
  @ApiProperty({ description: 'Name of the group.' })
  name: string;

  @MaxLength(64)
  @MinLength(4)
  @IsOptional()
  @ApiProperty({ description: 'Group picture path to file.' })
  picturePath: string;
}
