import { ApiProperty } from '@nestjs/swagger';
import { TokenWhiteList } from '@prisma/client';

export class TokenWhiteListEntity implements TokenWhiteList {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  deviceInfo: string;

  @ApiProperty()
  createdAt: Date;
}
