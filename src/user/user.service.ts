import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { USER_NOT_FOUND_EXCEPTION } from 'src/constants/constants';

export const roundsOfHashing = 10;

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findByUsername(
      createUserDto.username,
    );
    if (user) throw new ConflictException('User already exists.');

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      roundsOfHashing,
    );

    return this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  public findAllUsers(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }

  public async findUserById(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundException(USER_NOT_FOUND_EXCEPTION);

    return user;
  }

  public async findByUsername(username: string): Promise<UserEntity> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new NotFoundException(USER_NOT_FOUND_EXCEPTION);

    return user;
  }

  public async removeUser(userId: string): Promise<UserEntity> {
    const { id } = await this.findUserById(userId);
    return this.userRepository.delete(id);
  }
}
