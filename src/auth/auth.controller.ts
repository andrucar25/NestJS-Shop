import { IncomingHttpHeaders } from 'http';
import { Controller, Get, Post, Body, Req, UseGuards, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto ) {
    return this.authService.login( loginUserDto );
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user)
  }

  @Get('private')
  @UseGuards( AuthGuard() ) //AuthGuard utiliza por defecto el archivo jwt strategy
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,  //user es lo que retorna el decorator GetUser
    @GetUser('email') userEmail: string,
    
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {


    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail,
      rawHeaders,
      headers
    }

  }

  @Get('private2')
  // @SetMetadata('roles', ['admin','super-user']) //agrega informacion extra, pero no es recomendado su uso
  @RoleProtected( ValidRoles.superUser, ValidRoles.admin )  //decorador personalizado para autorizacion que utiliza la metadata para agregar la informacion de roles
  @UseGuards( AuthGuard(), UserRoleGuard )  //los custom guards no se recomienda crear instancias al invocarlos
  privateRoute2(
    @GetUser() user: User
  ) {

    return {
      ok: true,
      user
    }
  }

  @Get('private3')
  @Auth( ValidRoles.admin ) //este auth es la combinacion de decoradores de autenticacion y autorizacion
  privateRoute3(
    @GetUser() user: User
  ) {

    return {
      ok: true,
      user
    }
  }
}
