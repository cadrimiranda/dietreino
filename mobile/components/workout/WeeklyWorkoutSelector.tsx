import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

interface WorkoutDay {
  id: string;
  name: string;
  dayOfWeek: number;
  dayName: string;
  isCompleted?: boolean;
  estimatedTime?: number;
  exerciseCount?: number;
}

interface WeeklyWorkoutSelectorProps {
  weeklyWorkouts: WorkoutDay[];
  selectedWorkout: WorkoutDay | null;
  onSelect: (workout: WorkoutDay) => void;
  todayDayOfWeek: number;
}

const WeeklyWorkoutSelector: React.FC<WeeklyWorkoutSelectorProps> = ({
  weeklyWorkouts,
  selectedWorkout,
  onSelect,
  todayDayOfWeek,
}) => {
  const getStatusStyles = (workout: WorkoutDay) => {
    const isSelected = selectedWorkout?.id === workout.id;
    const isSuggested = workout.dayOfWeek === todayDayOfWeek && !workout.isCompleted;
    
    if (isSelected) {
      return { card: styles.selectedCard, text: styles.selectedText };
    }
    if (workout.isCompleted) {
      return { card: styles.completedCard, text: styles.completedText };
    }
    if (isSuggested) {
      return { card: styles.suggestedCard, text: styles.suggestedText };
    }
    return { card: styles.defaultCard, text: styles.defaultText };
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[dayOfWeek] || 'N/A';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione seu treino</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContainer}
      >
        {weeklyWorkouts.map(workout => {
          const { card, text } = getStatusStyles(workout);
          const isSelected = selectedWorkout?.id === workout.id;

          return (
            <TouchableOpacity 
              key={workout.id} 
              onPress={() => onSelect(workout)} 
              style={[styles.card, card]}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.dayText, text]}>
                  {getDayName(workout.dayOfWeek)}
                </Text>
                {workout.isCompleted && (
                  <FontAwesome6 name="check-circle" size={16} color="#10B981" />
                )}
              </View>
              
              <Text style={[styles.workoutName, text]} numberOfLines={2}>
                {workout.name}
              </Text>
              
              <View style={styles.cardFooter}>
                {workout.exerciseCount && (
                  <Text style={[styles.metaText, text]}>
                    {workout.exerciseCount} ex.
                  </Text>
                )}
                {workout.estimatedTime && (
                  <Text style={[styles.metaText, text]}>
                    {workout.estimatedTime}min
                  </Text>
                )}
              </View>

              {isSelected && <View style={styles.selectedIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    marginVertical: 16 
  },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1F2937', 
    marginBottom: 12, 
    marginHorizontal: 16 
  },
  scrollContainer: { 
    paddingHorizontal: 16 
  },
  card: {
    width: 120,
    height: 110,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    justifyContent: 'space-between',
    borderWidth: 2,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  defaultCard: { 
    backgroundColor: '#FFFFFF', 
    borderColor: '#E5E7EB' 
  },
  suggestedCard: { 
    backgroundColor: '#F3E8FF', 
    borderColor: '#A855F7',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: { 
    backgroundColor: '#7C3AED', 
    borderColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  completedCard: { 
    backgroundColor: '#F0FDF4', 
    borderColor: '#22C55E' 
  },
  dayText: { 
    fontSize: 14, 
    fontWeight: '600' 
  },
  workoutName: { 
    fontSize: 15, 
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginVertical: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  defaultText: { 
    color: '#374151' 
  },
  selectedText: { 
    color: '#FFFFFF' 
  },
  completedText: { 
    color: '#15803D' 
  },
  suggestedText: { 
    color: '#6D28D9' 
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#7C3AED',
  },
});

export default WeeklyWorkoutSelector;