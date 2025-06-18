import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { WorkoutHistoryMapper } from '@/utils/workoutHistoryMapper';

interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

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

export default function ExerciseExecution() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, activeWorkout } = useCurrentUser();
  const { saveWorkoutHistory, loading: savingHistory, error: saveError, success: saveSuccess } = useWorkoutHistory();
  
  // Get exercises data from navigation params
  const exercises: Exercise[] = params.exercises 
    ? JSON.parse(params.exercises as string) 
    : [];
  const trainingDayName = params.trainingDayName as string || 'Treino de Hoje';
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [currentSet, setCurrentSet] = useState(0);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [exerciseNotes, setExerciseNotes] = useState('');
  const [countdownTime, setCountdownTime] = useState(0);
  const [initialCountdownTime, setInitialCountdownTime] = useState(0);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);
  const [currentRestIntervalIndex, setCurrentRestIntervalIndex] = useState(0);
  const [showRestOptions, setShowRestOptions] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [workoutStartTime] = useState(new Date());
  const [allExerciseSets, setAllExerciseSets] = useState<Map<number, ExerciseSet[]>>(new Map());
  const [allExerciseNotes, setAllExerciseNotes] = useState<Map<number, string>>(new Map());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

  const currentExercise = exercises[currentExerciseIndex];

  // Redirect back if no exercises are provided
  useEffect(() => {
    if (exercises.length === 0) {
      Alert.alert('Erro', 'Nenhum exercício encontrado para este treino.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [exercises.length, router]);

  useEffect(() => {
    if (currentExercise) {
      // Load existing sets for this exercise if any
      const existingSets = allExerciseSets.get(currentExerciseIndex);
      if (existingSets) {
        setSets(existingSets);
        // Find current set index
        const nextIncompleteSet = existingSets.findIndex(set => !set.completed);
        setCurrentSet(nextIncompleteSet >= 0 ? nextIncompleteSet : existingSets.length - 1);
      } else {
        // Initialize sets for current exercise
        const initialSets: ExerciseSet[] = Array.from({ length: currentExercise.sets }, (_, index) => ({
          id: `set-${index}`,
          weight: 0,
          reps: 0,
          completed: false,
        }));
        setSets(initialSets);
        setCurrentSet(0);
      }
      
      // Load existing notes
      const existingNotes = allExerciseNotes.get(currentExerciseIndex) || '';
      setExerciseNotes(existingNotes);
      
      setWeight('');
      setReps('');
    }
  }, [currentExerciseIndex, currentExercise?.sets, allExerciseSets, allExerciseNotes]);

  useEffect(() => {
    if (isResting && restTimer > 0) {
      timerRef.current = setTimeout(() => {
        setRestTimer(restTimer - 1);
      }, 1000);
    } else if (restTimer === 0 && isResting) {
      setIsResting(false);
      setShowRestOptions(false);
      Vibration.vibrate([200, 100, 200]);
      Alert.alert('Descanso Finalizado!', 'Hora da próxima série!');
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [restTimer, isResting]);

  // Countdown effect
  useEffect(() => {
    if (isCountdownRunning && countdownTime > 0) {
      stopwatchRef.current = setTimeout(() => {
        setCountdownTime(countdownTime - 1);
      }, 1000);
    } else if (countdownTime === 0 && isCountdownRunning) {
      setIsCountdownRunning(false);
      Vibration.vibrate([300, 200, 300]);
      Alert.alert('Tempo Finalizado!', 'O tempo do exercício acabou!');
    }

    return () => {
      if (stopwatchRef.current) {
        clearTimeout(stopwatchRef.current);
      }
    };
  }, [countdownTime, isCountdownRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCountdown = () => {
    if (countdownTime > 0) {
      setIsCountdownRunning(true);
    } else {
      setShowTimeSelector(true);
    }
  };

  const pauseCountdown = () => {
    setIsCountdownRunning(false);
  };

  const resetCountdown = () => {
    setIsCountdownRunning(false);
    setCountdownTime(initialCountdownTime);
  };

  const setCountdownTimer = (seconds: number) => {
    setCountdownTime(seconds);
    setInitialCountdownTime(seconds);
    setIsCountdownRunning(false);
    setShowTimeSelector(false);
  };

  const handleFinishExercise = () => {
    Alert.alert(
      'Finalizar Exercício',
      `Deseja marcar "${currentExercise?.name}" como concluído?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'default',
          onPress: () => {
            const newCompleted = new Set(completedExercises);
            newCompleted.add(currentExerciseIndex);
            setCompletedExercises(newCompleted);
            
            // Reset current exercise state
            setCurrentSet(0);
            setWeight('');
            setReps('');
            setIsCountdownRunning(false);
            setIsResting(false);
            
            // Find next uncompleted exercise or stay on current
            const nextUncompletedIndex = exercises.findIndex((_, index) => 
              index > currentExerciseIndex && !newCompleted.has(index)
            );
            
            if (nextUncompletedIndex !== -1) {
              setCurrentExerciseIndex(nextUncompletedIndex);
            }
          }
        }
      ]
    );
  };

  const handleSelectExercise = (exerciseIndex: number) => {
    // Save current exercise notes before switching
    if (exerciseNotes.trim()) {
      setAllExerciseNotes(prev => new Map(prev.set(currentExerciseIndex, exerciseNotes)));
    }
    
    setCurrentExerciseIndex(exerciseIndex);
    setShowExerciseDropdown(false);
    
    // Reset states for new exercise
    setWeight('');
    setReps('');
    setIsCountdownRunning(false);
    setIsResting(false);
    setShowRestOptions(false);
  };

  const isExerciseCompleted = (index: number) => {
    return completedExercises.has(index);
  };

  const getCompletedExercisesCount = () => {
    return completedExercises.size;
  };

  const isWorkoutFullyCompleted = () => {
    return completedExercises.size === exercises.length;
  };

  const getRestIntervals = () => {
    return currentExercise?.restIntervals || [];
  };

  const getAvailableCountdownTimes = () => {
    const restIntervals = getRestIntervals();
    const times = restIntervals.map(interval => ({
      label: interval.intervalTime,
      seconds: parseRestTime(interval.intervalTime),
      id: interval.id
    }));
    
    // Add some common preset times if no intervals available
    if (times.length === 0) {
      return [
        { label: '30s', seconds: 30, id: 'preset-30' },
        { label: '45s', seconds: 45, id: 'preset-45' },
        { label: '60s', seconds: 60, id: 'preset-60' },
        { label: '90s', seconds: 90, id: 'preset-90' },
        { label: '2m', seconds: 120, id: 'preset-120' },
        { label: '3m', seconds: 180, id: 'preset-180' },
      ];
    }
    
    // Sort by time ascending
    return times.sort((a, b) => a.seconds - b.seconds);
  };

  const parseRestTime = (timeString: string): number => {
    // Handle formats like "60s", "1m 30s", "90", etc.
    if (!timeString) return 60;
    
    const cleanTime = timeString.toLowerCase().replace(/\s+/g, '');
    
    // If it's just a number, assume seconds
    if (/^\d+$/.test(cleanTime)) {
      return parseInt(cleanTime);
    }
    
    // Parse formats like "60s", "1m", "1m30s"
    let totalSeconds = 0;
    const minuteMatch = cleanTime.match(/(\d+)m/);
    const secondMatch = cleanTime.match(/(\d+)s/);
    
    if (minuteMatch) {
      totalSeconds += parseInt(minuteMatch[1]) * 60;
    }
    if (secondMatch) {
      totalSeconds += parseInt(secondMatch[1]);
    }
    
    return totalSeconds || 60;
  };

  const handleCompleteSet = () => {
    if (!weight || !reps) {
      Alert.alert('Dados Incompletos', 'Por favor, insira o peso e as repetições.');
      return;
    }

    const updatedSets = [...sets];
    updatedSets[currentSet] = {
      ...updatedSets[currentSet],
      weight: parseFloat(weight),
      reps: parseInt(reps),
      completed: true,
    };
    setSets(updatedSets);
    
    // Store sets for this exercise
    setAllExerciseSets(prev => new Map(prev.set(currentExerciseIndex, updatedSets)));

    // Start rest timer if not the last set
    if (currentSet < (currentExercise?.sets || 0) - 1) {
      const restIntervals = getRestIntervals();
      let restTimeInSeconds = 60; // default
      
      if (restIntervals.length > 0) {
        // Use the interval based on current set or first available
        const intervalIndex = Math.min(currentSet, restIntervals.length - 1);
        const interval = restIntervals[intervalIndex];
        restTimeInSeconds = parseRestTime(interval.intervalTime);
        setCurrentRestIntervalIndex(intervalIndex);
      } else {
        // Fallback to exercise rest property
        restTimeInSeconds = parseRestTime(currentExercise?.rest || '60s');
      }
      
      setRestTimer(restTimeInSeconds);
      setIsResting(true);
      setShowRestOptions(true);
      setCurrentSet(currentSet + 1);
      
      // Reset countdown for rest period
      setIsCountdownRunning(false);
      
      // Suggest weight for next set (increase slightly)
      const nextWeight = (parseFloat(weight) + 2.5).toString();
      setWeight(nextWeight);
      setReps('');
    } else {
      // Exercise completed
      Alert.alert(
        'Exercício Concluído!',
        'Parabéns! Você completou todas as séries.',
        [
          {
            text: 'Próximo Exercício',
            onPress: handleNextExercise,
          }
        ]
      );
    }
  };

  const handleNextExercise = () => {
    if (isWorkoutFullyCompleted()) {
      Alert.alert(
        'Treino Finalizado!',
        'Parabéns! Você completou todos os exercícios do treino. Deseja salvar o histórico?',
        [
          {
            text: 'Não Salvar',
            style: 'cancel',
            onPress: () => router.back(),
          },
          {
            text: 'Salvar e Finalizar',
            onPress: handleSaveWorkoutHistory,
          }
        ]
      );
      return;
    }

    // Find next uncompleted exercise
    const nextUncompletedIndex = exercises.findIndex((_, index) => 
      index > currentExerciseIndex && !isExerciseCompleted(index)
    );
    
    if (nextUncompletedIndex !== -1) {
      setCurrentExerciseIndex(nextUncompletedIndex);
    } else {
      // No more exercises ahead, find any uncompleted exercise
      const anyUncompletedIndex = exercises.findIndex((_, index) => 
        !isExerciseCompleted(index)
      );
      
      if (anyUncompletedIndex !== -1) {
        setCurrentExerciseIndex(anyUncompletedIndex);
      } else {
        // All exercises completed
        Alert.alert(
          'Treino Finalizado!',
          'Parabéns! Você completou todos os exercícios do treino. Deseja salvar o histórico?',
          [
            {
              text: 'Não Salvar',
              style: 'cancel',
              onPress: () => router.back(),
            },
            {
              text: 'Salvar e Finalizar',
              onPress: handleSaveWorkoutHistory,
            }
          ]
        );
      }
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimer(0);
    setShowRestOptions(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleAddRestTime = () => {
    setRestTimer(restTimer + 30);
  };

  const handleSelectRestInterval = (interval: RestInterval) => {
    const restTimeInSeconds = parseRestTime(interval.intervalTime);
    setRestTimer(restTimeInSeconds);
    setCurrentRestIntervalIndex(getRestIntervals().indexOf(interval));
  };

  const handleCustomRestTime = () => {
    Alert.prompt(
      'Tempo Personalizado',
      'Digite o tempo de descanso (ex: 90s, 2m, 1m30s):',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'OK',
          onPress: (text) => {
            if (text) {
              const customTime = parseRestTime(text);
              setRestTimer(customTime);
            }
          }
        }
      ],
      'plain-text',
      '90s'
    );
  };

  const getLastSetWeight = () => {
    if (currentSet > 0 && sets[currentSet - 1].completed) {
      return sets[currentSet - 1].weight.toString();
    }
    return '';
  };

  const getLastSetReps = () => {
    if (currentSet > 0 && sets[currentSet - 1].completed) {
      return sets[currentSet - 1].reps.toString();
    }
    return '';
  };

  const handleSaveWorkoutHistory = async () => {
    if (!user || !activeWorkout) {
      Alert.alert('Erro', 'Dados do usuário ou treino não encontrados.');
      return;
    }

    try {
      // Save current exercise notes if any
      if (exerciseNotes.trim()) {
        setAllExerciseNotes(prev => new Map(prev.set(currentExerciseIndex, exerciseNotes)));
      }

      const executionData = {
        userId: user.id,
        workoutId: activeWorkout.id,
        workoutName: activeWorkout.name,
        trainingDayName,
        trainingDayOrder: 1, // Could be enhanced to get actual day order
        exercises,
        executedSets: allExerciseSets,
        exerciseNotes: allExerciseNotes,
        startTime: workoutStartTime,
        endTime: new Date(),
      };

      const historyData = WorkoutHistoryMapper.mapToWorkoutHistory(executionData);
      await saveWorkoutHistory(historyData);
      
      Alert.alert(
        'Sucesso!',
        'Histórico do treino salvo com sucesso.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving workout history:', error);
      Alert.alert(
        'Erro',
        'Não foi possível salvar o histórico. Deseja tentar novamente?',
        [
          { text: 'Não', style: 'cancel', onPress: () => router.back() },
          { text: 'Tentar Novamente', onPress: handleSaveWorkoutHistory }
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.exerciseSelector}
          onPress={() => setShowExerciseDropdown(true)}
        >
          <View style={styles.progressInfo}>
            <Text style={styles.exerciseCounter}>
              {currentExerciseIndex + 1} de {exercises.length}
            </Text>
            <Text style={styles.completedCounter}>
              {getCompletedExercisesCount()} concluídos
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Saving Status */}
      {savingHistory && (
        <View style={styles.savingStatusCard}>
          <Ionicons name="cloud-upload" size={20} color="#007AFF" />
          <Text style={styles.savingStatusText}>Salvando histórico...</Text>
        </View>
      )}
      
      {saveSuccess && (
        <View style={styles.successStatusCard}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.successStatusText}>Histórico salvo com sucesso!</Text>
        </View>
      )}
      
      {saveError && (
        <View style={styles.errorStatusCard}>
          <Ionicons name="alert-circle" size={20} color="#FF3B30" />
          <Text style={styles.errorStatusText}>Erro ao salvar histórico</Text>
        </View>
      )}

      {/* Exercise Info */}
      <View style={styles.exerciseCard}>
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseName}>{currentExercise?.name || 'Exercício'}</Text>
        </View>
        <Text style={styles.exerciseTarget}>
          Meta: {currentExercise?.sets || 0} séries • {currentExercise?.reps || '0'} repetições
        </Text>
      </View>

      {/* Countdown Timer */}
      <View style={styles.stopwatchCard}>
        <View style={styles.countdownHeader}>
          <Text style={styles.stopwatchTitle}>Timer do Exercício</Text>
          <TouchableOpacity 
            style={styles.timeSelectButton} 
            onPress={() => setShowTimeSelector(true)}
          >
            <Ionicons name="time" size={16} color="#007AFF" />
            <Text style={styles.timeSelectButtonText}>Tempo</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[
          styles.stopwatchTime,
          countdownTime <= 10 && countdownTime > 0 && isCountdownRunning && styles.warningTime
        ]}>
          {formatTime(countdownTime)}
        </Text>
        
        {initialCountdownTime > 0 && (
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: `${(countdownTime / initialCountdownTime) * 100}%` }
              ]} />
            </View>
            <Text style={styles.progressText}>
              {initialCountdownTime > 0 ? `${formatTime(initialCountdownTime)} inicial` : ''}
            </Text>
          </View>
        )}

        <View style={styles.stopwatchActions}>
          {!isCountdownRunning ? (
            <TouchableOpacity style={styles.stopwatchButton} onPress={startCountdown}>
              <Ionicons name="play" size={20} color="#007AFF" />
              <Text style={styles.stopwatchButtonText}>
                {countdownTime > 0 ? 'Iniciar' : 'Definir Tempo'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopwatchButton} onPress={pauseCountdown}>
              <Ionicons name="pause" size={20} color="#FF9500" />
              <Text style={styles.stopwatchButtonText}>Pausar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.stopwatchButton} onPress={resetCountdown}>
            <Ionicons name="refresh" size={20} color="#8E8E93" />
            <Text style={styles.stopwatchButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Selector Modal */}
      {showTimeSelector && (
        <View style={styles.timeSelectorOverlay}>
          <View style={styles.timeSelectorCard}>
            <Text style={styles.timeSelectorTitle}>Escolha o Tempo do Exercício</Text>
            <ScrollView style={styles.timeOptionsScroll}>
              {getAvailableCountdownTimes().map((time) => (
                <TouchableOpacity
                  key={time.id}
                  style={styles.timeOption}
                  onPress={() => setCountdownTimer(time.seconds)}
                >
                  <Text style={styles.timeOptionLabel}>{time.label}</Text>
                  <Text style={styles.timeOptionTime}>{formatTime(time.seconds)}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.timeOption}
                onPress={() => {
                  Alert.prompt(
                    'Tempo Personalizado',
                    'Digite o tempo (ex: 90s, 2m, 1m30s):',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'OK',
                        onPress: (text) => {
                          if (text) {
                            const customTime = parseRestTime(text);
                            setCountdownTimer(customTime);
                          }
                        }
                      }
                    ],
                    'plain-text',
                    '90s'
                  );
                }}
              >
                <Ionicons name="create" size={20} color="#007AFF" />
                <Text style={styles.timeOptionLabel}>Personalizado</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity
              style={styles.timeSelectorCloseButton}
              onPress={() => setShowTimeSelector(false)}
            >
              <Text style={styles.timeSelectorCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Exercise Dropdown Modal */}
      {showExerciseDropdown && (
        <View style={styles.timeSelectorOverlay}>
          <View style={styles.timeSelectorCard}>
            <Text style={styles.timeSelectorTitle}>Selecionar Exercício</Text>
            <ScrollView style={styles.timeOptionsScroll}>
              {exercises.map((exercise, index) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exerciseOption,
                    index === currentExerciseIndex && styles.exerciseOptionActive,
                    isExerciseCompleted(index) && styles.exerciseOptionCompleted
                  ]}
                  onPress={() => handleSelectExercise(index)}
                >
                  <View style={styles.exerciseOptionContent}>
                    <View style={styles.exerciseOptionHeader}>
                      <Text style={[
                        styles.exerciseOptionNumber,
                        index === currentExerciseIndex && styles.exerciseOptionActiveText,
                        isExerciseCompleted(index) && styles.exerciseOptionCompletedText
                      ]}>
                        {index + 1}
                      </Text>
                      <Text style={[
                        styles.exerciseOptionName,
                        index === currentExerciseIndex && styles.exerciseOptionActiveText,
                        isExerciseCompleted(index) && styles.exerciseOptionCompletedText
                      ]}>
                        {exercise.name}
                      </Text>
                    </View>
                    <Text style={[
                      styles.exerciseOptionDetails,
                      index === currentExerciseIndex && styles.exerciseOptionActiveText,
                      isExerciseCompleted(index) && styles.exerciseOptionCompletedText
                    ]}>
                      {exercise.sets} séries • {exercise.reps}
                    </Text>
                  </View>
                  {isExerciseCompleted(index) && (
                    <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                  )}
                  {index === currentExerciseIndex && !isExerciseCompleted(index) && (
                    <View style={styles.currentIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.timeSelectorCloseButton}
              onPress={() => setShowExerciseDropdown(false)}
            >
              <Text style={styles.timeSelectorCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Current Set Info */}
      <View style={styles.currentSetCard}>
        <Text style={styles.currentSetTitle}>
          Série {currentSet + 1} de {currentExercise?.sets || 0}
        </Text>
        
        {/* Weight and Reps Input */}
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder={getLastSetWeight() || "0"}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Repetições</Text>
            <TextInput
              style={styles.input}
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
              placeholder={getLastSetReps() || "0"}
            />
          </View>
        </View>

        {/* Complete Set Button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            (!weight || !reps) && styles.completeButtonDisabled
          ]}
          onPress={handleCompleteSet}
          disabled={!weight || !reps}
        >
          <Text style={styles.completeButtonText}>Concluir Série</Text>
        </TouchableOpacity>
      </View>

      {/* Rest Timer */}
      {isResting && (
        <View style={styles.restTimerCard}>
          <Text style={styles.restTimerTitle}>Tempo de Descanso</Text>
          <Text style={styles.restTimerTime}>{formatTime(restTimer)}</Text>
          
          {/* Rest Interval Options */}
          {showRestOptions && getRestIntervals().length > 1 && (
            <View style={styles.restIntervalOptions}>
              <Text style={styles.restOptionsTitle}>Intervalos Disponíveis:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.restIntervalScroll}>
                {getRestIntervals().map((interval, index) => (
                  <TouchableOpacity
                    key={interval.id}
                    style={[
                      styles.restIntervalButton,
                      index === currentRestIntervalIndex && styles.restIntervalButtonActive
                    ]}
                    onPress={() => handleSelectRestInterval(interval)}
                  >
                    <Text style={[
                      styles.restIntervalButtonText,
                      index === currentRestIntervalIndex && styles.restIntervalButtonTextActive
                    ]}>
                      {interval.intervalTime}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.restIntervalButton} onPress={handleCustomRestTime}>
                  <Ionicons name="create" size={16} color="#007AFF" />
                  <Text style={styles.restIntervalButtonText}>Custom</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          <View style={styles.restTimerActions}>
            <TouchableOpacity style={styles.restButton} onPress={handleAddRestTime}>
              <Ionicons name="add" size={20} color="#007AFF" />
              <Text style={styles.restButtonText}>+30s</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.restButton} onPress={handleSkipRest}>
              <Ionicons name="play-skip-forward" size={20} color="#007AFF" />
              <Text style={styles.restButtonText}>Pular</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sets History */}
      <View style={styles.setsHistoryCard}>
        <Text style={styles.setsHistoryTitle}>Histórico das Séries</Text>
        {sets.map((set, index) => (
          <View
            key={set.id}
            style={[
              styles.setRow,
              set.completed && styles.setRowCompleted,
              index === currentSet && styles.setRowCurrent
            ]}
          >
            <Text style={styles.setNumber}>Série {index + 1}</Text>
            {set.completed ? (
              <Text style={styles.setData}>
                {set.weight}kg × {set.reps} reps
              </Text>
            ) : (
              <Text style={styles.setPlaceholder}>
                {index === currentSet ? 'Em andamento...' : 'Aguardando...'}
              </Text>
            )}
            {set.completed && (
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            )}
          </View>
        ))}
      </View>

      {/* Exercise Notes */}
      <View style={styles.notesCard}>
        <Text style={styles.notesTitle}>Anotações do Exercício</Text>
        <TextInput
          style={styles.notesInput}
          value={exerciseNotes}
          onChangeText={setExerciseNotes}
          placeholder="Adicione suas observações sobre este exercício..."
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Finish Exercise Button */}
      <View style={styles.finishExerciseCard}>
        <TouchableOpacity
          style={[
            styles.finishExerciseButton,
            isExerciseCompleted(currentExerciseIndex) && styles.exerciseCompletedButton
          ]}
          onPress={handleFinishExercise}
        >
          {isExerciseCompleted(currentExerciseIndex) ? (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.exerciseCompletedButtonText}>Exercício Concluído</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              <Text style={styles.finishExerciseButtonText}>Finalizar Exercício</Text>
            </>
          )}
        </TouchableOpacity>
        
        {isExerciseCompleted(currentExerciseIndex) && (
          <TouchableOpacity
            style={styles.undoButton}
            onPress={() => {
              const newCompleted = new Set(completedExercises);
              newCompleted.delete(currentExerciseIndex);
              setCompletedExercises(newCompleted);
            }}
          >
            <Ionicons name="arrow-undo" size={16} color="#FF9500" />
            <Text style={styles.undoButtonText}>Desfazer</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Navigation */}
      <View style={styles.navigationCard}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentExerciseIndex === 0 && styles.navButtonDisabled
          ]}
          onPress={handlePreviousExercise}
          disabled={currentExerciseIndex === 0}
        >
          <Ionicons name="chevron-back" size={20} color="#007AFF" />
          <Text style={styles.navButtonText}>Anterior</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.navButton,
            isWorkoutFullyCompleted() && styles.finishWorkoutButton
          ]}
          onPress={handleNextExercise}
        >
          <Text style={[
            styles.navButtonText,
            isWorkoutFullyCompleted() && styles.finishWorkoutButtonText
          ]}>
            {isWorkoutFullyCompleted() ? 'Finalizar Treino' : 'Próximo Exercício'}
          </Text>
          <Ionicons 
            name={isWorkoutFullyCompleted() ? "checkmark" : "chevron-forward"} 
            size={20} 
            color={isWorkoutFullyCompleted() ? "#FFFFFF" : "#007AFF"} 
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  progressInfo: {
    alignItems: 'center',
  },
  exerciseCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  exerciseCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  videoButton: {
    marginLeft: 12,
  },
  exerciseTarget: {
    fontSize: 16,
    color: '#8E8E93',
  },
  currentSetCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentSetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#F8F9FA',
  },
  completeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  restTimerCard: {
    margin: 16,
    marginTop: 0,
    padding: 24,
    backgroundColor: '#FFF3CD',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFE69C',
    alignItems: 'center',
  },
  restTimerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#996D1B',
    marginBottom: 8,
  },
  restTimerTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#996D1B',
    marginBottom: 16,
  },
  restTimerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  restButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  restButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  setsHistoryCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  setsHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  setRowCompleted: {
    backgroundColor: '#E8F5E8',
  },
  setRowCurrent: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  setData: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  setPlaceholder: {
    fontSize: 16,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  notesCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  navigationCard: {
    margin: 16,
    marginTop: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    gap: 8,
  },
  navButtonDisabled: {
    borderColor: '#E5E5EA',
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  stopwatchCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  stopwatchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  stopwatchTime: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  stopwatchActions: {
    flexDirection: 'row',
    gap: 16,
  },
  stopwatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  stopwatchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  restIntervalOptions: {
    width: '100%',
    marginBottom: 16,
  },
  restOptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#996D1B',
    marginBottom: 8,
  },
  restIntervalScroll: {
    maxHeight: 50,
  },
  restIntervalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: 4,
  },
  restIntervalButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  restIntervalButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  restIntervalButtonTextActive: {
    color: '#FFFFFF',
  },
  countdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  timeSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  timeSelectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  warningTime: {
    color: '#FF3B30',
    textShadowColor: '#FF3B30',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  timeSelectorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  timeSelectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '70%',
    minWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  timeSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeOptionsScroll: {
    maxHeight: 300,
  },
  timeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    gap: 8,
  },
  timeOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  timeOptionTime: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: 'monospace',
  },
  timeSelectorCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#8E8E93',
    borderRadius: 8,
    alignItems: 'center',
  },
  timeSelectorCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exerciseSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  completedCounter: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  exerciseOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  exerciseOptionActive: {
    backgroundColor: '#F0F8FF',
    borderBottomColor: '#007AFF',
  },
  exerciseOptionCompleted: {
    backgroundColor: '#F0F9F5',
    borderBottomColor: '#34C759',
  },
  exerciseOptionContent: {
    flex: 1,
    marginRight: 12,
  },
  exerciseOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  exerciseOptionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8E8E93',
    minWidth: 24,
  },
  exerciseOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  exerciseOptionDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 32,
  },
  exerciseOptionActiveText: {
    color: '#007AFF',
  },
  exerciseOptionCompletedText: {
    color: '#34C759',
  },
  currentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  finishWorkoutButton: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  finishWorkoutButtonText: {
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 24, // Same width as the back button for balance
  },
  finishExerciseCard: {
    margin: 16,
    marginTop: 0,
  },
  finishExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseCompletedButton: {
    backgroundColor: '#34C759',
  },
  finishExerciseButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  exerciseCompletedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  undoButtonText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '600',
  },
  savingStatusCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  successStatusCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#F0F9F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  errorStatusCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
});