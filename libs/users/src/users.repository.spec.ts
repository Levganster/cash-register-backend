import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from '@app/prisma/prisma.service';
import { UserCreateDto } from './dto/user-create.dto';

describe('Users Repository', () => {
  let repository: UsersRepository;
  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  describe('create', () => {
    const createDto: UserCreateDto = {
      email: 'test@example.com',
      password: 'password',
    };

    it('should create a user successfully', async () => {
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        ...createDto,
      });

      const result = await repository.create(createDto);

      expect(result).toEqual({ id: '1', ...createDto });
    });
  });

  describe('existsById', () => {
    it('should return true when user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });

      const result = await repository.existsById('1');

      expect(result).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.existsById('1');

      expect(result).toBe(false);
    });
  });

  describe('existsByEmail', () => {
    it('should return true when user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });

      const result = await repository.existsByEmail('test@example.com');

      expect(result).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.existsByEmail('test@example.com');

      expect(result).toBe(false);
    });
  });

  describe('findOneById', () => {
    it('should return a user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });

      const result = await repository.findOneById('1');

      expect(result).toEqual({ id: '1' });
    });

    it('should return null when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findOneById('1');

      expect(result).toBeNull();
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });

      const result = await repository.findOneByEmail('test@example.com');

      expect(result).toEqual({ id: '1' });
    });

    it('should return null when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findOneByEmail('test@example.com');

      expect(result).toBeNull();
    });
  });
});
