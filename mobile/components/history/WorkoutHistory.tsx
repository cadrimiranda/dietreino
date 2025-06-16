import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WorkoutData {
  date: string;
  workoutName: string;
  exercises: number;
  totalSets: number;
  duration: string;
  notes?: string;
}

interface ExerciseProgress {
  name: string;
  dates: string[];
  weights: number[];
}

const { width } = Dimensions.get('window');

export default function WorkoutHistory() {
  const [selectedView, setSelectedView] = useState<'calendar' | 'progress' | 'search'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Mock data - replace with real data
  const workoutHistory: WorkoutData[] = [
    {
      date: '2025-06-14',
      workoutName: 'Treino de Peito',
      exercises: 5,
      totalSets: 15,
      duration: '45min',
      notes: 'Ótimo treino! Consegui aumentar o peso no supino.'
    },
    {
      date: '2025-06-12',
      workoutName: 'Treino de Costas',
      exercises: 6,
      totalSets: 18,
      duration: '50min',
      notes: 'Foquei mais na forma dos movimentos.'
    },
    {
      date: '2025-06-10',
      workoutName: 'Treino de Pernas',
      exercises: 4,
      totalSets: 16,
      duration: '55min',
    },
    {
      date: '2025-06-08',
      workoutName: 'Treino de Ombros',
      exercises: 5,
      totalSets: 15,
      duration: '40min',
    },
  ];

  const exerciseProgress: ExerciseProgress[] = [
    {
      name: 'Supino Inclinado',
      dates: ['2025-06-01', '2025-06-05', '2025-06-08', '2025-06-12', '2025-06-14'],
      weights: [60, 62.5, 62.5, 65, 67.5]
    },
    {
      name: 'Agachamento',
      dates: ['2025-06-02', '2025-06-06', '2025-06-10', '2025-06-13'],
      weights: [80, 82.5, 85, 87.5]
    },
    {
      name: 'Desenvolvimento',
      dates: ['2025-06-03', '2025-06-07', '2025-06-11', '2025-06-14'],
      weights: [40, 42.5, 42.5, 45]
    }
  ];

  const getCurrentWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const hasWorkoutOnDate = (date: string) => {
    return workoutHistory.some(workout => workout.date === date);
  };

  const getWorkoutForDate = (date: string) => {
    return workoutHistory.find(workout => workout.date === date);
  };

  const renderCalendarView = () => {
    const currentWeek = getCurrentWeek();
    
    return (
      <View style={styles.calendarContainer}>
        <Text style={styles.sectionTitle}>Esta Semana</Text>
        
        {/* Week View */}
        <View style={styles.weekView}>
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => {
            const date = currentWeek[index];
            const dateStr = formatDate(date);
            const hasWorkout = hasWorkoutOnDate(dateStr);
            const isToday = formatDate(new Date()) === dateStr;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayContainer,
                  hasWorkout && styles.dayWithWorkout,
                  isToday && styles.dayToday
                ]}
              >
                <Text style={[
                  styles.dayLabel,
                  isToday && styles.dayTodayText
                ]}>{day}</Text>
                <Text style={[
                  styles.dayNumber,
                  isToday && styles.dayTodayText
                ]}>{date.getDate()}</Text>
                {hasWorkout && (
                  <View style={styles.workoutIndicator} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent Workouts */}
        <Text style={styles.sectionTitle}>Treinos Recentes</Text>
        {workoutHistory.slice(0, 5).map((workout, index) => (
          <TouchableOpacity key={index} style={styles.workoutItem}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutDate}>
                {new Date(workout.date).toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </Text>
              <Text style={styles.workoutDuration}>{workout.duration}</Text>
            </View>
            <Text style={styles.workoutName}>{workout.workoutName}</Text>
            <Text style={styles.workoutStats}>
              {workout.exercises} exercícios • {workout.totalSets} séries
            </Text>
            {workout.notes && (
              <Text style={styles.workoutNotes} numberOfLines={2}>
                {workout.notes}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderProgressChart = (exercise: ExerciseProgress) => {
    const maxWeight = Math.max(...exercise.weights);
    const minWeight = Math.min(...exercise.weights);
    const range = maxWeight - minWeight || 1;
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <View style={styles.chart}>
          {exercise.weights.map((weight, index) => {
            const height = ((weight - minWeight) / range) * 80 + 20;
            const isLast = index === exercise.weights.length - 1;
            
            return (
              <View key={index} style={styles.chartColumn}>
                <Text style={styles.weightLabel}>{weight}kg</Text>
                <View
                  style={[
                    styles.chartBar,
                    { height },
                    isLast && styles.chartBarCurrent
                  ]}
                />
                <Text style={styles.dateLabel}>
                  {new Date(exercise.dates[index]).getDate()}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.progressSummary}>
          <Text style={styles.progressText}>
            Progresso: +{(exercise.weights[exercise.weights.length - 1] - exercise.weights[0]).toFixed(1)}kg
          </Text>
        </View>
      </View>
    );
  };

  const renderProgressView = () => {
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.sectionTitle}>Evolução dos Exercícios</Text>
        
        {/* Exercise Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, !selectedExercise && styles.filterButtonActive]}
            onPress={() => setSelectedExercise(null)}
          >
            <Text style={[styles.filterText, !selectedExercise && styles.filterTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          {exerciseProgress.map((exercise) => (
            <TouchableOpacity
              key={exercise.name}
              style={[
                styles.filterButton,
                selectedExercise === exercise.name && styles.filterButtonActive
              ]}
              onPress={() => setSelectedExercise(exercise.name)}
            >
              <Text style={[
                styles.filterText,
                selectedExercise === exercise.name && styles.filterTextActive
              ]}>
                {exercise.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Progress Charts */}
        <ScrollView>
          {exerciseProgress
            .filter(exercise => !selectedExercise || exercise.name === selectedExercise)
            .map((exercise, index) => (
              <View key={index}>
                {renderProgressChart(exercise)}
              </View>
            ))}
        </ScrollView>
      </View>
    );
  };

  const renderSearchView = () => {
    const filteredWorkouts = workoutHistory.filter(workout =>
      workout.workoutName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar treinos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {searchQuery ? `Resultados (${filteredWorkouts.length})` : 'Todos os Treinos'}
        </Text>

        {filteredWorkouts.map((workout, index) => (
          <TouchableOpacity key={index} style={styles.workoutItem}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutDate}>
                {new Date(workout.date).toLocaleDateString('pt-BR')}
              </Text>
              <Text style={styles.workoutDuration}>{workout.duration}</Text>
            </View>
            <Text style={styles.workoutName}>{workout.workoutName}</Text>
            <Text style={styles.workoutStats}>
              {workout.exercises} exercícios • {workout.totalSets} séries
            </Text>
            {workout.notes && (
              <Text style={styles.workoutNotes}>{workout.notes}</Text>
            )}
          </TouchableOpacity>
        ))}

        {filteredWorkouts.length === 0 && searchQuery && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#E5E5EA" />
            <Text style={styles.emptyStateText}>Nenhum treino encontrado</Text>
            <Text style={styles.emptyStateSubtext}>
              Tente buscar por outro termo
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tab, selectedView === 'calendar' && styles.tabActive]}
            onPress={() => setSelectedView('calendar')}
          >
            <Ionicons
              name="calendar"
              size={20}
              color={selectedView === 'calendar' ? '#FFFFFF' : '#8E8E93'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedView === 'progress' && styles.tabActive]}
            onPress={() => setSelectedView('progress')}
          >
            <Ionicons
              name="trending-up"
              size={20}
              color={selectedView === 'progress' ? '#FFFFFF' : '#8E8E93'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedView === 'search' && styles.tabActive]}
            onPress={() => setSelectedView('search')}
          >
            <Ionicons
              name="search"
              size={20}
              color={selectedView === 'search' ? '#FFFFFF' : '#8E8E93'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {selectedView === 'calendar' && renderCalendarView()}
        {selectedView === 'progress' && renderProgressView()}
        {selectedView === 'search' && renderSearchView()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  
  // Calendar View
  calendarContainer: {
    paddingBottom: 20,
  },
  weekView: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  dayWithWorkout: {
    backgroundColor: '#E3F2FD',
  },
  dayToday: {
    backgroundColor: '#007AFF',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  dayTodayText: {
    color: '#FFFFFF',
  },
  workoutIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginTop: 4,
  },
  workoutItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  workoutDuration: {
    fontSize: 14,
    color: '#8E8E93',
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  workoutStats: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  workoutNotes: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  
  // Progress View
  progressContainer: {
    paddingBottom: 20,
  },
  filterScroll: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: 16,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  weightLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginBottom: 4,
  },
  chartBar: {
    width: '80%',
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 4,
  },
  chartBarCurrent: {
    backgroundColor: '#007AFF',
  },
  dateLabel: {
    fontSize: 10,
    color: '#8E8E93',
  },
  progressSummary: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  
  // Search View
  searchContainer: {
    paddingBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
});