import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "expo-router";

interface RestInterval {
  id: string;
  intervalTime: string;
  order: number;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  restIntervals?: RestInterval[];
  completed?: boolean;
}

export default function TodayWorkout() {
  const { user, loading, error, activeWorkout } = useCurrentUser();
  const router = useRouter();
  const [workoutStarted, setWorkoutStarted] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando treino de hoje...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>Erro ao carregar dados</Text>
        <Text style={styles.errorSubtext}>
          Verifique sua conexão e tente novamente
        </Text>
      </View>
    );
  }

  const today = new Date();
  const dayOfWeek = today.getDay();
  const todayTraining = activeWorkout?.trainingDays?.find(
    (day) => day.dayOfWeek === dayOfWeek
  );

  const isRestDay = !todayTraining;
  const userName = user?.name || "Usuário";

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const workoutExercises: Exercise[] =
    todayTraining?.trainingDayExercises?.map((tde, index) => ({
      id: tde.id || index.toString(),
      name: tde.exercise?.name || "Exercício",
      sets: tde.repSchemes?.length || 1,
      reps:
        tde.repSchemes
          ?.map((rep) => `${rep.minReps}-${rep.maxReps}`)
          .join(", ") || "8-12",
      rest: tde.restIntervals?.[0]?.intervalTime || "60s",
      restIntervals:
        tde.restIntervals?.map((ri) => ({
          id: ri.id,
          intervalTime: ri.intervalTime,
          order: ri.order,
        })) || [],
      completed: false,
    })) || [];

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
    // Navigate to exercise execution screen with exercises data
    router.push({
      pathname: "/exercise",
      params: {
        exercises: JSON.stringify(workoutExercises),
        trainingDayName: todayTraining?.name || "Treino de Hoje",
      },
    });
  };

  const handleFinishWorkout = () => {
    setWorkoutStarted(false);
    // Handle workout completion logic
  };

  if (isRestDay) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {userName}! 👋</Text>
          <Text style={styles.date}>{formatDate(today)}</Text>
        </View>

        <View style={styles.restDayCard}>
          <View style={styles.restDayIcon}>
            <Ionicons name="bed" size={48} color="#34C759" />
          </View>
          <Text style={styles.restDayTitle}>Dia de Descanso</Text>
          <Text style={styles.restDaySubtitle}>
            Hoje é dia de recuperação! Aproveite para relaxar e se hidratar.
          </Text>

          <View style={styles.restDayTips}>
            <Text style={styles.tipsTitle}>
              💡 Dicas para o dia de descanso:
            </Text>
            <Text style={styles.tipItem}>• Hidrate-se bem</Text>
            <Text style={styles.tipItem}>• Faça alongamentos leves</Text>
            <Text style={styles.tipItem}>• Tenha uma boa noite de sono</Text>
            <Text style={styles.tipItem}>• Prepare-se para amanhã</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {userName}! 👋</Text>
        <Text style={styles.date}>{formatDate(today)}</Text>
      </View>

      <View style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutTitle}>
              {todayTraining?.name || "Treino de Hoje"}
            </Text>
            <Text style={styles.workoutSubtitle}>
              {workoutExercises.length} exercícios •{" "}
              {workoutExercises.reduce((acc, ex) => acc + ex.sets, 0)} séries
            </Text>
          </View>
          <View style={styles.workoutIcon}>
            <Ionicons name="fitness" size={32} color="#007AFF" />
          </View>
        </View>

        {!workoutStarted ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}
          >
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Iniciar Treino</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleFinishWorkout}
          >
            <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            <Text style={styles.finishButtonText}>Finalizar Treino</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.exercisesList}>
        <Text style={styles.exercisesTitle}>Exercícios de Hoje</Text>
        {workoutExercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.exerciseDetails}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseInfo}>
                {exercise.sets} séries • {exercise.reps} reps • {exercise.rest}{" "}
                descanso
              </Text>
            </View>
            <View style={styles.exerciseStatus}>
              {exercise.completed ? (
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              ) : (
                <View style={styles.pendingCircle} />
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Progresso da Semana</Text>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>3 de 5 treinos concluídos</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "60%" }]} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#FF3B30",
    textAlign: "center",
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: "#8E8E93",
    textTransform: "capitalize",
  },
  restDayCard: {
    margin: 16,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  restDayIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F9F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  restDayTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  restDaySubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 24,
  },
  restDayTips: {
    width: "100%",
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  workoutCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  workoutSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  workoutIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  finishButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  exercisesList: {
    margin: 16,
    marginTop: 0,
  },
  exercisesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  exerciseNumberText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  exerciseInfo: {
    fontSize: 14,
    color: "#8E8E93",
  },
  exerciseStatus: {
    marginLeft: 12,
  },
  pendingCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5EA",
  },
  progressCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  progressInfo: {
    gap: 12,
  },
  progressText: {
    fontSize: 16,
    color: "#8E8E93",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E5EA",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
});
