import { UserRepository } from './user.repository';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    createUserDto.password = hashedPassword;

    return this.userRepository.create(createUserDto);
  }

  async findAllUsers() {
    return this.userRepository.findAll();
  }

  async findUserById(userId: number) {
    const user = await this.userRepository.findById(userId);

    if (!user) throw new NotFoundException('User not found.');

    return user;
  }

  /* async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.findUserById(userId);
    return this.userRepository.update(userId, updateUserDto);
  } */

  async removeUser(userId: number) {
    const user = await this.findUserById(userId);
    return this.userRepository.delete(userId);
  }
}
