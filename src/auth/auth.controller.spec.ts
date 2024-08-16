import { Test, TestingModule } from '@nestjs/testing';
import { AuthApiController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthApiController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthApiController>(AuthApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
