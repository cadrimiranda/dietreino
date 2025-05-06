import { RepScheme } from '@/entities';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepSchemeUpsertDto } from './dto/repSchemeUpsert';

@Injectable()
export class RepSchemeService {
  constructor(
    @InjectRepository(RepScheme)
    private repSchemeRepository: Repository<RepScheme>,
  ) {}

  async bulkUpsert(dtos: RepSchemeUpsertDto[]): Promise<RepScheme[]> {
    const updates: RepSchemeUpsertDto[] = dtos.filter((dto) => !!dto.id);
    const inserts: RepSchemeUpsertDto[] = dtos.filter((dto) => !dto.id);

    const updatePromises = updates.map(async (dto) => {
      const existingRepScheme = await this.findById(dto.id as string);
      existingRepScheme.sets = dto.sets;
      existingRepScheme.minReps = dto.minReps;
      existingRepScheme.maxReps = dto.maxReps;
      existingRepScheme.trainingDayExercise = {
        id: dto.trainingDayExerciseId,
      } as any;

      return existingRepScheme;
    });

    const updatedEntities = await Promise.all(updatePromises);

    const newEntities = inserts.map((dto) =>
      this.repSchemeRepository.create({
        sets: dto.sets,
        minReps: dto.minReps,
        maxReps: dto.maxReps,
        trainingDayExercise: { id: dto.trainingDayExerciseId } as any,
      }),
    );

    const allEntities = [...updatedEntities, ...newEntities];
    return this.repSchemeRepository.save(allEntities);
  }

  async upsert(dto: RepSchemeUpsertDto): Promise<RepScheme> {
    if (dto.id) {
      const existingRepScheme = await this.findById(dto.id);

      existingRepScheme.sets = dto.sets;
      existingRepScheme.minReps = dto.minReps;
      existingRepScheme.maxReps = dto.maxReps;
      existingRepScheme.trainingDayExercise = {
        id: dto.trainingDayExerciseId,
      } as any;

      return this.repSchemeRepository.save(existingRepScheme);
    }

    const newRepScheme = this.repSchemeRepository.create({
      sets: dto.sets,
      minReps: dto.minReps,
      maxReps: dto.maxReps,
      trainingDayExercise: { id: dto.trainingDayExerciseId } as any,
    });

    return this.repSchemeRepository.save(newRepScheme);
  }

  async findById(id: string): Promise<RepScheme> {
    const repScheme = await this.repSchemeRepository.findOne({
      where: { id },
      relations: ['trainingDayExercise'],
    });

    if (!repScheme) {
      throw new NotFoundException(
        `Esquema de repetições com ID ${id} não encontrado`,
      );
    }

    return repScheme;
  }

  async deleteById(id: string): Promise<boolean> {
    await this.findById(id);

    const result = await this.repSchemeRepository.delete(id);
    if (!result.affected) return false;

    return result.affected > 0;
  }
}
