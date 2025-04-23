import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from '../../entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(data: Partial<User>): Promise<User> {
    return this.usersRepository.create(data);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.usersRepository.update(id, data);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Verifica se o usuário existe
    await this.usersRepository.delete(id);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async createWithGeneratedPassword(
    data: Partial<User>,
  ): Promise<{ user: User; generatedPassword: string }> {
    // Generate a random password
    const generatedPassword = this.generateRandomPassword();

    // Create user with the generated password
    const userData = {
      ...data,
      password: generatedPassword, // In a real app, you'd hash this password
    };

    const user = await this.usersRepository.create(userData);

    return {
      user,
      generatedPassword,
    };
  }

  private generateRandomPassword(length = 12): string {
    // Generate a secure random password
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
    let password = '';

    // Ensure at least one character from each category
    password += charset.substring(0, 26).charAt(Math.floor(Math.random() * 26)); // lowercase
    password += charset
      .substring(26, 52)
      .charAt(Math.floor(Math.random() * 26)); // uppercase
    password += charset
      .substring(52, 62)
      .charAt(Math.floor(Math.random() * 10)); // number
    password += charset
      .substring(62)
      .charAt(Math.floor(Math.random() * (charset.length - 62))); // special

    // Fill the rest of the password
    for (let i = 4; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset.charAt(randomIndex);
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }
}
