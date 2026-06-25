import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    return this.usersService.validateUser(username, password);
  }

  async login(user: any) {
    const payload = {
      username: user.nombre_usuario,
      sub: user.id,
      rol: user.rol?.nombre || user.rol,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginAsGuest() {
    const guestUser = await this.usersService.findGuestUser();
    if (!guestUser) {
      throw new UnauthorizedException('No se encontró un usuario visitante en el sistema.');
    }
    const payload = {
      username: guestUser.nombre_usuario,
      sub: guestUser.id,
      rol: 'Visitante',
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
