import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
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

  public create(user: CreateUserDto): Promise<UserEntity> {
    return this.prisma.user.create({ data: user });
  }

  /* async update(id: number, userData: UpdateUserDto): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...UpdateUserDto,
        updatedAt: new Date(),
      }
    })
  } */

  public delete(id: string): Promise<UserEntity> {
    return this.prisma.user.delete({ where: { id } });
  }
}
