import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getById(id: string) {
    return await this.findOrThrow({ id });
  }

  async getAll() {
    return await this.userRepository.find();
  }

  async findAndThrow(whereOptions: FindOptionsWhere<UserEntity>) {
    const user = await this.userRepository.findOneBy(whereOptions);
    if (user) {
      throw new ConflictException(
        'User with the specified details already exists.',
      );
    }
    return user;
  }

  protected async getUserByPropNullable(
    whereOptions: FindOptionsWhere<UserEntity>,
  ) {
    const user = await this.userRepository.findOneBy(whereOptions);
    return user;
  }

  protected async findOrThrow(whereOptions: FindOptionsWhere<UserEntity>) {
    const user = await this.userRepository.findOneBy(whereOptions);
    if (!user)
      throw new NotFoundException(
        'User with the specified details does not exist.',
      );
    return user;
  }
}
