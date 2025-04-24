import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from '../../entities/user.entity';
import * as crypto from 'crypto';
import { promisify } from 'util';
import { CreateUserWithPasswordInput } from './dto/create-user-with-password.input';

// Promisify the crypto functions
const scrypt = promisify(crypto.scrypt);
const randomBytes = promisify(crypto.randomBytes);

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
    data: CreateUserWithPasswordInput,
  ): Promise<{ user: User; generatedPassword: string }> {
    // Generate a random password
    const generatedPassword = this.generateRandomPassword();
    const hashedPassword = await this.encodePassword(generatedPassword);

    // Check if the email already exists
    const existingUser = await this.usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Create user with the generated password
    const userData = {
      ...data,
      password: hashedPassword,
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

  /**
   * Encodes a password using scrypt for secure storage in a database
   * @param plainPassword The plain text password to encode
   * @returns A Promise that resolves to the hashed password string
   */
  private async encodePassword(plainPassword: string): Promise<string> {
    try {
      // Generate a random salt
      const salt = await randomBytes(16);

      // Hash the password with the salt
      const derivedKey = (await scrypt(plainPassword, salt, 64)) as Buffer;

      // Format as [salt]:[derived key]
      return salt.toString('hex') + ':' + derivedKey.toString('hex');
    } catch (error) {
      console.error('Error encoding password:', error);
      throw new Error('Password encoding failed');
    }
  }

  /**
   * Verifies a password against a stored scrypt hash
   * @param plainPassword The plain text password to verify
   * @param hashedPassword The stored hashed password (salt:hash format)
   * @returns A Promise that resolves to true if password matches, false otherwise
   */
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      // Split the stored hash into salt and hash portions
      const [salt, storedHash] = hashedPassword.split(':');

      // Hash the input password with the same salt
      const derivedKey = (await scrypt(
        plainPassword,
        Buffer.from(salt, 'hex'),
        64,
      )) as Buffer;

      // Compare the derived key with the stored hash
      return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), derivedKey);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw new Error('Password verification failed');
    }
  }
}
