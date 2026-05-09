import { Body, Controller, Post } from '@nestjs/common';
import { GenericResponse } from '../common/utils/http.utils';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const payload = await this.authService.login(loginDto);
    return new GenericResponse('Login successful', payload);
  }
}
