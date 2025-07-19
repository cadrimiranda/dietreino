import { computed, ref, watch, Ref } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { 
  GET_WORKOUT_HISTORIES_BY_USER, 
  GET_WORKOUT_HISTORIES_BY_WORKOUT 
} from '@/graphql/workoutHistory';
import type { 
  WorkoutHistoryType, 
  ExerciseProgressData, 
  ExerciseSessionData,
  SetProgressData,
  WorkoutHistoryFilters,
  ExerciseAnalytics,
  WorkoutAnalytics
} from '@/types/workoutHistory';

export function useWorkoutHistory(filters: Ref<WorkoutHistoryFilters> = ref({})) {
  const workoutHistories = ref<WorkoutHistoryType[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // Query workout histories by user
  const { 
    result: userHistoriesResult, 
    loading: userHistoriesLoading, 
    error: userHistoriesError,
    refetch: refetchUserHistories
  } = useQuery(
    GET_WORKOUT_HISTORIES_BY_USER,
    () => ({ userId: filters.value.userId }),
    () => ({
      enabled: !!filters.value.userId,
      fetchPolicy: 'cache-and-network'
    })
  );

  // Query workout histories by workout
  const { 
    result: workoutHistoriesResult, 
    loading: workoutHistoriesLoading, 
    error: workoutHistoriesError,
    refetch: refetchWorkoutHistories
  } = useQuery(
    GET_WORKOUT_HISTORIES_BY_WORKOUT,
    () => ({ workoutId: filters.value.workoutId }),
    () => ({
      enabled: !!filters.value.workoutId,
      fetchPolicy: 'cache-and-network'
    })
  );

  // Update data when queries complete
  watch([userHistoriesResult, workoutHistoriesResult], () => {
    const userData = userHistoriesResult.value?.workoutHistoriesByUser || [];
    const workoutData = workoutHistoriesResult.value?.workoutHistoriesByWorkout || [];
    
    // Combine and deduplicate data
    const combined = [...userData, ...workoutData];
    const unique = combined.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    
    workoutHistories.value = unique;
  });

  // Update loading and error states
  watch([userHistoriesLoading, workoutHistoriesLoading], () => {
    loading.value = userHistoriesLoading.value || workoutHistoriesLoading.value;
  });

  watch([userHistoriesError, workoutHistoriesError], () => {
    error.value = userHistoriesError.value || workoutHistoriesError.value || null;
  });

  // Computed filtered data
  const filteredHistories = computed(() => {
    let filtered = [...workoutHistories.value];

    if (filters.value.dateFrom) {
      filtered = filtered.filter(h => h.executedAt >= filters.value.dateFrom!);
    }

    if (filters.value.dateTo) {
      filtered = filtered.filter(h => h.executedAt <= filters.value.dateTo!);
    }

    if (filters.value.exerciseId || filters.value.exerciseName) {
      filtered = filtered.filter(h => 
        h.workoutHistoryExercises.some(exercise => {
          const matchesId = !filters.value.exerciseId || exercise.exerciseId === filters.value.exerciseId;
          const matchesName = !filters.value.exerciseName || 
            exercise.exerciseName.toLowerCase().includes(filters.value.exerciseName!.toLowerCase());
          return matchesId && matchesName;
        })
      );
    }

    // Sort by execution date (newest first)
    filtered.sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime());

    // Apply limit and offset
    if (filters.value.offset) {
      filtered = filtered.slice(filters.value.offset);
    }
    if (filters.value.limit) {
      filtered = filtered.slice(0, filters.value.limit);
    }

    return filtered;
  });

  // Get exercise progress data for visualization
  const exerciseProgressData = computed(() => {
    const progressMap = new Map<string, ExerciseProgressData>();

    filteredHistories.value.forEach(history => {
      history.workoutHistoryExercises.forEach(exercise => {
        const key = exercise.exerciseId;
        
        if (!progressMap.has(key)) {
          progressMap.set(key, {
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            sessions: []
          });
        }

        const exerciseData = progressMap.get(key)!;
        
        // Calculate session metrics
        const sets: SetProgressData[] = exercise.workoutHistoryExerciseSets.map(set => ({
          setNumber: set.setNumber,
          weight: set.weight,
          reps: set.reps,
          isCompleted: set.isCompleted,
          volume: (set.weight || 0) * set.reps
        }));

        const sessionData: ExerciseSessionData = {
          date: history.executedAt,
          workoutName: history.workoutName,
          sets,
          maxWeight: Math.max(...sets.map(s => s.weight || 0)),
          totalVolume: sets.reduce((sum, s) => sum + s.volume, 0),
          averageReps: sets.length > 0 ? sets.reduce((sum, s) => sum + s.reps, 0) / sets.length : 0
        };

        exerciseData.sessions.push(sessionData);
      });
    });

    // Sort sessions by date for each exercise
    progressMap.forEach(exerciseData => {
      exerciseData.sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return Array.from(progressMap.values());
  });

  // Calculate exercise analytics
  const exerciseAnalytics = computed((): ExerciseAnalytics[] => {
    return exerciseProgressData.value.map(exercise => {
      const sessions = exercise.sessions;
      const allSets = sessions.flatMap(s => s.sets);
      const completedSets = allSets.filter(s => s.isCompleted);

      const totalVolume = completedSets.reduce((sum, s) => sum + s.volume, 0);
      const weights = completedSets.map(s => s.weight || 0).filter(w => w > 0);
      const reps = completedSets.map(s => s.reps);

      // Calculate progress trend
      let progressTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (sessions.length >= 2) {
        const recentSessions = sessions.slice(-3);
        const volumes = recentSessions.map(s => s.totalVolume);
        const trend = volumes[volumes.length - 1] - volumes[0];
        if (trend > 0) progressTrend = 'increasing';
        else if (trend < 0) progressTrend = 'decreasing';
      }

      return {
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        totalSessions: sessions.length,
        totalSets: completedSets.length,
        totalReps: reps.reduce((sum, r) => sum + r, 0),
        totalVolume,
        averageWeight: weights.length > 0 ? weights.reduce((sum, w) => sum + w, 0) / weights.length : 0,
        maxWeight: weights.length > 0 ? Math.max(...weights) : 0,
        averageReps: reps.length > 0 ? reps.reduce((sum, r) => sum + r, 0) / reps.length : 0,
        progressTrend,
        lastSession: sessions[sessions.length - 1],
        bestSession: sessions.reduce((best, current) => 
          current.totalVolume > (best?.totalVolume || 0) ? current : best, sessions[0])
      };
    });
  });

  // Calculate workout analytics
  const workoutAnalytics = computed((): WorkoutAnalytics => {
    const histories = filteredHistories.value;
    const durations = histories.map(h => h.durationMinutes || 0).filter(d => d > 0);
    
    return {
      totalWorkouts: histories.length,
      totalDuration: durations.reduce((sum, d) => sum + d, 0),
      averageDuration: durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0,
      exerciseAnalytics: exerciseAnalytics.value,
      weeklyFrequency: calculateWeeklyFrequency(histories),
      lastWorkout: histories[0], // Already sorted by date desc
      bestWorkout: histories.reduce((best, current) => 
        (current.durationMinutes || 0) > (best?.durationMinutes || 0) ? current : best, histories[0])
    };
  });

  function calculateWeeklyFrequency(histories: WorkoutHistoryType[]): number {
    if (histories.length === 0) return 0;
    
    const dates = histories.map(h => new Date(h.executedAt));
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    const latest = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const weeksDiff = Math.ceil((latest.getTime() - earliest.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return weeksDiff > 0 ? histories.length / weeksDiff : 0;
  }

  function refetch() {
    if (filters.value.userId) {
      refetchUserHistories();
    }
    if (filters.value.workoutId) {
      refetchWorkoutHistories();
    }
  }

  return {
    workoutHistories: filteredHistories,
    exerciseProgressData,
    exerciseAnalytics,
    workoutAnalytics,
    loading,
    error,
    refetch
  };
}