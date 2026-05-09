import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { HashEncryption } from '../common/utils/hash.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly hashEncryption: HashEncryption,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    await this.findAndThrow({
      email: createUserDto.email,
    });

    const hashedPassword = await this.hashEncryption.hash(
      createUserDto.password,
    );
    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });

    const createdUser = await this.userRepository.save(user);
    return this.removeSensitiveFields(createdUser);
  }

  async getById(id: string) {
    return await this.findOrThrow({ id });
  }

  async findByEmail(email: string) {
    return await this.getUserByPropNullable({ email });
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

  removeSensitiveFields(user: UserEntity) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...exposableUser } = user;
    return exposableUser;
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
