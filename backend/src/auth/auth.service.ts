import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashEncryption } from '../common/utils/hash.util';
import { UserEntity } from '../users/user.entity';
import { UserService } from '../users/user.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './jwt.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly hashEncryption: HashEncryption,
  ) {}

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await this.hashEncryption.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatches)
      throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async validateUser(loginDto: {
    email: string;
    password: string;
  }): Promise<UserEntity | null> {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) return null;

    const isPasswordValid = await this.hashEncryption.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) return null;

    return user;
  }

  async validateAuthToken(signedTokenPayload: JwtPayload) {
    const userId = signedTokenPayload.email;

    const user = await this.usersService.findByEmail(userId);
    return user;
  }
}
