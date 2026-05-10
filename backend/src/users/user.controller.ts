import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { GenericResponse } from '../common/utils/http.utils';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const createdUser = await this.userService.createUser(createUserDto);
    return new GenericResponse('User created successfully.', createdUser);
  }

  @Get()
  async getAllUsers() {
    const payload = await this.userService.getAll();
    return new GenericResponse('Users retrieved successfully.', payload);
  }

  @Get(':id')
  async getUserById(
    @Param('id', ParseUUIDPipe)
    id: string,
  ) {
    const payload = await this.userService.getById(id);
    return new GenericResponse('User retrieved successfully.', payload);
  }
}
