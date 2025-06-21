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

    // Para demonstração, vamos usar dados mock com múltiplos treinos históricos
    const isLoading = ref(false)
    const selectedWorkoutId = ref(props.workoutId)
    
    const workoutHistory = ref([
      // Treino atual (ativo)
      {
        id: props.workoutId,
        name: 'Treino Hipertrofia Avançado',
        period: 'Março 2024 - Atual',
        weekStart: new Date(2024, 2, 1),
        weekEnd: new Date(),
        isActive: true,
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
            },
            {
              id: '3', 
              exercise: { id: '3', name: 'Fly Peck Deck' },
              order: 3,
              repSchemes: [{ sets: 3, minReps: 12, maxReps: 15 }]
            },
            {
              id: '4', 
              exercise: { id: '4', name: 'Tríceps Testa' },
              order: 4,
              repSchemes: [{ sets: 3, minReps: 10, maxReps: 12 }]
            },
            {
              id: '5', 
              exercise: { id: '5', name: 'Tríceps Pulley' },
              order: 5,
              repSchemes: [{ sets: 3, minReps: 12, maxReps: 15 }]
            }
          ]
        },
        {
          id: '2',
          name: 'Costas/Bíceps',
          order: 2,
          trainingDayExercises: [
            {
              id: '6',
              exercise: { id: '6', name: 'Puxada Frontal' },
              order: 1,
              repSchemes: [{ sets: 4, minReps: 8, maxReps: 12 }]
            },
            {
              id: '7',
              exercise: { id: '7', name: 'Remada Curvada' },
              order: 2,
              repSchemes: [{ sets: 4, minReps: 8, maxReps: 10 }]
            },
            {
              id: '8',
              exercise: { id: '8', name: 'Pulley Baixo' },
              order: 3,
              repSchemes: [{ sets: 3, minReps: 10, maxReps: 12 }]
            },
            {
              id: '9',
              exercise: { id: '9', name: 'Rosca Direta' },
              order: 4,
              repSchemes: [{ sets: 3, minReps: 10, maxReps: 12 }]
            },
            {
              id: '10',
              exercise: { id: '10', name: 'Rosca Martelo' },
              order: 5,
              repSchemes: [{ sets: 3, minReps: 12, maxReps: 15 }]
            }
          ]
        },
        {
          id: '3',
          name: 'Pernas/Glúteos',
          order: 3,
          trainingDayExercises: [
            {
              id: '11',
              exercise: { id: '11', name: 'Agachamento Livre' },
              order: 1,
              repSchemes: [{ sets: 4, minReps: 8, maxReps: 12 }]
            },
            {
              id: '12',
              exercise: { id: '12', name: 'Leg Press 45°' },
              order: 2,
              repSchemes: [{ sets: 4, minReps: 12, maxReps: 15 }]
            },
            {
              id: '13',
              exercise: { id: '13', name: 'Cadeira Extensora' },
              order: 3,
              repSchemes: [{ sets: 3, minReps: 12, maxReps: 15 }]
            },
            {
              id: '14',
              exercise: { id: '14', name: 'Mesa Flexora' },
              order: 4,
              repSchemes: [{ sets: 3, minReps: 10, maxReps: 12 }]
            },
            {
              id: '15',
              exercise: { id: '15', name: 'Panturrilha em Pé' },
              order: 5,
              repSchemes: [{ sets: 4, minReps: 15, maxReps: 20 }]
            }
          ]
        },
        {
          id: '4',
          name: 'Ombros/Abdômen',
          order: 4,
          trainingDayExercises: [
            {
              id: '16',
              exercise: { id: '16', name: 'Desenvolvimento com Halteres' },
              order: 1,
              repSchemes: [{ sets: 4, minReps: 8, maxReps: 12 }]
            },
            {
              id: '17',
              exercise: { id: '17', name: 'Elevação Lateral' },
              order: 2,
              repSchemes: [{ sets: 3, minReps: 12, maxReps: 15 }]
            },
            {
              id: '18',
              exercise: { id: '18', name: 'Elevação Posterior' },
              order: 3,
              repSchemes: [{ sets: 3, minReps: 12, maxReps: 15 }]
            },
            {
              id: '19',
              exercise: { id: '19', name: 'Encolhimento' },
              order: 4,
              repSchemes: [{ sets: 3, minReps: 10, maxReps: 12 }]
            },
            {
              id: '20',
              exercise: { id: '20', name: 'Prancha' },
              order: 5,
              repSchemes: [{ sets: 3, minReps: 30, maxReps: 60 }]
            }
          ]
        }
      ]
    },
    // Treino anterior 1
    {
      id: 'workout-feb-2024',
      name: 'Treino Força Intermediário',
      period: 'Fevereiro 2024',
      weekStart: new Date(2024, 1, 1),
      weekEnd: new Date(2024, 1, 29),
      isActive: false,
      trainingDays: [
        {
          id: 'feb-1',
          name: 'Push (Peito/Ombro/Tríceps)',
          order: 1,
          trainingDayExercises: [
            {
              id: 'feb-1-1',
              exercise: { id: '1', name: 'Supino Reto' },
              order: 1,
              repSchemes: [{ sets: 5, minReps: 5, maxReps: 8 }]
            },
            {
              id: 'feb-1-2',
              exercise: { id: '16', name: 'Desenvolvimento com Halteres' },
              order: 2,
              repSchemes: [{ sets: 4, minReps: 6, maxReps: 10 }]
            },
            {
              id: 'feb-1-3',
              exercise: { id: '4', name: 'Tríceps Testa' },
              order: 3,
              repSchemes: [{ sets: 3, minReps: 8, maxReps: 12 }]
            }
          ]
        },
        {
          id: 'feb-2',
          name: 'Pull (Costas/Bíceps)',
          order: 2,
          trainingDayExercises: [
            {
              id: 'feb-2-1',
              exercise: { id: '6', name: 'Puxada Frontal' },
              order: 1,
              repSchemes: [{ sets: 4, minReps: 6, maxReps: 10 }]
            },
            {
              id: 'feb-2-2',
              exercise: { id: '7', name: 'Remada Curvada' },
              order: 2,
              repSchemes: [{ sets: 4, minReps: 6, maxReps: 8 }]
            },
            {
              id: 'feb-2-3',
              exercise: { id: '9', name: 'Rosca Direta' },
              order: 3,
              repSchemes: [{ sets: 3, minReps: 8, maxReps: 10 }]
            },
            {
              id: 'feb-2-4',
              exercise: { id: '8', name: 'Pulley Baixo' },
              order: 4,
              repSchemes: [{ sets: 3, minReps: 8, maxReps: 12 }]
            }
          ]
        },
        {
          id: 'feb-3',
          name: 'Legs (Pernas)',
          order: 3,
          trainingDayExercises: [
            {
              id: 'feb-3-1',
              exercise: { id: '11', name: 'Agachamento Livre' },
              order: 1,
              repSchemes: [{ sets: 5, minReps: 5, maxReps: 8 }]
            },
            {
              id: 'feb-3-2',
              exercise: { id: '14', name: 'Mesa Flexora' },
              order: 2,
              repSchemes: [{ sets: 3, minReps: 8, maxReps: 12 }]
            }
          ]
        }
      ]
    },
    // Treino anterior 2
    {
      id: 'workout-jan-2024',
      name: 'Treino Adaptação',
      period: 'Janeiro 2024',
      weekStart: new Date(2024, 0, 1),
      weekEnd: new Date(2024, 0, 31),
      isActive: false,
      trainingDays: [
        {
          id: 'jan-1',
          name: 'Corpo Inteiro A',
          order: 1,
          trainingDayExercises: [
            {
              id: 'jan-1-1',
              exercise: { id: '1', name: 'Supino Reto' },
              order: 1,
              repSchemes: [{ sets: 3, minReps: 8, maxReps: 12 }]
            },
            {
              id: 'jan-1-2',
              exercise: { id: '6', name: 'Puxada Frontal' },
              order: 2,
              repSchemes: [{ sets: 3, minReps: 8, maxReps: 12 }]
            },
            {
              id: 'jan-1-3',
              exercise: { id: '11', name: 'Agachamento Livre' },
              order: 3,
              repSchemes: [{ sets: 3, minReps: 10, maxReps: 15 }]
            },
            {
              id: 'jan-1-4',
              exercise: { id: '9', name: 'Rosca Direta' },
              order: 4,
              repSchemes: [{ sets: 2, minReps: 10, maxReps: 12 }]
            }
          ]
        },
        {
          id: 'jan-2',
          name: 'Corpo Inteiro B',
          order: 2,
          trainingDayExercises: [
            {
              id: 'jan-2-1',
              exercise: { id: '1', name: 'Supino Reto' },
              order: 1,
              repSchemes: [{ sets: 3, minReps: 8, maxReps: 12 }]
            },
            {
              id: 'jan-2-2',
              exercise: { id: '7', name: 'Remada Curvada' },
              order: 2,
              repSchemes: [{ sets: 3, minReps: 8, maxReps: 12 }]
            },
            {
              id: 'jan-2-3',
              exercise: { id: '12', name: 'Leg Press 45°' },
              order: 3,
              repSchemes: [{ sets: 3, minReps: 12, maxReps: 15 }]
            },
            {
              id: 'jan-2-4',
              exercise: { id: '16', name: 'Desenvolvimento com Halteres' },
              order: 4,
              repSchemes: [{ sets: 2, minReps: 8, maxReps: 10 }]
            }
          ]
        }
      ]
    },
    // Treino anterior 3
    {
      id: 'workout-dec-2023',
      name: 'Treino Iniciante',
      period: 'Dezembro 2023',
      weekStart: new Date(2023, 11, 1),
      weekEnd: new Date(2023, 11, 31),
      isActive: false,
      trainingDays: [
        {
          id: 'dec-1',
          name: 'Treino Básico',
          order: 1,
          trainingDayExercises: [
            {
              id: 'dec-1-1',
              exercise: { id: '1', name: 'Supino Reto' },
              order: 1,
              repSchemes: [{ sets: 2, minReps: 10, maxReps: 15 }]
            },
            {
              id: 'dec-1-2',
              exercise: { id: '6', name: 'Puxada Frontal' },
              order: 2,
              repSchemes: [{ sets: 2, minReps: 10, maxReps: 15 }]
            },
            {
              id: 'dec-1-3',
              exercise: { id: '12', name: 'Leg Press 45°' },
              order: 3,
              repSchemes: [{ sets: 2, minReps: 12, maxReps: 15 }]
            }
          ]
        }
      ]
    }
  ])

  const currentWorkout = computed(() => {
    return workoutHistory.value.find(w => w.id === selectedWorkoutId.value)
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
        
        // Dados mock com histórico mais rico baseado no exercício selecionado e período
        const generateExerciseHistoryData = (exerciseName: string, workoutPeriod: any) => {
          // Determinar peso base e incremento baseado no tipo de exercício
          let baseWeight = 50
          let weightIncrement = 2.5
          let repPattern = { base: 10, variation: 2 }
          
          if (exerciseName.includes('Supino')) {
            baseWeight = 70
            weightIncrement = 2.5
            repPattern = { base: 10, variation: 2 }
          } else if (exerciseName.includes('Agachamento') || exerciseName.includes('Leg Press')) {
            baseWeight = 100
            weightIncrement = 5
            repPattern = { base: 12, variation: 3 }
          } else if (exerciseName.includes('Desenvolvimento')) {
            baseWeight = 35
            weightIncrement = 2.5
            repPattern = { base: 10, variation: 2 }
          } else if (exerciseName.includes('Elevação') || exerciseName.includes('Rosca')) {
            baseWeight = 15
            weightIncrement = 1.25
            repPattern = { base: 12, variation: 2 }
          } else if (exerciseName.includes('Puxada') || exerciseName.includes('Remada')) {
            baseWeight = 60
            weightIncrement = 2.5
            repPattern = { base: 10, variation: 2 }
          } else if (exerciseName.includes('Tríceps')) {
            baseWeight = 40
            weightIncrement = 2.5
            repPattern = { base: 11, variation: 2 }
          } else if (exerciseName.includes('Panturrilha')) {
            baseWeight = 80
            weightIncrement = 5
            repPattern = { base: 17, variation: 3 }
          }

          // Ajustar pesos baseado no período do treino (progressão histórica)
          const periodMultiplier = getPeriodMultiplier(workoutPeriod.id)
          baseWeight = Math.round(baseWeight * periodMultiplier)
          
          // Gerar dados baseado no período do treino
          const currentWorkoutData = []
          const dates = generateDatesForPeriod(workoutPeriod)

          function getPeriodMultiplier(workoutId: string): number {
            switch (workoutId) {
              case 'workout-dec-2023': return 0.6  // Iniciante - 60% do peso
              case 'workout-jan-2024': return 0.75 // Adaptação - 75% do peso
              case 'workout-feb-2024': return 0.9  // Intermediário - 90% do peso
              default: return 1.0                  // Atual - 100% do peso
            }
          }

          function generateDatesForPeriod(period: any): string[] {
            const dates = []
            const startDate = new Date(period.weekStart)
            const endDate = new Date(period.weekEnd)
            
            // Se for o treino atual, pegar as últimas 8 sessões
            if (period.isActive) {
              for (let i = 7; i >= 0; i--) {
                const date = new Date()
                date.setDate(date.getDate() - (i * 3))
                dates.push(date.toISOString().split('T')[0])
              }
            } else {
              // Para treinos passados, distribuir ao longo do período
              const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
              const sessions = Math.min(8, Math.floor(totalDays / 3)) // Máximo 8 sessões
              
              for (let i = 0; i < sessions; i++) {
                const date = new Date(startDate)
                date.setDate(startDate.getDate() + (i * Math.floor(totalDays / sessions)))
                dates.push(date.toISOString().split('T')[0])
              }
            }
            
            return dates
          }
          
          dates.forEach((date, index) => {
            const progressiveWeight = baseWeight + (index * weightIncrement)
            const repsVariation = Math.floor(Math.random() * repPattern.variation)
            const setsCount = exerciseName.includes('Prancha') ? 3 : (exerciseName.includes('Agachamento') || exerciseName.includes('Supino') ? 4 : 3)
            
            // Gerar repetições baseadas no padrão do exercício
            const reps = []
            for (let i = 0; i < setsCount; i++) {
              reps.push(repPattern.base - repsVariation - i)
            }
            
            currentWorkoutData.push({
              date,
              weight: progressiveWeight,
              repsDisplay: exerciseName.includes('Prancha') ? 
                `${45 + (index * 5)}s, ${40 + (index * 5)}s, ${35 + (index * 5)}s` :
                reps.join(', '),
              totalSets: setsCount,
              sets: reps.map((rep, i) => ({
                targetRepsMin: Math.max(repPattern.base - repPattern.variation, 1),
                targetRepsMax: repPattern.base + repPattern.variation,
                completedReps: rep,
                weight: progressiveWeight - (i * (weightIncrement / 2))
              }))
            })
          })

          // Gerar dados de comparação com outros períodos para o gráfico
          const previousWorkouts = []
          
          // Encontrar exercícios similares em outros períodos
          const otherPeriodsWithExercise = workoutHistory.value.filter(period => {
            if (period.id === workoutPeriod.id) return false
            
            // Verificar se este exercício existe neste período
            return period.trainingDays.some(day => 
              day.trainingDayExercises?.some(tde => 
                tde.exercise.name === exerciseName
              )
            )
          })
          
          otherPeriodsWithExercise.forEach(period => {
            const otherPeriodMultiplier = getPeriodMultiplier(period.id)
            const otherBaseWeight = Math.round(baseWeight / periodMultiplier * otherPeriodMultiplier)
            const otherDates = generateDatesForPeriod(period)
            
            // Encontrar o training day que contém este exercício
            const trainingDayWithExercise = period.trainingDays.find(day => 
              day.trainingDayExercises?.some(tde => tde.exercise.name === exerciseName)
            )
            
            if (trainingDayWithExercise) {
              const otherData = otherDates.map((date, index) => {
                const progressiveWeight = otherBaseWeight + (index * weightIncrement * 0.8)
                const repsVariation = Math.floor(Math.random() * repPattern.variation)
                const setsCount = exerciseName.includes('Prancha') ? 3 : (exerciseName.includes('Agachamento') || exerciseName.includes('Supino') ? 4 : 3)
                
                // Gerar repetições baseadas no padrão do exercício
                const reps = []
                for (let i = 0; i < setsCount; i++) {
                  reps.push(Math.max(1, repPattern.base - repsVariation - i))
                }
                
                return {
                  date,
                  weight: progressiveWeight,
                  repsDisplay: exerciseName.includes('Prancha') ? 
                    `${30 + (index * 2)}s, ${25 + (index * 2)}s, ${20 + (index * 2)}s` :
                    reps.join(', '),
                  totalSets: setsCount,
                  sets: reps.map((rep, i) => ({
                    targetRepsMin: Math.max(repPattern.base - repPattern.variation, 1),
                    targetRepsMax: repPattern.base + repPattern.variation,
                    completedReps: rep,
                    weight: progressiveWeight - (i * (weightIncrement / 2))
                  }))
                }
              })
              
              // Gerar notas específicas para este período
              const periodNotes = generateNotesForPeriod(exerciseName, period.id, otherData)
              
              previousWorkouts.push({
                workoutId: period.id,
                workoutName: period.name,
                dateRange: {
                  start: period.weekStart.toISOString().split('T')[0],
                  end: period.weekEnd.toISOString().split('T')[0]
                },
                trainingDays: [{
                  dayId: trainingDayWithExercise.id,
                  dayName: trainingDayWithExercise.name,
                  data: otherData,
                  notes: periodNotes
                }]
              })
            }
          })

          function generateNotesForPeriod(exerciseName: string, periodId: string, workoutData: any[]) {
            const notes = []
            
            switch (periodId) {
              case 'workout-dec-2023':
                notes.push(
                  { date: workoutData[0]?.date, note: 'Primeiro contato com o exercício' },
                  { date: workoutData[1]?.date, note: 'Aprendendo a técnica básica' },
                  { date: workoutData[2]?.date, note: 'Foco na execução correta' }
                )
                break
              case 'workout-jan-2024':
                notes.push(
                  { date: workoutData[0]?.date, note: 'Adaptação muscular em progresso' },
                  { date: workoutData[2]?.date, note: 'Coordenação melhorando' },
                  { date: workoutData[4]?.date, note: 'Primeiros aumentos de carga' }
                )
                break
              case 'workout-feb-2024':
                notes.push(
                  { date: workoutData[0]?.date, note: 'Foco em força máxima' },
                  { date: workoutData[3]?.date, note: 'Técnica mais refinada' },
                  { date: workoutData[6]?.date, note: 'Ganhos consistentes de força' }
                )
                break
              default:
                notes.push(
                  { date: workoutData[0]?.date, note: 'Performance estável' },
                  { date: workoutData[4]?.date, note: 'Evolução constante' }
                )
            }
            
            return notes.filter(note => note.date)
          }

          // Gerar notas contextuais baseadas no exercício
          const generateNotes = (exerciseName: string, workoutData: any[]) => {
            const notes = []
            
            if (exerciseName.includes('Supino')) {
              notes.push(
                { date: workoutData[0]?.date, note: 'Voltando a treinar peito com foco na técnica' },
                { date: workoutData[2]?.date, note: 'Consegui manter a forma em todas as séries' },
                { date: workoutData[4]?.date, note: 'Aumentei 5kg! Força melhorando' },
                { date: workoutData[6]?.date, note: 'Descida controlada, subida explosiva' },
                { date: workoutData[7]?.date, note: 'Nova marca pessoal alcançada!' }
              )
            } else if (exerciseName.includes('Agachamento')) {
              notes.push(
                { date: workoutData[0]?.date, note: 'Profundidade melhorou muito' },
                { date: workoutData[2]?.date, note: 'Joelhos mais estáveis hoje' },
                { date: workoutData[4]?.date, note: 'Consegui aumentar a carga mantendo a forma' },
                { date: workoutData[6]?.date, note: 'Core mais forte, menos compensações' },
                { date: workoutData[7]?.date, note: 'Melhor agachamento da vida!' }
              )
            } else if (exerciseName.includes('Desenvolvimento')) {
              notes.push(
                { date: workoutData[0]?.date, note: 'Ombros aqueceram bem hoje' },
                { date: workoutData[2]?.date, note: 'Amplitude completa em todos os sets' },
                { date: workoutData[4]?.date, note: 'Deltoides respondendo bem ao treino' },
                { date: workoutData[6]?.date, note: 'Controle na fase excêntrica' },
                { date: workoutData[7]?.date, note: 'Força nos ombros evoluindo!' }
              )
            } else if (exerciseName.includes('Puxada') || exerciseName.includes('Remada')) {
              notes.push(
                { date: workoutData[0]?.date, note: 'Costas ativando melhor' },
                { date: workoutData[2]?.date, note: 'Retração escapular mais consciente' },
                { date: workoutData[4]?.date, note: 'Dorsais trabalhando bem' },
                { date: workoutData[6]?.date, note: 'Menos compensação com bíceps' },
                { date: workoutData[7]?.date, note: 'Costas mais forte e definida!' }
              )
            } else if (exerciseName.includes('Rosca')) {
              notes.push(
                { date: workoutData[0]?.date, note: 'Bíceps respondendo bem' },
                { date: workoutData[2]?.date, note: 'Movimento mais controlado' },
                { date: workoutData[4]?.date, note: 'Pico da contração melhor' },
                { date: workoutData[6]?.date, note: 'Sem balanço, só bíceps' },
                { date: workoutData[7]?.date, note: 'Braços crescendo visivelmente!' }
              )
            } else if (exerciseName.includes('Prancha')) {
              notes.push(
                { date: workoutData[0]?.date, note: 'Core mais resistente' },
                { date: workoutData[2]?.date, note: 'Consegui manter postura neutra' },
                { date: workoutData[4]?.date, note: 'Tempo aumentando gradualmente' },
                { date: workoutData[6]?.date, note: 'Abdômen mais definido' },
                { date: workoutData[7]?.date, note: 'Core de ferro!' }
              )
            } else {
              notes.push(
                { date: workoutData[0]?.date, note: 'Retomando após descanso' },
                { date: workoutData[2]?.date, note: 'Forma técnica melhorou' },
                { date: workoutData[4]?.date, note: 'Aumentei a carga!' },
                { date: workoutData[6]?.date, note: 'Foco na execução controlada' },
                { date: workoutData[7]?.date, note: 'Nova PR pessoal!' }
              )
            }
            
            return notes.filter(note => note.date)
          }

          return {
            currentWorkoutData,
            notes: generateNotes(exerciseName, currentWorkoutData),
            previousWorkouts
          }
        }

        exerciseHistoryData.value = generateExerciseHistoryData(selectedExercise.value.name, currentWorkout.value)
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