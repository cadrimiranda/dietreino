import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";

import { useGlobalStore } from "../../store/store";
import { useCurrentUser } from "../../hooks/useCurrentUser";

interface WorkoutTimerProps {
  startTime: Date;
}

function WorkoutTimer({ startTime }: WorkoutTimerProps) {
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const padStart = (num: number) => num.toString().padStart(2, "0");

    return `${hours > 0 ? padStart(hours) + ":" : ""}${padStart(
      minutes
    )}:${padStart(seconds)}`;
  };

  useEffect(() => {
    if (!startTime) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diffMs = now.getTime() - startTime.getTime();
      const totalSeconds = Math.floor(diffMs / 1000);

      setElapsedTime(formatTime(totalSeconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.timerText}>{elapsedTime}</Text>
    </View>
  );
}

export function WorkoutDay() {
  const { isWorkoutStarted, setIsWorkoutStarted } = useGlobalStore();
  const { user, loading: isLoading, activeWorkout } = useCurrentUser();
  const [startTime, setStartTime] = useState<Date | null>(null);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayName = format(today, "EEEE", { locale: ptBR });
  const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando treino...</Text>
      </View>
    );
  }

  if (!activeWorkout) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Erro ao carregar o treino</Text>
      </View>
    );
  }

  // Find today's training day
  const todayTrainingDay = activeWorkout.trainingDays?.find((day: any) => day.dayOfWeek === dayOfWeek);
  const workoutType = todayTrainingDay?.name || "Descanso";

  return (
    <View
      style={[
        styles.card,
        isWorkoutStarted && {
          position: "absolute",
          zIndex: 999,
          width: "100%",
        },
      ]}
    >
      {!isWorkoutStarted ? (
        <View>
          <Text style={styles.greeting}>Hoje é {capitalizedDayName}</Text>
          <Text style={styles.workout}>Seu treino é: {workoutType}</Text>
        </View>
      ) : (
        <View style={styles.stickyHeader}>
          <View style={styles.stickyContent}>
            {startTime && <WorkoutTimer startTime={startTime} />}
            <TouchableOpacity
              style={styles.endButtonSticky}
              onPress={() => setIsWorkoutStarted(false)}
            >
              <Ionicons
                name="stop-circle"
                size={18}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.endButtonText}>Encerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#111827",
  },
  workout: {
    fontSize: 16,
    fontWeight: "400",
    color: "#4B5563",
  },
  button: {
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
  },
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    alignItems: "center",
  },
  dayText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  workoutStatusText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  timerContainer: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 8,
    marginVertical: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F97316",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  endButtonSticky: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F97316",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  endButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  stickyContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
