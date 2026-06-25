import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../usuarios/usuarios.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({ usernameField: 'nombre_usuario' });
  }

  async validate(nombre_usuario: string, password: string): Promise<any> {
    const user = await this.usersService.validateUser(nombre_usuario, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}