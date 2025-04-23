import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import { WorkoutDay } from "../../components/workout/WorkoutDay";
import { ExerciseCard } from "../../components/exercise/ExerciseCard";
import { Exercise, WorkoutDetails } from "../../types/exercise";
import { container } from "@/services/container";
import { useGlobalStore } from "@/store/store";
import WorkoutNotInitialized from "@/components/workout/WorkoutNotInitialized";

export default function WorkoutScreen() {
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isWorkoutStarted, selectedWorkout } = useGlobalStore(); // Lê o estado global

  useEffect(() => {
    loadWorkoutDetails();
  }, []);

  const loadWorkoutDetails = async () => {
    try {
      const details = await container.api.getWorkoutDetails();
      setWorkoutDetails(details);
    } catch (err) {
      setError("Erro ao carregar detalhes do treino");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseUpdate = (
    exerciseId: string,
    updates: Partial<Exercise>
  ) => {
    if (!workoutDetails) return;

    const updatedExercises = workoutDetails.exercises.map((exercise) =>
      exercise.id === exerciseId ? { ...exercise, ...updates } : exercise
    );

    setWorkoutDetails({
      ...workoutDetails,
      exercises: updatedExercises,
    });

    // TODO: Implementar sincronização com o backend
    // await container.api.updateExercise(exerciseId, updates);
  };

  const handleExerciseComplete = (exerciseId: string, isCompleted: boolean) => {
    if (!workoutDetails) return;

    const updatedExercises = workoutDetails.exercises.map((exercise) =>
      exercise.id === exerciseId
        ? { ...exercise, completed: isCompleted }
        : exercise
    );

    setWorkoutDetails({
      ...workoutDetails,
      exercises: updatedExercises,
    });

    // TODO: Implementar sincronização com o backend
    // await container.api.updateExercise(exerciseId, { completed: true });
  };

  if (!selectedWorkout) {
    return <WorkoutNotInitialized />;
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando treino...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !workoutDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>
            {error || "Erro ao carregar treino"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          isWorkoutStarted ? { paddingTop: 80 } : undefined
        }
      >
        <WorkoutDay />
        {workoutDetails.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onUpdateExercise={handleExerciseUpdate}
            onExerciseComplete={handleExerciseComplete}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    margin: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
  },
});
