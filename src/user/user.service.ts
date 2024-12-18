import { Roles } from '@prisma/client';
import { UserRepository } from './user.repository';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { USER_NOT_FOUND_EXCEPTION } from 'src/constants/constants';

export const roundsOfHashing = 10;

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userRepository.create(createUserDto);
  }

  public async findAllUsers(): Promise<UserEntity[]> {
    const users = await this.userRepository.findAll();

    if (!users) {
      throw new NotFoundException('There are no users in DB yet.');
    }

    return this.userRepository.findAll();
  }

  public async findUserById(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException(USER_NOT_FOUND_EXCEPTION);

    return user;
  }

  public async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      return null;
    }

    return user;
  }

  public async removeUser(userId: string): Promise<UserEntity> {
    const { id } = await this.findUserById(userId);
    return this.userRepository.delete(id);
  }

  public getRole(userId: string): Promise<Roles> {
    return this.userRepository.getRole(userId);
  }

  public async updateRole(userId: string, role: Roles): Promise<UserEntity> {
    const currentUserRole = (await this.userRepository.findById(userId)).role;

    if (currentUserRole === role) {
      return;
    }

    return this.userRepository.updateRole(userId, role);
  }
}
