import { ApiProperty } from '@nestjs/swagger';

export class TokensDto {
  @ApiProperty()
  readonly accessToken: string;

  @ApiProperty()
  readonly refreshToken: string;
}
