import React, { useState, useRef } from "react";
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

interface TrainingDay {
  id: string;
  dayOfWeek: number;
  name: string;
  exercises: Array<{
    id: string;
    name: string;
    sets: number;
    reps: string;
    rest: string;
    videoUrl?: string;
  }>;
}

const DAYS_OF_WEEK = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const DAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function WeeklyPlan() {
  const { user, loading, error, activeWorkout } = useCurrentUser();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando plano de treino...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>Erro ao carregar plano</Text>
        <Text style={styles.errorSubtext}>
          Verifique sua conexão e tente novamente
        </Text>
      </View>
    );
  }

  const trainingDays: TrainingDay[] =
    activeWorkout?.trainingDays?.map((td) => ({
      id: td.id || "",
      dayOfWeek: td.dayOfWeek,
      name: td.name || "",
      exercises:
        td.trainingDayExercises?.map((tde, index) => ({
          id: tde.exercise?.id || index.toString(),
          name: tde.exercise?.name || "Exercício",
          sets: tde.repSchemes?.reduce((acc, rep) => acc + rep.sets, 0) || 3,
          reps:
            tde.repSchemes
              ?.map((rep) => `${rep.minReps}-${rep.maxReps}`)
              .join(", ") || "8-12",
          rest: tde.restIntervals?.[0]?.intervalTime
            ? `${tde.restIntervals[0].intervalTime}s`
            : "60s",
        })) || [],
    })) || [];

  const today = new Date().getDay();

  const handleDayPress = (dayIndex: number) => {
    setExpandedDay(expandedDay === dayIndex ? null : dayIndex);
    
    // Scroll to the selected day card after a brief delay to allow state update
    setTimeout(() => {
      if (scrollViewRef.current && expandedDay !== dayIndex) {
        // Calculate approximate position of the day card
        const cardHeight = 80; // Approximate height of collapsed card
        const headerHeight = 200; // Approximate height of header sections
        const targetPosition = headerHeight + (dayIndex * cardHeight);
        
        scrollViewRef.current.scrollTo({
          y: targetPosition,
          animated: true,
        });
      }
    }, 100);
  };

  const handleExercisePress = (exercise: any) => {
    if (exercise.videoUrl) {
      // Navigate to video player or open video
      console.log("Open video:", exercise.videoUrl);
    }
  };

  const getWorkoutName = (dayIndex: number) => {
    const trainingDay = trainingDays.find((td) => td.dayOfWeek === dayIndex);
    return trainingDay?.name || "Descanso";
  };

  const getExercises = (dayIndex: number) => {
    const trainingDay = trainingDays.find((td) => td.dayOfWeek === dayIndex);
    return trainingDay?.exercises || [];
  };

  const isRestDay = (dayIndex: number) => {
    return !trainingDays.some((td) => td.dayOfWeek === dayIndex);
  };

  return (
    <ScrollView ref={scrollViewRef} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plano de Treino</Text>
        <Text style={styles.subtitle}>
          {activeWorkout?.name || "Seu treino semanal"}
        </Text>
      </View>


      {/* Weekly Overview */}
      <View style={styles.weekOverview}>
        {DAYS_SHORT.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayOverview,
              today === index && styles.dayOverviewToday,
              !isRestDay(index) && styles.dayOverviewWithWorkout,
              expandedDay === index && styles.dayOverviewExpanded,
            ]}
            onPress={() => handleDayPress(index)}
          >
            <Text
              style={[
                styles.dayOverviewText,
                today === index && styles.dayOverviewTextToday,
                expandedDay === index && styles.dayOverviewTextExpanded,
              ]}
            >
              {day}
            </Text>
            <View style={styles.dayOverviewIcon}>
              {isRestDay(index) ? (
                <Ionicons name="bed" size={16} color="#8E8E93" />
              ) : (
                <Ionicons name="fitness" size={16} color="#007AFF" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Daily Plans */}
      <View style={styles.dailyPlans}>
        {DAYS_OF_WEEK.map((dayName, index) => {
          const exercises = getExercises(index);
          const workoutName = getWorkoutName(index);
          const isExpanded = expandedDay === index;
          const isRest = isRestDay(index);

          return (
            <View key={index} style={styles.dayCard}>
              <TouchableOpacity
                style={[
                  styles.dayHeader,
                  today === index && styles.dayHeaderToday,
                ]}
                onPress={() => handleDayPress(index)}
              >
                <View style={styles.dayInfo}>
                  <Text
                    style={[
                      styles.dayName,
                      today === index && styles.dayNameToday,
                    ]}
                  >
                    {dayName}
                  </Text>
                  <Text
                    style={[
                      styles.workoutName,
                      today === index && styles.workoutNameToday,
                      isRest && styles.restDay,
                    ]}
                  >
                    {workoutName}
                  </Text>
                </View>
                <View style={styles.dayActions}>
                  {!isRest && (
                    <Text style={[
                      styles.exerciseCount,
                      today === index && styles.exerciseCountToday,
                    ]}>
                      {exercises.length} exercícios
                    </Text>
                  )}
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color={today === index ? "#FFFFFF" : "#8E8E93"}
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && !isRest && (
                <View style={styles.exerciseList}>
                  {exercises.map((exercise, exerciseIndex) => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={styles.exerciseItem}
                      onPress={() => handleExercisePress(exercise)}
                    >
                      <View style={styles.exerciseNumber}>
                        <Text style={styles.exerciseNumberText}>
                          {exerciseIndex + 1}
                        </Text>
                      </View>
                      <View style={styles.exerciseDetails}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseSpecs}>
                          {exercise.sets} séries • {exercise.reps} reps •{" "}
                          {exercise.rest} descanso
                        </Text>
                      </View>
                      {exercise.videoUrl && (
                        <View style={styles.videoIcon}>
                          <Ionicons
                            name="play-circle"
                            size={24}
                            color="#007AFF"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {isExpanded && isRest && (
                <View style={styles.restDayContent}>
                  <Ionicons name="bed" size={32} color="#8E8E93" />
                  <Text style={styles.restDayText}>
                    Dia de descanso e recuperação
                  </Text>
                </View>
              )}
            </View>
          );
        })}
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
  },
  weekOverview: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    gap: 8,
  },
  dayOverview: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  dayOverviewToday: {
    backgroundColor: "#007AFF",
  },
  dayOverviewWithWorkout: {
    backgroundColor: "#E3F2FD",
  },
  dayOverviewText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 4,
  },
  dayOverviewTextToday: {
    color: "#1C1C1E",
    fontWeight: "700",
  },
  dayOverviewIcon: {
    alignItems: "center",
  },
  dayOverviewExpanded: {
    backgroundColor: "#34C759",
    borderWidth: 2,
    borderColor: "#30D158",
  },
  dayOverviewTextExpanded: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dailyPlans: {
    padding: 16,
    gap: 8,
  },
  dayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  dayHeaderToday: {
    backgroundColor: "#007AFF",
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 2,
  },
  dayNameToday: {
    color: "#FFFFFF",
    fontWeight: "800",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  workoutName: {
    fontSize: 14,
    color: "#8E8E93",
  },
  workoutNameToday: {
    color: "#FFFFFF",
    opacity: 0.95,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  restDay: {
    fontStyle: "italic",
  },
  dayActions: {
    alignItems: "flex-end",
  },
  exerciseCount: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 4,
  },
  exerciseCountToday: {
    color: "#FFFFFF",
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  exerciseList: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 8,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  exerciseNumberText: {
    color: "#FFFFFF",
    fontSize: 12,
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
  exerciseSpecs: {
    fontSize: 14,
    color: "#8E8E93",
  },
  videoIcon: {
    marginLeft: 8,
  },
  restDayContent: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8F9FA",
  },
  restDayText: {
    marginTop: 8,
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
});
