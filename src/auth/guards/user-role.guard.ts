import { Observable } from 'rxjs';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { User } from '../entities/user.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  
  constructor(
    private readonly reflector: Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.getAllAndOverride<string[]>(META_ROLES,[context.getHandler(), context.getClass()]); //para usarlo a nivel general de controlador y cada ruta
    // const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler())  //para usarlo solo a nivel de ruta

    if ( !validRoles ) return true;
    if ( validRoles.length === 0 ) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if ( !user ) 
      throw new BadRequestException('User not found');

    for (const role of user.roles ) {
      if ( validRoles.includes( role ) ) {
        console.log('entro al if')
        return true;
      }
    }
    
    throw new ForbiddenException(
      `User ${ user.fullName } needs a valid role: [${ validRoles }]`
    );

  }
}
