import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useExerciseHistory } from "@/hooks/useExerciseHistory";
import { WorkoutHistoryMapper } from "@/utils/workoutHistoryMapper";
import {
  saveWorkoutState,
  loadWorkoutState,
  clearWorkoutState,
  WorkoutExecutionState,
} from "@/utils/workoutStorage";

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
  const {
    saveWorkoutHistory,
    loading: savingHistory,
    error: saveError,
    success: saveSuccess,
    progress,
  } = useWorkoutHistory();
  const { getExerciseHistory, loading: historyLoading } = useExerciseHistory(
    user?.id || ""
  );

  // Get exercises data from navigation params
  const exercises: Exercise[] = params.exercises
    ? JSON.parse(params.exercises as string)
    : [];
  const trainingDayName =
    (params.trainingDayName as string) || "Treino de Hoje";
  const isResuming = params.resumeState === "true";

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sets, setSets] = useState<ExerciseSet[]>([]);
  const [currentSet, setCurrentSet] = useState(0);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [exerciseNotes, setExerciseNotes] = useState("");
  const [currentRestIntervalIndex, setCurrentRestIntervalIndex] = useState(0);
  const [showRestOptions, setShowRestOptions] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(
    new Set()
  );
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(new Date());
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false);
  const [allExerciseSets, setAllExerciseSets] = useState<
    Map<number, ExerciseSet[]>
  >(new Map());
  const [allExerciseNotes, setAllExerciseNotes] = useState<Map<number, string>>(
    new Map()
  );
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editReps, setEditReps] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const currentExercise = exercises[currentExerciseIndex];

  // Get exercise history for the current exercise
  const exerciseHistory = currentExercise
    ? getExerciseHistory(currentExercise.id, 3)
    : [];

  const getSuggestedWeightFromHistory = () => {
    if (exerciseHistory.length === 0) return "";

    // Get the most recent session's first set weight
    const lastSession = exerciseHistory[0];
    const firstSet = lastSession.sets.find((set) => set.setNumber === 1);

    return firstSet?.weight ? firstSet.weight.toString() : "";
  };

  // Function to save current workout state
  const saveCurrentWorkoutState = async () => {
    if (!user || !activeWorkout) {
      console.log(
        "ExerciseExecution - Cannot save: missing user or activeWorkout"
      );
      return;
    }

    try {
      const workoutState: WorkoutExecutionState = {
        isInProgress: true,
        workoutId: activeWorkout.id,
        trainingDayName,
        exercises,
        currentExerciseIndex,
        allExerciseSets: Object.fromEntries(allExerciseSets),
        allExerciseNotes: Object.fromEntries(allExerciseNotes),
        completedExercises: Array.from(completedExercises),
        workoutStartTime: workoutStartTime.toISOString(),
      };

      console.log("ExerciseExecution - Saving workout state:", workoutState);
      await saveWorkoutState(workoutState);
      console.log("ExerciseExecution - Workout state saved successfully");
    } catch (error) {
      console.error("Error saving workout state:", error);
    }
  };

  // Redirect back if no exercises are provided
  useEffect(() => {
    if (exercises.length === 0) {
      Alert.alert("Erro", "Nenhum exercício encontrado para este treino.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [exercises.length, router]);

  // Restore workout state if resuming
  useEffect(() => {
    const restoreWorkoutState = async () => {
      if (isResuming) {
        try {
          const savedState = await loadWorkoutState();
          if (savedState && savedState.isInProgress) {
            // Restore state
            setCurrentExerciseIndex(savedState.currentExerciseIndex);
            setAllExerciseSets(
              new Map(
                Object.entries(savedState.allExerciseSets).map(([k, v]) => [
                  parseInt(k),
                  v,
                ])
              )
            );
            setAllExerciseNotes(
              new Map(
                Object.entries(savedState.allExerciseNotes).map(([k, v]) => [
                  parseInt(k),
                  v,
                ])
              )
            );
            setCompletedExercises(new Set(savedState.completedExercises));
            setWorkoutStartTime(new Date(savedState.workoutStartTime));
          }
        } catch (error) {
          console.error("Error restoring workout state:", error);
        }
      }
    };

    restoreWorkoutState();
  }, [isResuming]);

  // Save initial workout state when starting (not resuming)
  useEffect(() => {
    if (!isResuming && user && activeWorkout) {
      saveCurrentWorkoutState();
    }
  }, [user, activeWorkout, isResuming]);

  // Handle workout history save success
  useEffect(() => {
    if (saveSuccess && progress.step === "completed") {
      Alert.alert("Sucesso!", "Histórico do treino salvo com sucesso.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [saveSuccess, progress.step, router]);

  useEffect(() => {
    if (currentExercise) {
      // Load existing sets for this exercise if any
      const existingSets = allExerciseSets.get(currentExerciseIndex);
      if (existingSets) {
        setSets(existingSets);
        // Find current set index
        const nextIncompleteSet = existingSets.findIndex(
          (set) => !set.completed
        );
        setCurrentSet(
          nextIncompleteSet >= 0 ? nextIncompleteSet : existingSets.length - 1
        );
      } else {
        // Initialize sets for current exercise
        const initialSets: ExerciseSet[] = Array.from(
          { length: currentExercise.sets },
          (_, index) => ({
            id: `set-${index}`,
            weight: 0,
            reps: 0,
            completed: false,
          })
        );
        setSets(initialSets);
        setCurrentSet(0);
      }

      // Load existing notes
      const existingNotes = allExerciseNotes.get(currentExerciseIndex) || "";
      setExerciseNotes(existingNotes);

      // Auto-suggest weight from history for first set
      if (currentSet === 0 || !existingSets) {
        const suggestedWeight = getSuggestedWeightFromHistory();
        setWeight(suggestedWeight);
      } else {
        setWeight("");
      }
      setReps("");
    }
  }, [
    currentExerciseIndex,
    currentExercise?.sets,
    allExerciseSets,
    allExerciseNotes,
  ]);

  useEffect(() => {
    if (isResting && restTimer > 0) {
      timerRef.current = setTimeout(() => {
        setRestTimer(restTimer - 1);
      }, 1000);
    } else if (restTimer === 0 && isResting) {
      setIsResting(false);
      setShowRestOptions(false);
      Vibration.vibrate([200, 100, 200]);
      Alert.alert("Descanso Finalizado!", "Hora da próxima série!");
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [restTimer, isResting]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 14) return "1 semana atrás";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 60) return "1 mês atrás";
    return `${Math.floor(diffDays / 30)} meses atrás`;
  };

  const getMaxWeightFromHistory = () => {
    if (exerciseHistory.length === 0) return null;

    let maxWeight = 0;
    exerciseHistory.forEach((session) => {
      session.sets.forEach((set) => {
        if (set.weight && set.weight > maxWeight) {
          maxWeight = set.weight;
        }
      });
    });

    return maxWeight > 0 ? maxWeight : null;
  };

  const handleFinishExercise = () => {
    const newCompleted = new Set(completedExercises);
    newCompleted.add(currentExerciseIndex);
    setCompletedExercises(newCompleted);

    // Reset current exercise state
    setCurrentSet(0);
    setWeight("");
    setReps("");
    setIsResting(false);
    setRestTimer(0);
    setShowRestOptions(false);

    // Clear timer if running
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Find next uncompleted exercise or stay on current
    const nextUncompletedIndex = exercises.findIndex(
      (_, index) => index > currentExerciseIndex && !newCompleted.has(index)
    );

    if (nextUncompletedIndex !== -1) {
      setCurrentExerciseIndex(nextUncompletedIndex);
    }

    // Save workout state after finishing exercise
    setTimeout(() => saveCurrentWorkoutState(), 100);
  };

  const handleSelectExercise = (exerciseIndex: number) => {
    // Save current exercise notes before switching
    if (exerciseNotes.trim()) {
      setAllExerciseNotes((prev) => {
        const newMap = new Map(prev);
        newMap.set(currentExerciseIndex, exerciseNotes);
        return newMap;
      });
    }

    setCurrentExerciseIndex(exerciseIndex);
    setShowExerciseDropdown(false);

    // Reset states for new exercise
    setWeight("");
    setReps("");
    setIsResting(false);
    setRestTimer(0);
    setShowRestOptions(false);

    // Clear timer if running
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
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

  const parseRestTime = (timeString: string): number => {
    // Handle formats like "60s", "1m 30s", "90", etc.
    if (!timeString) return 60;

    const cleanTime = timeString.toLowerCase().replace(/\s+/g, "");

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
      Alert.alert(
        "Dados Incompletos",
        "Por favor, insira o peso e as repetições."
      );
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
    setAllExerciseSets((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentExerciseIndex, updatedSets);
      return newMap;
    });

    // Save workout state after completing a set
    setTimeout(() => saveCurrentWorkoutState(), 100);

    // Start rest timer if not the last set (including extra sets)
    if (currentSet < sets.length - 1) {
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
        restTimeInSeconds = parseRestTime(currentExercise?.rest || "60s");
      }

      setRestTimer(restTimeInSeconds);
      setIsResting(true);
      setShowRestOptions(true);
      setCurrentSet(currentSet + 1);

      // Suggest weight for next set (increase slightly)
      const nextWeight = (parseFloat(weight) + 2.5).toString();
      setWeight(nextWeight);
      setReps("");
    } else {
      // Last set completed (planned or extra) - clear rest timer first
      setIsResting(false);
      setRestTimer(0);
      setShowRestOptions(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Only show success feedback if all planned sets are done
      if (currentSet + 1 >= getPlannedSetsCount()) {
        setShowSuccessFeedback(true);
        setTimeout(() => {
          setShowSuccessFeedback(false);
        }, 3000); // Hide after 3 seconds

        // Scroll to bottom to focus on finish exercise button
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }
  };

  const handleNextExercise = () => {
    if (isWorkoutFullyCompleted()) {
      Alert.alert(
        "Treino Finalizado!",
        "Parabéns! Você completou todos os exercícios do treino. Deseja salvar o histórico?",
        [
          {
            text: "Não Salvar",
            style: "cancel",
            onPress: () => router.back(),
          },
          {
            text: "Salvar e Finalizar",
            onPress: handleSaveWorkoutHistory,
          },
        ]
      );
      return;
    }

    // Find next uncompleted exercise
    const nextUncompletedIndex = exercises.findIndex(
      (_, index) => index > currentExerciseIndex && !isExerciseCompleted(index)
    );

    if (nextUncompletedIndex !== -1) {
      setCurrentExerciseIndex(nextUncompletedIndex);
    } else {
      // No more exercises ahead, find any uncompleted exercise
      const anyUncompletedIndex = exercises.findIndex(
        (_, index) => !isExerciseCompleted(index)
      );

      if (anyUncompletedIndex !== -1) {
        setCurrentExerciseIndex(anyUncompletedIndex);
      } else {
        // All exercises completed
        Alert.alert(
          "Treino Finalizado!",
          "Parabéns! Você completou todos os exercícios do treino. Deseja salvar o histórico?",
          [
            {
              text: "Não Salvar",
              style: "cancel",
              onPress: () => router.back(),
            },
            {
              text: savingHistory ? "Salvando..." : "Salvar e Finalizar",
              onPress: savingHistory ? undefined : handleSaveWorkoutHistory,
            },
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
      "Tempo Personalizado",
      "Digite o tempo de descanso (ex: 90s, 2m, 1m30s):",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "OK",
          onPress: (text) => {
            if (text) {
              const customTime = parseRestTime(text);
              setRestTimer(customTime);
            }
          },
        },
      ],
      "plain-text",
      "90s"
    );
  };

  const getLastSetWeight = () => {
    if (currentSet > 0 && sets[currentSet - 1].completed) {
      return sets[currentSet - 1].weight.toString();
    }
    return "";
  };

  const getLastSetReps = () => {
    if (currentSet > 0 && sets[currentSet - 1].completed) {
      return sets[currentSet - 1].reps.toString();
    }
    return "";
  };

  const getPlaceholderWeight = () => {
    const lastWeight = getLastSetWeight();
    if (lastWeight) return lastWeight;

    const suggestedWeight = getSuggestedWeightFromHistory();
    if (suggestedWeight) return `${suggestedWeight} (última vez)`;

    return "0";
  };

  const areAllSetsCompleted = () => {
    return sets.length > 0 && sets.every((set) => set.completed);
  };

  const areAllPlannedSetsCompleted = () => {
    const plannedSetsCount = getPlannedSetsCount();
    const result =
      sets.length >= plannedSetsCount &&
      sets.slice(0, plannedSetsCount).every((set) => set.completed);
    return result;
  };

  const getPlannedSetsCount = () => {
    return currentExercise?.sets || 0;
  };

  const getExtraSetsCount = () => {
    return Math.max(0, sets.length - getPlannedSetsCount());
  };

  const handleAddExtraSet = () => {
    const newSetId = `set-${sets.length}`;
    const newSet: ExerciseSet = {
      id: newSetId,
      weight: 0,
      reps: 0,
      completed: false,
    };

    const updatedSets = [...sets, newSet];
    setSets(updatedSets);

    // Set current set to the new extra set
    setCurrentSet(sets.length);

    // Suggest weight from last completed set
    if (sets.length > 0) {
      const lastCompletedSet = sets[sets.length - 1];
      if (lastCompletedSet.completed) {
        setWeight(lastCompletedSet.weight.toString());
        setReps("");
      }
    }

    // Update stored sets
    setAllExerciseSets((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentExerciseIndex, updatedSets);
      return newMap;
    });

    // Save workout state
    setTimeout(() => saveCurrentWorkoutState(), 100);
  };

  const handleEditSet = (setIndex: number) => {
    const setToEdit = sets[setIndex];
    if (setToEdit && setToEdit.completed) {
      setEditingSetIndex(setIndex);
      setEditWeight(setToEdit.weight.toString());
      setEditReps(setToEdit.reps.toString());
    }
  };

  const handleSaveEditedSet = () => {
    if (editingSetIndex !== null && editWeight && editReps) {
      const updatedSets = [...sets];
      updatedSets[editingSetIndex] = {
        ...updatedSets[editingSetIndex],
        weight: parseFloat(editWeight),
        reps: parseInt(editReps),
      };
      setSets(updatedSets);

      // Update the stored sets for this exercise
      setAllExerciseSets((prev) => {
        const newMap = new Map(prev);
        newMap.set(currentExerciseIndex, updatedSets);
        return newMap;
      });

      // Save workout state after editing
      setTimeout(() => saveCurrentWorkoutState(), 100);

      // Reset editing state
      setEditingSetIndex(null);
      setEditWeight("");
      setEditReps("");
    }
  };

  const handleCancelEdit = () => {
    setEditingSetIndex(null);
    setEditWeight("");
    setEditReps("");
  };

  const handleSaveWorkoutHistory = async () => {
    if (!user || !activeWorkout) {
      Alert.alert("Erro", "Dados do usuário ou treino não encontrados.");
      return;
    }

    try {
      // Save current exercise notes if any
      if (exerciseNotes.trim()) {
        setAllExerciseNotes((prev) => {
          const newMap = new Map(prev);
          newMap.set(currentExerciseIndex, exerciseNotes);
          return newMap;
        });
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

      const historyData =
        WorkoutHistoryMapper.mapToWorkoutHistory(executionData);
      await saveWorkoutHistory(historyData);

      // Clear saved workout state since workout is completed
      await clearWorkoutState();

      // Success handled by the useWorkoutHistory hook via progress state
    } catch (error) {
      console.error("Error saving workout history:", error);
      Alert.alert(
        "Erro",
        "Não foi possível salvar o histórico. Deseja tentar novamente?",
        [
          { text: "Não", style: "cancel", onPress: () => router.back() },
          { text: "Tentar Novamente", onPress: handleSaveWorkoutHistory },
        ]
      );
    }
  };

  return (
    <ScrollView ref={scrollViewRef} style={styles.container}>
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

      {/* Success Feedback */}
      {showSuccessFeedback && (
        <View style={styles.successFeedbackCard}>
          <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          <Text style={styles.successFeedbackText}>
            ✅ Todas as séries concluídas!
          </Text>
        </View>
      )}

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
          <Text style={styles.successStatusText}>
            Histórico salvo com sucesso!
          </Text>
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
          <Text style={styles.exerciseName}>
            {currentExercise?.name || "Exercício"}
          </Text>
        </View>
        <Text style={styles.exerciseTarget}>
          Meta: {currentExercise?.sets || 0} séries •{" "}
          {currentExercise?.reps || "0"} repetições
        </Text>
        {getMaxWeightFromHistory() && (
          <Text style={styles.maxWeightText}>
            🏆 Recorde: {getMaxWeightFromHistory()}kg
          </Text>
        )}
      </View>

      {/* Exercise History */}
      {exerciseHistory.length > 0 ? (
        <View style={styles.exerciseHistoryCard}>
          <Text style={styles.exerciseHistoryTitle}>Histórico de Cargas</Text>
          {exerciseHistory.map((session, index) => (
            <View
              key={`${session.date}-${index}`}
              style={styles.historySession}
            >
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>
                  {formatDate(session.date)}
                </Text>
                <Text style={styles.historyWorkout}>
                  {session.trainingDayName}
                </Text>
              </View>
              <View style={styles.historySets}>
                {session.sets.map((set, setIndex) => (
                  <View key={setIndex} style={styles.historySet}>
                    <Text style={styles.historySetNumber}>{set.setNumber}</Text>
                    <Text style={styles.historySetData}>
                      {set.weight ? `${set.weight}kg` : "—"} × {set.reps}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.exerciseHistoryCard}>
          <Text style={styles.exerciseHistoryTitle}>Histórico de Cargas</Text>
          <View style={styles.noHistoryContainer}>
            <Ionicons name="bar-chart-outline" size={24} color="#8E8E93" />
            <Text style={styles.noHistoryText}>
              {historyLoading
                ? "Carregando histórico..."
                : "Primeira vez fazendo este exercício!"}
            </Text>
            <Text style={styles.noHistorySubtext}>
              {historyLoading
                ? ""
                : "Seu histórico aparecerá aqui após completar o treino."}
            </Text>
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
                    index === currentExerciseIndex &&
                      styles.exerciseOptionActive,
                    isExerciseCompleted(index) &&
                      styles.exerciseOptionCompleted,
                  ]}
                  onPress={() => handleSelectExercise(index)}
                >
                  <View style={styles.exerciseOptionContent}>
                    <View style={styles.exerciseOptionHeader}>
                      <Text
                        style={[
                          styles.exerciseOptionNumber,
                          index === currentExerciseIndex &&
                            styles.exerciseOptionActiveText,
                          isExerciseCompleted(index) &&
                            styles.exerciseOptionCompletedText,
                        ]}
                      >
                        {index + 1}
                      </Text>
                      <Text
                        style={[
                          styles.exerciseOptionName,
                          index === currentExerciseIndex &&
                            styles.exerciseOptionActiveText,
                          isExerciseCompleted(index) &&
                            styles.exerciseOptionCompletedText,
                        ]}
                      >
                        {exercise.name}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.exerciseOptionDetails,
                        index === currentExerciseIndex &&
                          styles.exerciseOptionActiveText,
                        isExerciseCompleted(index) &&
                          styles.exerciseOptionCompletedText,
                      ]}
                    >
                      {exercise.sets} séries • {exercise.reps}
                    </Text>
                  </View>
                  {isExerciseCompleted(index) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#34C759"
                    />
                  )}
                  {index === currentExerciseIndex &&
                    !isExerciseCompleted(index) && (
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
        {areAllPlannedSetsCompleted() && areAllSetsCompleted() ? (
          /* Minimized version when all planned sets are completed */
          <View style={styles.completedSetsContainer}>
            <View style={styles.completedSetsHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.completedSetsTitle}>
                Séries {getPlannedSetsCount()} de {getPlannedSetsCount()}
                {getExtraSetsCount() > 0 && (
                  <Text style={styles.extraSetsText}>
                    {" "}
                    + {getExtraSetsCount()} extra
                  </Text>
                )}
              </Text>
            </View>
            <Text style={styles.completedSetsSubtitle}>Séries concluídas</Text>

            {/* Add Extra Set Button */}
            <TouchableOpacity
              style={styles.addExtraSetButton}
              onPress={handleAddExtraSet}
            >
              <Ionicons name="add" size={16} color="#007AFF" />
              <Text style={styles.addExtraSetButtonText}>
                Adicionar Série Extra
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Normal version when sets are in progress */
          <>
            <Text style={styles.currentSetTitle}>
              Série {currentSet + 1} de {getPlannedSetsCount()}
              {currentSet >= getPlannedSetsCount() && (
                <Text style={styles.extraSetIndicator}> (Extra)</Text>
              )}
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
                  placeholder={getPlaceholderWeight()}
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
                (!weight || !reps) && styles.completeButtonDisabled,
              ]}
              onPress={handleCompleteSet}
              disabled={!weight || !reps}
            >
              <Text style={styles.completeButtonText}>Concluir Série</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Rest Timer */}
      {isResting && (
        <View style={styles.restTimerCard}>
          <Text style={styles.restTimerTitle}>Tempo de Descanso</Text>
          <Text style={styles.restTimerTime}>{formatTime(restTimer)}</Text>

          {/* Rest Interval Options */}
          {showRestOptions && getRestIntervals().length > 1 && (
            <View style={styles.restIntervalOptions}>
              <Text style={styles.restOptionsTitle}>
                Intervalos Disponíveis:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.restIntervalScroll}
              >
                {getRestIntervals().map((interval, index) => (
                  <TouchableOpacity
                    key={interval.id}
                    style={[
                      styles.restIntervalButton,
                      index === currentRestIntervalIndex &&
                        styles.restIntervalButtonActive,
                    ]}
                    onPress={() => handleSelectRestInterval(interval)}
                  >
                    <Text
                      style={[
                        styles.restIntervalButtonText,
                        index === currentRestIntervalIndex &&
                          styles.restIntervalButtonTextActive,
                      ]}
                    >
                      {interval.intervalTime}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.restIntervalButton}
                  onPress={handleCustomRestTime}
                >
                  <Ionicons name="create" size={16} color="#007AFF" />
                  <Text style={styles.restIntervalButtonText}>Custom</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          <View style={styles.restTimerActions}>
            <TouchableOpacity
              style={styles.restButton}
              onPress={handleAddRestTime}
            >
              <Ionicons name="add" size={20} color="#007AFF" />
              <Text style={styles.restButtonText}>+30s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.restButton}
              onPress={handleSkipRest}
            >
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
              index === currentSet && styles.setRowCurrent,
              editingSetIndex === index && styles.setRowEditing,
            ]}
          >
            <Text
              style={[
                styles.setNumber,
                index >= getPlannedSetsCount() && styles.extraSetNumber,
              ]}
            >
              Série {index + 1}
              {index >= getPlannedSetsCount() && (
                <Text style={styles.extraSetLabel}> (Extra)</Text>
              )}
            </Text>

            {editingSetIndex === index ? (
              /* Editing mode */
              <View style={styles.editSetContainer}>
                <View style={styles.editInputRow}>
                  <TextInput
                    style={styles.editInput}
                    value={editWeight}
                    onChangeText={setEditWeight}
                    keyboardType="numeric"
                    placeholder="Peso"
                  />
                  <Text style={styles.editSeparator}>×</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editReps}
                    onChangeText={setEditReps}
                    keyboardType="numeric"
                    placeholder="Reps"
                  />
                </View>
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.editSaveButton}
                    onPress={handleSaveEditedSet}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editCancelButton}
                    onPress={handleCancelEdit}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : set.completed ? (
              /* Completed set display */
              <>
                <Text style={styles.setData}>
                  {set.weight}kg × {set.reps} reps
                </Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditSet(index)}
                >
                  <Ionicons name="create" size={16} color="#007AFF" />
                </TouchableOpacity>
              </>
            ) : (
              /* Pending set display */
              <Text style={styles.setPlaceholder}>
                {index === currentSet ? "Em andamento..." : "Aguardando..."}
              </Text>
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
            isExerciseCompleted(currentExerciseIndex) &&
              styles.exerciseCompletedButton,
          ]}
          onPress={handleFinishExercise}
        >
          {isExerciseCompleted(currentExerciseIndex) ? (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.exerciseCompletedButtonText}>
                Exercício Concluído
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              <Text style={styles.finishExerciseButtonText}>
                Finalizar Exercício
              </Text>
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
            currentExerciseIndex === 0 && styles.navButtonDisabled,
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
            isWorkoutFullyCompleted() && styles.finishWorkoutButton,
          ]}
          onPress={handleNextExercise}
        >
          <Text
            style={[
              styles.navButtonText,
              isWorkoutFullyCompleted() && styles.finishWorkoutButtonText,
            ]}
          >
            {isWorkoutFullyCompleted()
              ? "Finalizar Treino"
              : "Próximo Exercício"}
          </Text>
          <Ionicons
            name={isWorkoutFullyCompleted() ? "checkmark" : "chevron-forward"}
            size={20}
            color={isWorkoutFullyCompleted() ? "#FFFFFF" : "#007AFF"}
          />
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      {(savingHistory || progress.step !== "idle") && (
        <View style={styles.progressOverlay}>
          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              {progress.message || "Salvando histórico..."}
            </Text>
            {progress.step === "completed" && (
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  progressInfo: {
    alignItems: "center",
  },
  exerciseCounter: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
  },
  exerciseCard: {
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
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseName: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  videoButton: {
    marginLeft: 12,
  },
  exerciseTarget: {
    fontSize: 16,
    color: "#8E8E93",
  },
  maxWeightText: {
    fontSize: 14,
    color: "#FF9500",
    fontWeight: "600",
    marginTop: 8,
  },
  currentSetCard: {
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
  currentSetTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 16,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "#F8F9FA",
  },
  completeButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  completeButtonDisabled: {
    backgroundColor: "#E5E5EA",
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  completedSetsContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  completedSetsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  completedSetsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34C759",
  },
  completedSetsSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  extraSetsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF9500",
  },
  addExtraSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    gap: 6,
  },
  addExtraSetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  extraSetIndicator: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF9500",
  },
  restTimerCard: {
    margin: 16,
    marginTop: 0,
    padding: 24,
    backgroundColor: "#FFF3CD",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFE69C",
    alignItems: "center",
  },
  restTimerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#996D1B",
    marginBottom: 8,
  },
  restTimerTime: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#996D1B",
    marginBottom: 16,
  },
  restTimerActions: {
    flexDirection: "row",
    gap: 16,
  },
  restButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  restButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  setsHistoryCard: {
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
  setsHistoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginBottom: 8,
  },
  setRowCompleted: {
    backgroundColor: "#E8F5E8",
  },
  setRowCurrent: {
    backgroundColor: "#E3F2FD",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  setNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  setData: {
    fontSize: 16,
    color: "#1C1C1E",
  },
  setPlaceholder: {
    fontSize: 16,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  setRowEditing: {
    backgroundColor: "#F0F8FF",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  editSetContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 12,
  },
  editInputRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  editInput: {
    height: 32,
    width: 50,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "#FFFFFF",
  },
  editSeparator: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginHorizontal: 8,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 12,
  },
  editSaveButton: {
    backgroundColor: "#34C759",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  editCancelButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  extraSetNumber: {
    color: "#FF9500",
  },
  extraSetLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF9500",
  },
  notesCard: {
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
  notesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  navigationCard: {
    margin: 16,
    marginTop: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
    gap: 8,
  },
  navButtonDisabled: {
    borderColor: "#E5E5EA",
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  restIntervalOptions: {
    width: "100%",
    marginBottom: 16,
  },
  restOptionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#996D1B",
    marginBottom: 8,
  },
  restIntervalScroll: {
    maxHeight: 50,
  },
  restIntervalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    gap: 4,
  },
  restIntervalButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  restIntervalButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  restIntervalButtonTextActive: {
    color: "#FFFFFF",
  },
  timeSelectorOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  timeSelectorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: "70%",
    minWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  timeSelectorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 16,
    textAlign: "center",
  },
  timeOptionsScroll: {
    maxHeight: 300,
  },
  timeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    gap: 8,
  },
  timeOptionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    flex: 1,
  },
  timeOptionTime: {
    fontSize: 14,
    color: "#8E8E93",
    fontFamily: "monospace",
  },
  timeSelectorCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#8E8E93",
    borderRadius: 8,
    alignItems: "center",
  },
  timeSelectorCloseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  exerciseSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  completedCounter: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "500",
  },
  exerciseOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    backgroundColor: "#FFFFFF",
  },
  exerciseOptionActive: {
    backgroundColor: "#F0F8FF",
    borderBottomColor: "#007AFF",
  },
  exerciseOptionCompleted: {
    backgroundColor: "#F0F9F5",
    borderBottomColor: "#34C759",
  },
  exerciseOptionContent: {
    flex: 1,
    marginRight: 12,
  },
  exerciseOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  exerciseOptionNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8E8E93",
    minWidth: 24,
  },
  exerciseOptionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    flex: 1,
  },
  exerciseOptionDetails: {
    fontSize: 14,
    color: "#8E8E93",
    marginLeft: 32,
  },
  exerciseOptionActiveText: {
    color: "#007AFF",
  },
  exerciseOptionCompletedText: {
    color: "#34C759",
  },
  currentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
  },
  finishWorkoutButton: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  finishWorkoutButtonText: {
    color: "#FFFFFF",
  },
  headerSpacer: {
    width: 24, // Same width as the back button for balance
  },
  finishExerciseCard: {
    margin: 16,
    marginTop: 0,
  },
  finishExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseCompletedButton: {
    backgroundColor: "#34C759",
  },
  finishExerciseButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  exerciseCompletedButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  undoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#FF9500",
  },
  undoButtonText: {
    color: "#FF9500",
    fontSize: 14,
    fontWeight: "600",
  },
  successFeedbackCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#F0F9F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#34C759",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successFeedbackText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34C759",
  },
  exerciseHistoryCard: {
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
  exerciseHistoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 16,
  },
  historySession: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  historyWorkout: {
    fontSize: 12,
    color: "#8E8E93",
  },
  historySets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  historySet: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  historySetNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    minWidth: 12,
  },
  historySetData: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  noHistoryContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  noHistoryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 8,
    textAlign: "center",
  },
  noHistorySubtext: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
    textAlign: "center",
  },
  savingStatusCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  savingStatusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  successStatusCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#F0F9F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#34C759",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  successStatusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34C759",
  },
  errorStatusCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorStatusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3B30",
  },
  progressOverlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    flex: 1,
  },
});
