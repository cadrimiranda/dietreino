import React, { useState, useEffect } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useGlobalStore } from "@/store/store";
import { WorkoutType } from "@/types/workout";
import { WORKOUT_DAY_TYPES, WorkoutDayType } from "@/constants/workoutTypes";
import { useRouter } from "expo-router";
import WorkoutSchedule from "./WorkoutSchedule";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function HomeDashboard() {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const { workoutScheduleList, setWorkoutScheduleList, setSelectedWorkout } =
    useGlobalStore();
  const router = useRouter();
  const { user, loading: isLoading, error, activeWorkout } = useCurrentUser();

  useEffect(() => {
    if (activeWorkout?.trainingDays) {
      // Convert training days to workout schedule format
      const schedule = Array(7).fill(null).map((_, index) => {
        const trainingDay = activeWorkout?.trainingDays?.find(
          (day: any) => day.dayOfWeek === index
        );
        
        if (trainingDay) {
          return {
            day: index,
            workout: trainingDay.name as WorkoutDayType,
            exercises: trainingDay.trainingDayExercises?.map((tde: any) => ({
              name: tde.exercise?.name || '',
              sets: tde.repSchemes?.reduce((acc: number, rep: any) => acc + rep.sets, 0) || 0,
              reps: tde.repSchemes?.map((rep: any) => `${rep.minReps}-${rep.maxReps}`).join(', ') || '',
              rest: tde.restIntervals?.map((rest: any) => `${rest.intervalTime}s`).join(', ') || ''
            })) || []
          };
        }
        
        return {
          day: index,
          workout: WORKOUT_DAY_TYPES.REST,
          exercises: []
        };
      });
      
      setWorkoutScheduleList(schedule);
    }
  }, [activeWorkout, setWorkoutScheduleList]);

  const handleStartWorkout = (workoutType: WorkoutDayType) => {
    setSelectedWorkout(workoutType);
    router.push("/workout");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Carregando seu treino...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Erro ao carregar dados do usuário</Text>
      </SafeAreaView>
    );
  }

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, ...
  const todayWorkout = workoutScheduleList?.[dayOfWeek];

  const userName = user?.name || "Usuario";
  const weeklyProgress = "3/5 treinos concluídos";
  const lastNote = "Foquei mais em resistência no último treino de pernas.";
  const dailyTip = "Hidrate-se antes, durante e depois do treino! 💧";
  const isRestDay = todayWorkout?.workout === WORKOUT_DAY_TYPES.REST;
  const workoutTitle = isRestDay
    ? "Dia de descanso"
    : `Treino de ${todayWorkout?.workout}`;
  const workoutDescription = isRestDay
    ? "Hoje é dia de descanso! Aproveite para relaxar e se recuperar."
    : "Hoje é dia de treino! Vamos lá!";
  const workoutIcon = isRestDay ? (
    <FontAwesome6 name="bed" size={40} color="#7C3AED" />
  ) : (
    <FontAwesome6 name="dumbbell" size={40} color="#7C3AED" />
  );

  return (
    <SafeAreaView>
      <ScrollView>
        {/* Saudação */}
        <View style={styles.container}>
          <Text style={styles.welcomeText}>Olá, {userName} 👋</Text>
          <Text style={styles.subText}>Pronta para mais um dia de treino?</Text>
        </View>

        {/* Tabela semanal */}
        <View style={styles.container}>
          <View style={styles.table}>
            {["S", "T", "Q", "Q", "S", "S", "D"].map((day, index) => (
              <View key={day + index} style={styles.column}>
                <View
                  style={[
                    styles.dayTextContainer,
                    {
                      backgroundColor:
                        index === dayOfWeek ? "#7C3AED" : "#8B5CF6",
                    },
                  ]}
                >
                  <Text style={styles.dayText}>{day}</Text>
                </View>
                <Text style={styles.workoutDay}>
                  {workoutScheduleList?.[index]?.workout ===
                  WORKOUT_DAY_TYPES.REST ? (
                    <FontAwesome6 name="dumbbell" size={20} color="#e5e5e5" />
                  ) : (
                    <FontAwesome6 name="dumbbell" size={20} color="#A0A0A0" />
                  )}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Treino do dia */}
        <View style={styles.container}>
          <View style={styles.workoutInfo}>
            <View style={styles.iconColumn}>{workoutIcon}</View>
            <View style={styles.detailsColumn}>
              <Text style={styles.workoutType}>{workoutTitle}</Text>
              <Text style={styles.motivationalPhrase}>
                {workoutDescription}
              </Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() =>
                  todayWorkout && handleStartWorkout(todayWorkout.workout)
                }
              >
                <Text style={styles.startButtonText}>Iniciar Treino</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Progresso semanal */}
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Seu progresso</Text>
          <Text style={styles.sectionContent}>{weeklyProgress}</Text>
        </View>

        {/* Última anotação */}
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Última anotação</Text>
          <Text style={styles.sectionContent}>{lastNote}</Text>
        </View>

        {/* Dica do dia */}
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>💡 Dica do dia</Text>
          <Text style={styles.sectionContent}>{dailyTip}</Text>
        </View>

        {/* Cronograma expandido */}
        <WorkoutSchedule
          workoutScheduleList={workoutScheduleList}
          expandedDay={expandedDay}
          setExpandedDay={setExpandedDay}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  subText: {
    fontSize: 16,
    color: "#4B5563",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#1a1a1a",
  },
  sectionContent: {
    fontSize: 16,
    color: "#4B5563",
  },
  exerciseText: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  dayContainer: {
    backgroundColor: "#f5f5f5",
  },
  dayContent: {},
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  workoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  exerciseList: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginBottom: 8,
    borderTopEndRadius: 0,
    borderTopStartRadius: 0,

    overflow: "hidden",
    width: "100%",
  },
  workoutSchedule: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7C3AED",
    marginBottom: 16,
  },
  scheduleItemContainer: {
    marginBottom: 16,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scheduleDay: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  scheduleWorkout: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  iconColumn: {
    flex: 0.4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#7C3AED",
    padding: "auto",
    alignSelf: "stretch",
  },
  detailsColumn: {
    flex: 0.6,
    padding: 16,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  workoutInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  workoutType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  motivationalPhrase: {
    fontSize: 14,
    color: "#666",
  },
  startButton: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "#7C3AED",
    borderRadius: 8,
    width: "100%",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  container: {
    padding: 16,
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  table: {
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayTextContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#8B5CF6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  workoutDay: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  loadingContainer: {
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
    color: "#ff3b30",
    textAlign: "center",
  },
});
