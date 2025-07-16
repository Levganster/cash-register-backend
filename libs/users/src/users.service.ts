import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserCreateDto } from './dto/user-create.dto';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserSearchDto } from './dto/user.search.dto';
import { I18nService } from 'nestjs-i18n';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { User } from '@app/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly i18n: I18nService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(dto: UserCreateDto): Promise<User> {
    const user = await this.usersRepository.create({
      ...dto,
    });
    return user;
  }

  async findOneByTgId(tgId: string): Promise<User> {
    const cachedUser = await this.cacheManager.get<User>(`user:${tgId}`);
    if (cachedUser) {
      this.logger.log(`User ${tgId} found in cache`);
      return cachedUser;
    }

    const user = await this.usersRepository.findOneByTgId(tgId);
    if (!user) {
      this.logger.warn(`User ${tgId} not found`);
      throw new NotFoundException(this.i18n.t('errors.user.notFound'));
    }

    this.logger.log(`User ${tgId} found in db, setting to cache`);
    await this.cacheManager.set(`user:${tgId}`, user, 1000 * 60);
    return user;
  }

  async findOneById(id: string): Promise<User> {
    const cachedUser = await this.cacheManager.get<User>(`user:${id}`);
    if (cachedUser) {
      this.logger.log(`User ${id} found in cache`);
      return cachedUser;
    }

    const user = await this.usersRepository.findOneById(id);
    if (!user) {
      this.logger.warn(`User ${id} not found`);
      throw new NotFoundException(this.i18n.t('errors.user.notFound'));
    }

    this.logger.log(`User ${id} found in db, setting to cache`);
    await this.cacheManager.set(`user:${id}`, user, 1000 * 60);
    return user;
  }

  async ensureExistsById(id: string): Promise<void> {
    const exists = await this.usersRepository.existsById(id);
    if (!exists) {
      throw new NotFoundException(this.i18n.t('errors.user.notFound'));
    }
  }

  async search(dto: UserSearchDto): Promise<User[]> {
    return this.usersRepository.search(dto);
  }

  async update(id: string, dto: UserUpdateDto): Promise<User> {
    await this.ensureExistsById(id);

    const user = await this.usersRepository.update(id, dto);

    await this.cacheManager.del(`user:${id}`);
    await this.cacheManager.del(`user:${user.tgId}`);

    return user;
  }

  async delete(id: string): Promise<User> {
    await this.ensureExistsById(id);

    const user = await this.usersRepository.delete(id);

    await this.cacheManager.del(`user:${id}`);
    await this.cacheManager.del(`user:${user.tgId}`);

    return user;
  }
}
