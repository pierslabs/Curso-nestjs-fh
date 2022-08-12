import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/auth.entity';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(payload: IJwtPayload): Promise<User> {
    const { id } = payload;

    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new UnauthorizedException('Token not valid');
    if (!user.isActive) throw new UnauthorizedException('User is not active');

    return user;
  }
}
