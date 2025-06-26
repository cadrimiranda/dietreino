<template>
  <div class="workout-history-view p-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h1 class="text-2xl font-bold">Histórico de Treinos</h1>
          <p class="text-gray-600" v-if="currentWorkout">
            {{ currentWorkout.name }} - {{ currentWorkout.period }}
          </p>
        </div>
        <a-button @click="$emit('close')">
          <arrow-left-outlined /> Voltar
        </a-button>
      </div>
      
      <!-- Seletor de Período/Treino -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Selecionar Período:
        </label>
        <a-select 
          v-model:value="selectedWorkoutId" 
          class="w-full max-w-md"
          @change="handleWorkoutPeriodChange"
        >
          <a-select-option 
            v-for="workout in workoutHistory" 
            :key="workout.id" 
            :value="workout.id"
          >
            <div class="flex justify-between items-center">
              <span>{{ workout.name }}</span>
              <span class="text-gray-500 text-xs ml-2">{{ workout.period }}</span>
              <a-tag v-if="workout.isActive" color="green" size="small" class="ml-2">
                Atual
              </a-tag>
            </div>
          </a-select-option>
        </a-select>
      </div>
    </div>

    <div v-if="!isLoading">
      <!-- Modo de Visualização -->
      <div class="mb-6">
        <a-radio-group v-model:value="viewMode" button-style="solid">
          <a-radio-button value="training-days">Training Days</a-radio-button>
          <a-radio-button value="all-exercises">Todos os Exercícios</a-radio-button>
        </a-radio-group>
      </div>

      <!-- Visualização por Training Days -->
      <div v-if="viewMode === 'training-days'" class="space-y-6">
        <TrainingDaySelector
          :training-days="processedTrainingDays"
          :selected-day-id="selectedDayId"
          :selected-exercise-id="selectedExerciseId"
          @day-selected="handleDaySelected"
          @exercise-selected="handleExerciseSelected"
        >
          <template #exercise-chart="{ exercise }">
            <ExerciseEvolutionChart
              v-if="selectedExercise && exerciseHistoryData"
              :exercise="selectedExercise"
              :workout-data="exerciseHistoryData.currentWorkoutData"
              :workout-notes="exerciseHistoryData.notes"
              :previous-workouts="exerciseHistoryData.previousWorkouts"
            />
          </template>
        </TrainingDaySelector>
      </div>

      <!-- Visualização de Todos os Exercícios -->
      <div v-if="viewMode === 'all-exercises'" class="space-y-6">
        <AllExercisesSelector
          :exercises="allExercises"
          :selected-exercise-id="selectedExerciseId"
          @exercise-selected="handleExerciseSelected"
        >
          <template #exercise-chart="{ exercise }">
            <ExerciseEvolutionChart
              v-if="selectedExercise && exerciseHistoryData"
              :exercise="selectedExercise"
              :workout-data="exerciseHistoryData.currentWorkoutData"
              :workout-notes="exerciseHistoryData.notes"
              :previous-workouts="exerciseHistoryData.previousWorkouts"
            />
          </template>
        </AllExercisesSelector>
      </div>

      <!-- Estado vazio -->
      <div v-if="!currentWorkout" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <history-outlined style="font-size: 64px;" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum histórico encontrado</h3>
        <p class="text-gray-500">Este cliente ainda não possui histórico de treinos.</p>
      </div>
    </div>

    <div v-else class="flex justify-center py-12">
      <a-spin size="large" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue'
