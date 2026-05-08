import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestConInquilino } from './request-inquilino.interface';

@Injectable()
export class InquilinoGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestConInquilino>();
    const usuario = request.user;
    const inquilinoId = request.headers['x-inquilino-id'];

    if (!inquilinoId) {
      throw new ForbiddenException('Se requiere ID de inquilino');
    }

    if (usuario && usuario.inquilinoId !== inquilinoId) {
      throw new ForbiddenException('Acceso denegado a este inquilino');
    }

    return true;
  }
}