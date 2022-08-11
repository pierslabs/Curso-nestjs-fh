import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/auth.entity';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userDetail } = createUserDto;

      const user = this.userRepo.create({
        ...userDetail,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepo.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJWT({ email: user.email }),
      };
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepo.findOne({
      where: { email },
      select: { email: true, password: true },
    });

    if (!user) throw new NotFoundException('Credentials are not valid.');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid.');
    return {
      ...user,
      token: this.getJWT({ email: user.email }),
    };
  }

  private getJWT(payload: IJwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDbError(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);

    throw new InternalServerErrorException('please check server logs');
  }
}
