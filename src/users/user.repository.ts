import { User } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.prisma.user.findFirst({ where: { id } });
  }

  async create(user: CreateUserDto): Promise<UserEntity> {
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

  async delete(id: number): Promise<UserEntity> {
    return this.prisma.user.delete({ where: { id } });
  }
}
