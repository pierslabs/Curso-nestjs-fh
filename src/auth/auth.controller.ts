import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IncomingHttpHeaders } from 'http';
import { AuthService } from './auth.service';
import { Auth, GetUser, RawHeaders, RoleProtected } from './decorators';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/auth.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { EValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser('email') email: string,
    @GetUser() user: User,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      ok: true,
      message: 'auth test verify',
      user,
      email,
      rawHeaders,
      headers,
    };
  }

  // @SetMetadata('roles', ['admin', 'super-user'])
  @Get('private2')
  @RoleProtected(EValidRoles.superUser, EValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth(EValidRoles.admin)
  testingPrivateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}
