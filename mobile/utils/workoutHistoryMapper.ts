import { WorkoutHistoryData, WorkoutHistoryExercise, WorkoutHistorySet } from '@/hooks/useWorkoutHistory';

interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  restIntervals?: Array<{
    id: string;
    intervalTime: string;
    order: number;
  }>;
}

interface WorkoutExecutionData {
  userId: string;
  workoutId: string;
  workoutName: string;
  trainingDayName: string;
  trainingDayOrder: number;
  exercises: Exercise[];
  executedSets: Map<number, ExerciseSet[]>; // exerciseIndex -> sets
  exerciseNotes: Map<number, string>; // exerciseIndex -> notes
  startTime: Date;
  endTime?: Date;
  workoutNotes?: string;
}

export class WorkoutHistoryMapper {
  static mapToWorkoutHistory(executionData: WorkoutExecutionData): WorkoutHistoryData {
    // Validate required fields
    if (!executionData.exercises) {
      throw new Error('Exercises data is required');
    }

    const durationMinutes = executionData.endTime 
      ? Math.floor((executionData.endTime.getTime() - executionData.startTime.getTime()) / (1000 * 60))
      : undefined;

    const exercises: WorkoutHistoryExercise[] = executionData.exercises.map((exercise, exerciseIndex) => {
      const executedSets = executionData.executedSets.get(exerciseIndex) || [];
      const notes = executionData.exerciseNotes.get(exerciseIndex);
      
      // Parse planned reps from exercise.reps string
      const { plannedRepsMin, plannedRepsMax } = this.parseRepsString(exercise.reps);
      
      // Convert executed sets to workout history sets
      const sets: WorkoutHistorySet[] = executedSets.map((set, setIndex) => ({
        setNumber: setIndex + 1,
        weight: set.weight > 0 ? set.weight : undefined,
        reps: set.reps,
        plannedRepsMin,
        plannedRepsMax,
        restSeconds: this.parseRestTime(exercise.rest),
        isCompleted: set.completed,
        isFailure: false, // Could be enhanced to detect failures
        notes: undefined, // Could be enhanced to capture set-specific notes
        executedAt: new Date(), // Could be enhanced to capture actual execution time per set
      }));

      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        order: exerciseIndex + 1,
        plannedSets: exercise.sets,
        completedSets: executedSets.filter(set => set.completed).length,
        notes,
        sets,
      };
    });

    return {
      userId: executionData.userId,
      workoutId: executionData.workoutId,
      executedAt: executionData.startTime,
      workoutName: executionData.workoutName,
      trainingDayName: executionData.trainingDayName,
      trainingDayOrder: executionData.trainingDayOrder,
      notes: executionData.workoutNotes,
      durationMinutes,
      exercises,
    };
  }

  private static parseRepsString(repsString: string): { plannedRepsMin?: number; plannedRepsMax?: number } {
    if (!repsString) return {};

    // Handle formats like "8-12", "10", "8 - 12", etc.
    const cleanReps = repsString.replace(/\s/g, '');
    
    if (cleanReps.includes('-')) {
      const [min, max] = cleanReps.split('-').map(r => parseInt(r));
      return {
        plannedRepsMin: isNaN(min) ? undefined : min,
        plannedRepsMax: isNaN(max) ? undefined : max,
      };
    }
    
    const singleRep = parseInt(cleanReps);
    if (!isNaN(singleRep)) {
      return {
        plannedRepsMin: singleRep,
        plannedRepsMax: singleRep,
      };
    }

    return {};
  }

  private static parseRestTime(restString: string): number | undefined {
    if (!restString) return undefined;
    
    const cleanTime = restString.toLowerCase().replace(/\s+/g, '');
    
    // If it's just a number, assume seconds
    if (/^\d+$/.test(cleanTime)) {
      return parseInt(cleanTime);
    }
    
    // Parse formats like "60s", "1m", "1m30s"
    let totalSeconds = 0;
    const minuteMatch = cleanTime.match(/(\d+)m/);
    const secondMatch = cleanTime.match(/(\d+)s/);
    
    if (minuteMatch) {
      totalSeconds += parseInt(minuteMatch[1]) * 60;
    }
    if (secondMatch) {
      totalSeconds += parseInt(secondMatch[1]);
    }
    
    return totalSeconds > 0 ? totalSeconds : undefined;
  }
}