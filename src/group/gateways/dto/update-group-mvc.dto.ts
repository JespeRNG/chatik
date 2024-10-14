import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateGroupMvcDto {
  @IsUUID()
  groupId: string;

  @MaxLength(16)
  @MinLength(4)
  @IsOptional()
  name?: string;

  @MaxLength(64)
  @MinLength(4)
  @IsOptional()
  pictureName?: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(16, { each: true })
  @MinLength(4, { each: true })
  @IsOptional()
  usersToAdd?: string[];
}
