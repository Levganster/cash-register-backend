import { Test } from '@nestjs/testing';

import { TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PasswordService } from '@app/password';
import { UsersRepository } from './users.repository';
import { UserCreateDto } from './dto/user-create.dto';
import { I18nService } from 'nestjs-i18n';
import { NotFoundException } from '@nestjs/common';
import { User } from '@app/common';

describe('UsersService', () => {
  let service: UsersService;
  const mockPasswordService = {
    hashPassword: jest.fn(),
  };
  const mockUsersRepository = {
    create: jest.fn(),
    findOneById: jest.fn(),
    findOneByEmail: jest.fn(),
    update: jest.fn(),
    existsById: jest.fn(),
    existsByEmail: jest.fn(),
  };
  const mockI18nService = {
    t: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: I18nService, useValue: mockI18nService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto: UserCreateDto = {
        email: 'test@example.com',
        password: 'password',
      };

      mockUsersRepository.existsByEmail.mockResolvedValue(false);
      mockPasswordService.hashPassword.mockResolvedValue('hashedPassword');
      mockUsersRepository.create.mockResolvedValue({ id: '1' });

      const result = await service.create(dto);

      expect(result).toEqual({ id: '1' });
    });
  });

  describe('findOneById', () => {
    it('should return a user when found', async () => {
      mockUsersRepository.findOneById.mockResolvedValue({ id: '1' });

      const result = await service.findOneById('1');

      expect(result).toEqual({ id: '1' });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUsersRepository.findOneById.mockResolvedValue(null);
      mockI18nService.t.mockReturnValue('User not found');

      await expect(service.findOneById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user when found', async () => {
      mockUsersRepository.findOneByEmail.mockResolvedValue({ id: '1' });

      const result = await service.findOneByEmail('test@example.com');

      expect(result).toEqual({ id: '1' });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUsersRepository.findOneByEmail.mockResolvedValue(null);
      mockI18nService.t.mockReturnValue('User not found');

      await expect(service.findOneByEmail('test@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('ensureExistsById', () => {
    it('should return undefined when user exists', async () => {
      mockUsersRepository.existsById.mockResolvedValue(true);

      const result = await service.ensureExistsById('1');

      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUsersRepository.existsById.mockResolvedValue(false);
      mockI18nService.t.mockReturnValue('User not found');

      await expect(service.ensureExistsById('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
