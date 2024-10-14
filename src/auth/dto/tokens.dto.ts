import { ApiProperty } from '@nestjs/swagger';

export class TokensDto {
  @ApiProperty()
  readonly access_token: string;

  @ApiProperty()
  readonly refresh_token: string;
}
