import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  public findAll(): Promise<UserEntity[]> {
    return this.prisma.user.findMany({ include: { participant: true } });
  }

  public findByUsername(username: string): Promise<UserEntity | null> {
    return this.prisma.user.findFirst({ where: { username } });
  }

  public findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findFirst({ where: { id } });
  }

  public create(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.prisma.user.create({ data: createUserDto });
  }

  /* public update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        refreshToken: updateUserDto.refreshToken,
      },
    });
  } */

  public delete(id: string): Promise<UserEntity> {
    return this.prisma.user.delete({ where: { id } });
  }
}
