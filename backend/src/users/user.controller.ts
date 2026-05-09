import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { GenericResponse } from '../common/utils/http.utils';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
