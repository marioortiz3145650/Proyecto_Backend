import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestConInquilino } from '../inquilinos/request-inquilino.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestConInquilino>();
    const user = request.user as any;

    if (!user) {
      throw new ForbiddenException('Acceso no autorizado');
    }

    const userRole = typeof user.rol === 'object' ? user.rol.nombre : user.rol;

    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('No tienes permiso para realizar esta acción');
    }

    return true;
  }
}