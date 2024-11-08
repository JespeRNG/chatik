import { Roles } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/common/prisma.service';
import { BaseRepository } from 'src/common/base.repository';

@Injectable()
export class UserRepository extends BaseRepository {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

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

  public delete(id: string): Promise<UserEntity> {
    return this.prisma.user.delete({ where: { id } });
  }

  public async getRole(id: string): Promise<Roles> {
    return (
      await this.prisma.user.findFirst({
        where: { id },
        select: { role: true },
      })
    ).role;
  }

  public updateRole(userId: string, role: Roles): Promise<UserEntity> {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
    });
  }
}
