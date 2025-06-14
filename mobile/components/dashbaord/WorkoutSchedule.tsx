import React from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, View, Text } from "react-native";
import { ListItem } from "@rneui/themed";
import { WorkoutScheduleList } from "@/types/workout";
import { WORKOUT_DAY_TYPES } from "@/constants/workoutTypes";

interface WorkoutScheduleProps {
  workoutScheduleList: WorkoutScheduleList | null;
  expandedDay?: string | null;
  setExpandedDay: (day: string | null) => void;
}

const WorkoutSchedule: React.FC<WorkoutScheduleProps> = ({
  workoutScheduleList,
  expandedDay,
  setExpandedDay,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.scheduleTitle}>📅 Cronograma de Treino</Text>
      {workoutScheduleList?.map((item, index) => {
        const dayKey = item.day.toString();
        const isExpanded = expandedDay === dayKey;
        const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

        if (item.workout === WORKOUT_DAY_TYPES.REST) return null;

        return (
          <ListItem.Accordion
            key={dayKey}
            content={
              <ListItem.Content>
                <View style={styles.accordionHeader}>
                  <FontAwesome6 name="dumbbell" size={18} color="#7C3AED" />
                  <Text style={styles.accordionTitle}>{dayNames[item.day]} - {item.workout}</Text>
                </View>
              </ListItem.Content>
            }
            isExpanded={isExpanded}
            containerStyle={styles.accordionContainer}
            onPress={() => setExpandedDay(isExpanded ? null : dayKey)}
          >
            <View>
              {item.exercises.map((exercise, i) => (
                <ListItem key={i} containerStyle={styles.exerciseItem}>
                  <FontAwesome6 name="circle" size={8} color="#7C3AED" />
                  <ListItem.Title style={styles.exerciseText}>
                    {exercise.name} - {exercise.sets} séries x {exercise.reps} - Descanso: {exercise.rest}
                  </ListItem.Title>
                </ListItem>
              ))}
            </View>
          </ListItem.Accordion>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
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
  exerciseText: {
    fontSize: 16,
    color: "#4B0082",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  accordionContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    borderColor: "#E0D4FB",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  exerciseItem: {
    backgroundColor: "#F5F3FF",
    borderBottomWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 10,
  },

  scheduleTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
});

export default WorkoutSchedule;
