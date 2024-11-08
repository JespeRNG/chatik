import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Roles } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { TokensDto } from 'src/auth/dto/tokens.dto';
import { TokenService } from 'src/auth/token.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from 'src/user/entities/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByUsername: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            existsByDeviceInfo: jest.fn(),
            createTokens: jest.fn(),
            createWhitelist: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    tokenService = module.get<TokenService>(TokenService);
  });

  describe('signUp', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
        refreshToken: null,
      };

      const newUser: UserEntity = {
        id: '3274daac-38fb-4332-aad0-3027bbd3ccab',
        username: 'testuser',
        password:
          '$2a$10$llZnN0jyH0TDC/efJxk.1.Q72f2Y6CnRoTwOYxRzJbfWgG8lyKxAi', // A valid hashed password
        createdAt: new Date(),
        role: Roles.user, // Assuming 'Roles' is an enum
      };

      jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(userService, 'createUser').mockResolvedValue(newUser);

      const result = await authService.signUp(createUserDto);
      expect(result).toEqual(newUser);
      expect(userService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        password: 'password123',
        refreshToken: null,
      };

      const existingUser: UserEntity = {
        id: '3274daac-38fb-4332-aad0-3027bbd3ccab',
        username: 'existinguser',
        password: 'hashedpassword',
        createdAt: new Date(),
        role: Roles.user,
      };

      jest.spyOn(userService, 'findByUsername').mockResolvedValue(existingUser);

      await expect(authService.signUp(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('signIn', () => {
    it('should return tokens if login is successful', async () => {
      const username = 'testuser';
      const password = 'password123';
      const deviceInfo = 'device-1';

      const user: UserEntity = {
        id: '3274daac-38fb-4332-aad0-3027bbd3ccab',
        username,
        password: await bcrypt.hash(password, 10),
        createdAt: new Date(),
        role: Roles.user,
      };

      const tokens: TokensDto = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      jest.spyOn(userService, 'findByUsername').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jest.spyOn(tokenService, 'existsByDeviceInfo').mockResolvedValue(null);
      jest.spyOn(tokenService, 'createTokens').mockResolvedValue(tokens);

      const result = await authService.signIn(username, password, deviceInfo);

      expect(result).toEqual(tokens);
      expect(userService.findByUsername).toHaveBeenCalledWith(username);
      expect(tokenService.createTokens).toHaveBeenCalledWith(
        user.id,
        user.username,
      );
      expect(tokenService.createWhitelist).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const username = 'nonexistentuser';
      const password = 'password123';
      const deviceInfo = 'device-1';

      jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);

      await expect(
        authService.signIn(username, password, deviceInfo),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';
      const deviceInfo = 'device-1';

      const user: UserEntity = {
        id: '3274daac-38fb-4332-aad0-3027bbd3ccab',
        username,
        password: await bcrypt.hash('correctpassword', 10),
        createdAt: new Date(),
        role: Roles.user,
      };

      jest.spyOn(userService, 'findByUsername').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(
        authService.signIn(username, password, deviceInfo),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
