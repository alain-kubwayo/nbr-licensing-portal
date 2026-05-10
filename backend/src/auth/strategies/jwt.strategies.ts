import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../jwt.types';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(
  Strategy,
  'access-jwt',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const jwtAccessTokenSecret = configService.get<string>(
      'JWT_ACCESS_TOKEN_SECRET',
    );
    if (!jwtAccessTokenSecret) {
      Logger.error('JWT_ACCESS_TOKEN_SECRET environment variable is not set');
      throw new Error(
        'JWT_ACCESS_TOKEN_SECRET environment variable is not set',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtAccessTokenSecret,
    });
  }

  async validate(payload: JwtPayload) {
    return this.authService.validateAuthToken(payload);
  }
}
