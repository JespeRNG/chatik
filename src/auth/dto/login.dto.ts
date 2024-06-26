import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @MaxLength(16)
  @MinLength(4)
  @IsNotEmpty()
  @ApiProperty()
  username: string;

  @MaxLength(128)
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
