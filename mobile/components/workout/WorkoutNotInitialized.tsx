import React, { useState, useMemo, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Select, SelectItem, Text } from "@ui-kitten/components";
import { useGlobalStore } from "@/store/store";
import { WorkoutType } from "@/types/workout";

interface WorkoutNotInitializedProps {}

const WorkoutNotInitialized: React.FC<WorkoutNotInitializedProps> = () => {
  const [workoutSelected, setWorkoutSelected] = useState<number | undefined>(
    undefined
  );
  const { setSelectedWorkout, workoutScheduleList } = useGlobalStore();

  const workoutList = useMemo(() => {
    if (!workoutScheduleList || workoutScheduleList.length === 0) {
      return [];
    }

    return workoutScheduleList
      .filter((item) => item.workout !== WorkoutType.REST)
      .map((item, index) => ({
        id: index,
        name: item.workout,
        day: item.day,
        exercises: item.exercises,
      }));
  }, [workoutScheduleList]);

  useEffect(() => {
    if (workoutList.length > 0 && workoutScheduleList) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      if (workoutScheduleList[adjustedIndex]) {
        const todayWorkout = workoutScheduleList[adjustedIndex];

        if (todayWorkout.workout !== WorkoutType.REST) {
          const todayWorkoutIndex = workoutList.findIndex(
            (item) => item.day === todayWorkout.day
          );

          if (todayWorkoutIndex !== -1) {
            setWorkoutSelected(todayWorkoutIndex);
          }
        }
      }
    }
  }, [workoutList, workoutScheduleList]);

  const handleStartWorkout = () => {
    if (workoutSelected !== undefined && workoutList.length > 0) {
      const selectedWorkoutItem = workoutList[workoutSelected];
      setSelectedWorkout(selectedWorkoutItem.name);
    }
  };

  if (!workoutScheduleList || workoutList.length === 0) {
    return (
      <View style={styles.container}>
        <Text category="h5">Nenhum treino disponível</Text>
        <Text appearance="hint" style={{ marginTop: 12 }}>
          Não foi possível carregar seu cronograma de treinos.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text category="h5" style={{ marginBottom: 12 }}>
        Vamos treinar?
      </Text>

      <Text appearance="hint" style={{ marginBottom: 24 }}>
        {workoutSelected !== undefined
          ? "Treino de hoje já selecionado. Confira os exercícios abaixo."
          : "Você ainda não selecionou o treino de hoje."}
      </Text>

      <Select
        placeholder="Selecione um treino"
        value={
          workoutSelected !== undefined
            ? `${workoutList[workoutSelected].name} (${workoutList[workoutSelected].day})`
            : ""
        }
        onSelect={(index) =>
          Array.isArray(index)
            ? setWorkoutSelected(index[0].row)
            : setWorkoutSelected(index.row)
        }
        style={{ width: "80%" }}
      >
        {workoutList.map((workout) => (
          <SelectItem
            key={workout.id}
            title={`${workout.name} (${workout.day})`}
          />
        ))}
      </Select>

      {workoutSelected !== undefined && (
        <View style={styles.exerciseList}>
          <Text appearance="hint" style={styles.exerciseTitle}>
            Exercícios:
          </Text>
          {workoutList[workoutSelected].exercises.map((exercise, idx) => (
            <Text key={idx} style={styles.exercise}>
              • {exercise}
            </Text>
          ))}
        </View>
      )}

      <Button
        style={{ marginTop: 16 }}
        status="success"
        onPress={handleStartWorkout}
        disabled={workoutSelected === undefined}
      >
        Iniciar Treino
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  text: {
    fontSize: 18,
    color: "#333",
  },
  exerciseList: {
    marginTop: 20,
    width: "80%",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  exerciseTitle: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  exercise: {
    marginBottom: 4,
  },
});

export default WorkoutNotInitialized;
