import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @MaxLength(16)
  @MinLength(4)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Username should be between 4 and 16 characters.',
    minLength: 4,
    maxLength: 16,
  })
  username: string;

  @MaxLength(128)
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Username should be between 4 and 16 characters.',
    minLength: 4,
    maxLength: 128,
  })
  password: string;

  refreshToken: string;
}
