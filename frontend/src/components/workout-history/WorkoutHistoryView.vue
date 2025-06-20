<template>
  <div class="workout-history-view p-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">Histórico de Treinos</h1>
          <p class="text-gray-600" v-if="currentWorkout">
            {{ currentWorkout.name }} - {{ formatDate(currentWorkout.weekStart) }} - {{
              formatDate(currentWorkout.weekEnd)
            }}
          </p>
        </div>
        <a-button @click="$emit('close')">
          <arrow-left-outlined /> Voltar
        </a-button>
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

    // Para demonstração, vamos usar dados mock temporários
    const isLoading = ref(false)
    const currentWorkout = ref({
      id: props.workoutId,
      name: 'Treino de Força',
      weekStart: new Date(),
      weekEnd: new Date(),
      trainingDays: [
        {
          id: '1',
          name: 'Peito/Tríceps',
          order: 1,
          trainingDayExercises: [
            {
              id: '1',
              exercise: { id: '1', name: 'Supino Reto' },
              order: 1,
              repSchemes: [{ sets: 4, minReps: 8, maxReps: 12 }]
            },
            {
              id: '2', 
              exercise: { id: '2', name: 'Supino Inclinado' },
              order: 2,
              repSchemes: [{ sets: 3, minReps: 10, maxReps: 15 }]
            }
          ]
        },
        {
          id: '2',
          name: 'Costas/Bíceps',
          order: 2,
          trainingDayExercises: [
            {
              id: '3',
              exercise: { id: '3', name: 'Puxada Frontal' },
              order: 1,
              repSchemes: [{ sets: 4, minReps: 8, maxReps: 12 }]
            }
          ]
        }
      ]
    })

    const processedTrainingDays = computed(() => {
      if (!currentWorkout.value?.trainingDays) return []

      return currentWorkout.value.trainingDays
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .map((day: any) => ({
          id: day.id,
          name: day.name,
          order: day.order || 0,
          exercises: day.trainingDayExercises
            ?.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
            .map((tde: any) => ({
              id: tde.id,
              exercise: tde.exercise,
              sets: tde.repSchemes?.reduce((acc: any, rs: any) => acc + rs.sets, 0) || 0,
              repsDisplay: formatRepsDisplay(tde.repSchemes || []),
              order: tde.order || 0
            })) || []
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
        
        // Para demonstração, usar dados mock
        exerciseHistoryData.value = {
          currentWorkoutData: [
            { 
              date: '2024-01-15', 
              weight: 80, 
              repsDisplay: '10, 9, 8',
              totalSets: 3,
              sets: [
                { targetRepsMin: 8, targetRepsMax: 10, completedReps: 10, weight: 80 },
                { targetRepsMin: 8, targetRepsMax: 10, completedReps: 9, weight: 77.5 },
                { targetRepsMin: 8, targetRepsMax: 10, completedReps: 8, weight: 75 }
              ]
            },
            { 
              date: '2024-01-17', 
              weight: 82.5, 
              repsDisplay: '9, 8, 8',
              totalSets: 3,
              sets: [
                { targetRepsMin: 8, targetRepsMax: 10, completedReps: 9, weight: 82.5 },
                { targetRepsMin: 8, targetRepsMax: 10, completedReps: 8, weight: 80 },
                { targetRepsMin: 8, targetRepsMax: 10, completedReps: 8, weight: 77.5 }
              ]
            },
            { 
              date: '2024-01-19', 
              weight: 85, 
              repsDisplay: '10, 9, 8, 8',
              totalSets: 4,
              sets: [
                { targetRepsMin: 8, targetRepsMax: 10, completedReps: 10, weight: 85 },
                { targetRepsMin: 8, targetRepsMax: 10, completedReps: 9, weight: 82.5 },
                { targetRepsMin: 8, targetRepsMax: 10, completedReps: 8, weight: 80 },
                { targetRepsMin: 8, targetRepsMax: 10, completedReps: 8, weight: 77.5 }
              ]
            },
          ],
          notes: [
            { date: '2024-01-15', note: 'Primeira vez fazendo este exercício' },
            { date: '2024-01-19', note: 'Consegui aumentar o peso!' }
          ],
          previousWorkouts: []
        }
      }
    }


    return {
      viewMode,
      selectedDayId,
      selectedExerciseId,
      selectedExercise,
      exerciseHistoryData,
      currentWorkout,
      processedTrainingDays,
      allExercises,
      isLoading,
      formatDate,
      handleDaySelected,
      handleExerciseSelected
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