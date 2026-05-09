import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ExtractUserFromRequest } from '../common/decorators/extract-user.decorator';
import { RequiredRoles } from '../common/decorators/required-roles.decorator';
import { GenericResponse } from '../common/utils/http.utils';
import { UserRole } from '../users/enums/user-role.enum';
import { UserEntity } from '../users/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const payload = await this.authService.login(loginDto);
    return new GenericResponse('Login successful', payload);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(UserRole.REVIEWER)
  getProfile(@ExtractUserFromRequest() user: UserEntity) {
    return new GenericResponse('Profile retrieved successfully', user);
  }
}
