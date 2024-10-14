import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @MaxLength(16)
  @MinLength(4)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Username should be between 4 and 16 characters.',
    minLength: 4,
    maxLength: 16,
  })
  readonly username: string;

  @MaxLength(128)
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'password should be between 6 and 128 characters.',
    minLength: 6,
    maxLength: 128,
  })
  readonly password: string;
}
