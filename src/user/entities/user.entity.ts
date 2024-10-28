import { Roles } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  createdAt: Date;

  @Exclude()
  password: string;

  @ApiProperty()
  role: Roles;
}
