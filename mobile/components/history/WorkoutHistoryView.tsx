
import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useWorkoutHistoriesByUserAndDate } from '@/hooks/useWorkoutHistoryQuery';
import { LineChart, Path, Grid } from 'react-native-svg-charts';
import * as shape from 'd3-shape';

interface WorkoutHistoryViewProps {
  userId: string;
  date: Date;
}

const WorkoutHistoryView: React.FC<WorkoutHistoryViewProps> = ({ userId, date }) => {
  const { data, loading, error } = useWorkoutHistoriesByUserAndDate(userId, date);

  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" />;
  }

  if (error) {
    return <Text>Error loading workout history.</Text>;
  }

  const workoutHistory = data?.workoutHistoriesByUserAndDate?.[0];

  if (!workoutHistory) {
    return <Text>No workout history found for this date.</Text>;
  }

  const exercises = workoutHistory.workoutHistoryExercises.map(exercise => {
    const data = exercise.workoutHistoryExerciseSets.map(set => set.weight);
    return {
      name: exercise.exerciseName,
      data,
    };
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{workoutHistory.workoutName}</Text>
      <Text style={styles.date}>
        {new Date(workoutHistory.executedAt).toLocaleDateString('pt-BR')}
      </Text>

      {exercises.map((exercise, index) => (
        <View key={index} style={styles.chartContainer}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <LineChart
            style={{ height: 200 }}
            data={exercise.data}
            svg={{ stroke: 'rgb(134, 65, 244)' }}
            contentInset={{ top: 20, bottom: 20 }}
            curve={shape.curveNatural}
          >
            <Grid />
          </LineChart>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default WorkoutHistoryView;
