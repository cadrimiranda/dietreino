// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginInput } from './dto/login.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isValidPassword = await this.usersService.verifyPassword(
      password,
      user.password,
    );

    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  async login(
    loginInput: LoginInput,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const { email, password } = loginInput;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user,
    };
  }

  async refreshToken(
    refreshTokenInput: RefreshTokenInput,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = refreshTokenInput;

    try {
      // Verificar se o token é válido
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          this.configService.get<string>('JWT_SECRET'),
      });

      // Verificar se o token é do tipo refresh
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }

      // Buscar o usuário
      const user = await this.usersService.findById(payload.sub);

      // Gerar novos tokens
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn:
        this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        this.configService.get<string>('JWT_SECRET'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUserById(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }
}
