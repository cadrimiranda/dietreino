import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email });
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async findClientsForTrainer(trainerId: string): Promise<User[]> {
    return this.repository.find({
      where: { trainerId },
      relations: ['workouts'],
    });
  }

  async findClientsForNutritionist(nutritionistId: string): Promise<User[]> {
    return this.repository.find({
      where: { nutritionistId },
      relations: ['workouts'],
    });
  }

  async findClientById(
    clientId: string,
    professionalId: string,
  ): Promise<User | null> {
    return this.repository.findOne({
      where: [
        { id: clientId, trainerId: professionalId },
        { id: clientId, nutritionistId: professionalId },
      ],
      relations: ['workouts', 'trainer', 'nutritionist'],
    });
  }

  async findProfessionalsByClient(
    clientId: string,
  ): Promise<{ trainer: User | null; nutritionist: User | null }> {
    const client = await this.repository.findOne({
      where: { id: clientId },
      relations: ['trainer', 'nutritionist'],
    });

    return {
      trainer: client?.trainer || null,
      nutritionist: client?.nutritionist || null,
    };
  }
}
