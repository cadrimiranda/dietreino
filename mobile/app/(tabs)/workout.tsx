import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { WorkoutDay } from "../../components/workout/WorkoutDay";
import { ExerciseCard } from "../../components/exercise/ExerciseCard";
import { Exercise } from "../../types/exercise";
import { useGlobalStore } from "@/store/store";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import WeeklyWorkoutSelector from "@/components/workout/WeeklyWorkoutSelector";

export default function WorkoutScreen() {
  const { isWorkoutStarted, setSelectedWorkout: setGlobalSelectedWorkout } = useGlobalStore();
  const { user, loading: isLoading, error, activeWorkout } = useCurrentUser();
  const [workoutProgress, setWorkoutProgress] = useState({ completed: 0, total: 0 });
  const [localSelectedWorkout, setLocalSelectedWorkout] = useState<any>(null);

  // Helper function to get exercises for the selected day only
  const getTodayExercises = () => {
    if (!activeWorkout?.trainingDays || !localSelectedWorkout) return [];
    
    const selectedTrainingDay = activeWorkout.trainingDays.find((day: any) => day.id === localSelectedWorkout.id);
    
    if (!selectedTrainingDay) return [];
    
    return selectedTrainingDay.trainingDayExercises.map((tde: any) => ({
      id: tde.exercise.id,
      name: tde.exercise.name,
      videoLink: tde.exercise.videoLink || undefined,
      youtubeUrl: tde.exercise.videoLink || undefined,
      restTime: tde.restIntervals?.map((ri: any) => parseInt(ri.intervalTime.replace(/\D/g, '')) || 60) || [60],
      series: tde.repSchemes?.[0]?.sets || 3,
      repsPerSeries: tde.repSchemes?.[0]?.maxReps || 10,
      trainerNotes: "Notes from trainer", // TODO: Add to GraphQL schema
      completedSeries: [] as any[], // TODO: Track user progress
      userNotes: "", // TODO: Add to GraphQL schema
      history: [] as any[], // TODO: Add to GraphQL schema
      isCompleted: false,
      order: tde.order
    }));
  };

  // Calculate workout statistics
  const getWorkoutStats = () => {
    const exercises = getTodayExercises();
    const totalExercises = exercises.length;
    const completedExercises = exercises.filter(ex => ex.isCompleted).length;
    const estimatedTime = exercises.reduce((total, ex) => {
      const setTime = 45; // Estimated seconds per set
      const restTime = ex.restTime[0] || 60;
      return total + (ex.series * setTime + (ex.series - 1) * restTime);
    }, 0);
    
    return {
      totalExercises,
      completedExercises,
      estimatedTime: Math.round(estimatedTime / 60), // Convert to minutes
      progressPercentage: totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0
    };
  };

  const handleExerciseUpdate = (
    exerciseId: string,
    updates: Partial<Exercise>
  ) => {
    // TODO: Implementar sincronização com o backend
    console.log('Exercise update:', exerciseId, updates);
  };

  const handleExerciseComplete = (exerciseId: string, isCompleted: boolean) => {
    // TODO: Implementar sincronização com o backend
    console.log('Exercise complete:', exerciseId, isCompleted);
  };

  // Função para transformar trainingDays em formato do WeeklyWorkoutSelector
  const getWeeklyWorkouts = () => {
    if (!activeWorkout?.trainingDays) return [];
    
    return activeWorkout.trainingDays.map((day: any) => ({
      id: day.id,
      name: day.name,
      dayOfWeek: day.dayOfWeek,
      dayName: getDayName(day.dayOfWeek),
      isCompleted: false, // TODO: Track completion status
      estimatedTime: Math.round((day.trainingDayExercises?.length || 0) * 3), // Estimativa: 3min por exercício
      exerciseCount: day.trainingDayExercises?.length || 0,
    }));
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayOfWeek] || 'N/A';
  };

  const handleSelectWorkout = (workout: any) => {
    setLocalSelectedWorkout(workout);
  };

  const handleStartWorkout = () => {
    if (localSelectedWorkout) {
      setGlobalSelectedWorkout(localSelectedWorkout.name);
      // Aqui você pode navegar para a tela de treino "ativo" se for uma tela diferente
    }
  };

  // Seta o treino sugerido para hoje como o selecionado inicialmente
  React.useEffect(() => {
    if (activeWorkout?.trainingDays && !localSelectedWorkout) {
      const today = new Date().getDay();
      const suggested = activeWorkout.trainingDays.find((d: any) => d.dayOfWeek === today);
      if (suggested) {
        const weeklyWorkouts = getWeeklyWorkouts();
        const suggestedWorkout = weeklyWorkouts.find(w => w.id === suggested.id);
        if (suggestedWorkout) {
          setLocalSelectedWorkout(suggestedWorkout);
        }
      } else if (activeWorkout.trainingDays.length > 0) {
        // Fallback para o primeiro treino da lista se não houver um para hoje
        const weeklyWorkouts = getWeeklyWorkouts();
        if (weeklyWorkouts.length > 0) {
          setLocalSelectedWorkout(weeklyWorkouts[0]);
        }
      }
    }
  }, [activeWorkout, localSelectedWorkout]);

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Skeleton for WorkoutDay */}
        <View style={[styles.statsCard, { height: 120 }]}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '70%', marginTop: 12 }]} />
        </View>
        
        {/* Skeleton for Stats */}
        <View style={styles.statsCard}>
          <View style={[styles.skeletonLine, { width: '60%', alignSelf: 'center', marginBottom: 20 }]} />
          <View style={styles.statsGrid}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.statItem}>
                <View style={[styles.skeletonCircle, { width: 20, height: 20, marginBottom: 8 }]} />
                <View style={[styles.skeletonLine, { width: 40, height: 20, marginBottom: 4 }]} />
                <View style={[styles.skeletonLine, { width: 60, height: 12 }]} />
              </View>
            ))}
          </View>
        </View>
        
        {/* Skeleton for Button */}
        <View style={[styles.startWorkoutContainer, styles.skeletonButton]} />
        
        {/* Skeleton for Exercises */}
        <View style={styles.exercisesContainer}>
          <View style={[styles.skeletonLine, { width: '50%', height: 20, marginBottom: 16 }]} />
          {[1, 2, 3].map(i => (
            <View key={i} style={[styles.exerciseCardWrapper, { height: 120, padding: 16 }]}>
              <View style={[styles.skeletonLine, { width: '80%', marginBottom: 12 }]} />
              <View style={[styles.skeletonLine, { width: '60%', height: 14 }]} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error || !activeWorkout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            {error || "Nenhum treino ativo encontrado"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const workoutStats = getWorkoutStats();
  const exercises = getTodayExercises();

  const WorkoutStatsCard = () => (
    <View style={styles.statsCard}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>📊 Estatísticas do Treino</Text>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <FontAwesome6 name="dumbbell" size={20} color="#7C3AED" />
          <Text style={styles.statNumber}>{workoutStats.totalExercises}</Text>
          <Text style={styles.statLabel}>Exercícios</Text>
        </View>
        
        <View style={styles.statItem}>
          <FontAwesome6 name="clock" size={20} color="#10B981" />
          <Text style={styles.statNumber}>{workoutStats.estimatedTime}min</Text>
          <Text style={styles.statLabel}>Tempo Estimado</Text>
        </View>
        
        <View style={styles.statItem}>
          <FontAwesome6 name="chart-line" size={20} color="#F59E0B" />
          <Text style={styles.statNumber}>{workoutStats.progressPercentage.toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Progresso</Text>
        </View>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${workoutStats.progressPercentage}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {workoutStats.completedExercises} de {workoutStats.totalExercises} exercícios concluídos
        </Text>
      </View>
    </View>
  );

  const StartWorkoutButton = () => (
    <TouchableOpacity style={styles.startWorkoutContainer} activeOpacity={0.8} onPress={handleStartWorkout}>
      <LinearGradient
        colors={['#7C3AED', '#A855F7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.startWorkoutButton}
      >
        <FontAwesome6 name="play" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.startWorkoutText}>Vamos treinar!</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Weekly Workout Selector */}
        <WeeklyWorkoutSelector 
          weeklyWorkouts={getWeeklyWorkouts()}
          selectedWorkout={localSelectedWorkout}
          onSelect={handleSelectWorkout}
          todayDayOfWeek={new Date().getDay()}
        />

        {localSelectedWorkout && (
          <>
            {/* Workout Statistics */}
            <WorkoutStatsCard />
            
            {/* Start Workout Button */}
            {!isWorkoutStarted && <StartWorkoutButton />}
            
            {/* Exercise Cards */}
            <View style={styles.exercisesContainer}>
              <Text style={styles.exercisesTitle}>💪 Exercícios de Hoje</Text>
              {exercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseCardWrapper}>
                  <ExerciseCard
                    exercise={exercise}
                    onUpdateExercise={handleExerciseUpdate}
                    onExerciseComplete={handleExerciseComplete}
                  />
                </View>
              ))}
            </View>
          </>
        )}
        
        {/* Bottom padding for better scroll experience */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7", // Mudança para fundo cinza claro conforme ui.md
  },
  scrollContent: {
    paddingBottom: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    fontWeight: "500",
  },
  
  // Workout Statistics Card
  statsCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsHeader: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
  
  // Progress Bar
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7C3AED",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  
  // Start Workout Button
  startWorkoutContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  startWorkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16, // Cantos mais arredondados conforme ui.md
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startWorkoutText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  
  // Exercises Section
  exercisesContainer: {
    marginHorizontal: 16,
  },
  exercisesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  exerciseCardWrapper: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // Bottom padding
  bottomPadding: {
    height: 32,
  },
  
  // Skeleton Loading Styles
  skeletonLine: {
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    width: "100%",
  },
  skeletonCircle: {
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
  },
  skeletonButton: {
    height: 56,
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
  },
});