import { ArrowLeftOutlined, HistoryOutlined } from '@ant-design/icons-vue'
import TrainingDaySelector from './TrainingDaySelector.vue'
import AllExercisesSelector from './AllExercisesSelector.vue'
import ExerciseEvolutionChart from './ExerciseEvolutionChart.vue'
import { useWorkoutHistory } from '@/composables/useWorkoutHistory'
import { useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client'

export default defineComponent({
  name: 'WorkoutHistoryView',
  components: {
    ArrowLeftOutlined,
    HistoryOutlined,
    TrainingDaySelector,
    AllExercisesSelector,
    ExerciseEvolutionChart
  },
  props: {
    userId: {
      type: String,
      required: true
    },
    workoutId: {
      type: String,
      required: true
    }
  },
  emits: ['close'],
  setup(props) {
    const viewMode = ref<'training-days' | 'all-exercises'>('training-days')
    const selectedDayId = ref<string | undefined>(undefined)
    const selectedExerciseId = ref<string | undefined>(undefined)
    const selectedExercise = ref<any>(null)
    const exerciseHistoryData = ref<any>(null)

    const selectedWorkoutId = ref(props.workoutId)
    
    // Get real workout histories for this user
    const filters = computed(() => ({ userId: props.userId }))
    const { workoutHistories, loading: isLoading } = useWorkoutHistory(filters)
    
    // Get workout details query
    const GET_WORKOUT_DETAILS = gql`
      query GetWorkoutDetails($workoutId: ID!) {
        workout(id: $workoutId) {
          id
          name
          weekStart
          weekEnd
          isActive
          trainingDays {
            id
            name
            order
            trainingDayExercises {
              id
              order
              exercise {
                id
                name
              }
              repSchemes {
                sets
                minReps
                maxReps
              }
            }
          }
        }
      }
    `

    const { result: workoutDetailsResult } = useQuery(
      GET_WORKOUT_DETAILS,
      () => ({ workoutId: selectedWorkoutId.value }),
      () => ({ enabled: !!selectedWorkoutId.value })
    )
    
    const workoutHistory = computed(() => {
      // Group workout histories by workout to show historical progression
      const historyMap = new Map()
      
      workoutHistories.value.forEach(history => {
        if (!historyMap.has(history.workoutId)) {
          historyMap.set(history.workoutId, {
            id: history.workoutId,
            name: history.workoutName,
            period: `${new Date(history.executedAt).toLocaleDateString('pt-BR')}`,
            isActive: false, // Will be updated from workout details
            trainingDays: []
          })
        }
      })

      return Array.from(historyMap.values())
    })
    
    const currentWorkout = computed(() => {
      return workoutDetailsResult.value?.workout || null
    })

    const processedTrainingDays = computed(() => {
      if (!currentWorkout.value?.trainingDays) return []

      return [...currentWorkout.value.trainingDays]
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((day: any) => ({
          id: day.id,
          name: day.name,
          order: day.order || 0,
          exercises: day.trainingDayExercises
            ? [...day.trainingDayExercises]
              .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
              .map((tde: any) => ({
                id: tde.id,
                exercise: tde.exercise,
                sets: tde.repSchemes?.reduce((acc: any, rs: any) => acc + rs.sets, 0) || 0,
                repsDisplay: formatRepsDisplay(tde.repSchemes || []),
                order: tde.order || 0
              })) : []
        }))
    })

    const allExercises = computed(() => {
      if (!currentWorkout.value?.trainingDays) return []

      const exerciseMap = new Map()

      currentWorkout.value.trainingDays.forEach((day: any) => {
        day.trainingDayExercises?.forEach((tde: any) => {
          const exerciseId = tde.exercise.id
          if (!exerciseMap.has(exerciseId)) {
            exerciseMap.set(exerciseId, {
              id: exerciseId,
              name: tde.exercise.name,
              trainingDays: [],
              totalSets: 0,
              recentData: []
            })
          }

          const exercise = exerciseMap.get(exerciseId)
          exercise.trainingDays.push(day.name)
          exercise.totalSets += tde.repSchemes?.reduce((acc: any, rs: any) => acc + rs.sets, 0) || 0
        })
      })

      return Array.from(exerciseMap.values()).map(exercise => ({
        ...exercise,
        trainingDays: [...new Set(exercise.trainingDays)]
      }))
    })

    const formatRepsDisplay = (repSchemes: any[]) => {
      if (!repSchemes.length) return '-'
      
      if (repSchemes.length === 1) {
        const scheme = repSchemes[0]
        return `${scheme.minReps}-${scheme.maxReps}`
      }
      
      return repSchemes
        .map(scheme => `${scheme.sets}x ${scheme.minReps}-${scheme.maxReps}`)
        .join(', ')
    }

    const formatDate = (dateValue: any) => {
      if (!dateValue) return ''
      const date = new Date(dateValue)
      return date.toLocaleDateString('pt-BR')
    }

    const handleDaySelected = (day: any) => {
      selectedDayId.value = day.id
      selectedExerciseId.value = undefined
      selectedExercise.value = null
      exerciseHistoryData.value = null
    }

    const handleWorkoutPeriodChange = (workoutId: string) => {
      // Reset seleções quando mudar de período
      selectedDayId.value = undefined
      selectedExerciseId.value = undefined
      selectedExercise.value = null
      exerciseHistoryData.value = null
    }

    const handleExerciseSelected = async (exercise: any) => {
      if (exercise === null) {
        // Desmarcando exercício
        selectedExerciseId.value = undefined
        selectedExercise.value = null
        exerciseHistoryData.value = null
      } else {
        // Selecionando exercício
        selectedExerciseId.value = exercise.id
        selectedExercise.value = exercise.exercise || exercise
        
        // Get real exercise history data from workout histories
        const generateExerciseHistoryData = (exerciseName: string, exerciseId: string) => {
          // Filter workout histories for this specific exercise
          const exerciseHistories = workoutHistories.value.filter(history =>
            history.workoutHistoryExercises.some(ex => ex.exerciseId === exerciseId)
          )

          const currentWorkoutData = exerciseHistories.map(history => {
            const exerciseData = history.workoutHistoryExercises.find(ex => ex.exerciseId === exerciseId)
            if (!exerciseData) return null

            const sets = exerciseData.workoutHistoryExerciseSets.map(set => ({
              targetRepsMin: set.plannedRepsMin || 0,
              targetRepsMax: set.plannedRepsMax || 0,
              completedReps: set.reps,
              weight: set.weight || 0
            }))

            return {
              date: history.executedAt,
              weight: Math.max(...sets.map(s => s.weight || 0)),
              repsDisplay: sets.map(s => s.completedReps).join(', '),
              totalSets: sets.length,
              sets
            }
          }).filter(Boolean)

          return {
            currentWorkoutData,
            notes: '',
            previousWorkouts: []
          }
        }

        exerciseHistoryData.value = generateExerciseHistoryData(
          selectedExercise.value.name,
          selectedExercise.value.id
        )
      }
    }


    return {
      viewMode,
      selectedDayId,
      selectedExerciseId,
      selectedExercise,
      exerciseHistoryData,
      selectedWorkoutId,
      workoutHistory,
      currentWorkout,
      processedTrainingDays,
      allExercises,
      isLoading,
      formatDate,
      handleDaySelected,
      handleExerciseSelected,
      handleWorkoutPeriodChange
    }
  }
})
</script>

<style scoped>
.workout-history-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>