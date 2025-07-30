<template>
  <div class="exercise-evolution-chart">
    <a-card>
      <template #title>
        <div class="flex justify-between items-center">
          <div>
            <h4 class="text-lg font-semibold">{{ exercise.name }}</h4>
            <p class="text-sm text-gray-500">Evolução de Peso</p>
          </div>
        </div>
      </template>

      <!-- Gráfico Principal -->
      <div class="mb-4">
        <div class="chart-container" style="height: 300px;">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>

      <!-- Controles do Histórico -->
      <div class="mb-6 text-center">
        <a-button 
          @click="togglePreviousWorkouts"
          :type="showPreviousWorkouts ? 'default' : 'primary'"
          size="small"
        >
          {{ showPreviousWorkouts ? 'Ocultar Treinos Anteriores' : 'Ver Treinos Anteriores' }}
        </a-button>
      </div>

      <!-- Treinos Anteriores (Seção Expansível) -->
      <div v-if="showPreviousWorkouts" class="mb-6">
        <a-divider>
          <span class="text-sm text-gray-500">Comparação com Períodos Anteriores</span>
        </a-divider>
        
        <div v-if="safePreviousWorkouts && safePreviousWorkouts.length > 0">
          <a-collapse v-model:active-key="activeCollapseKeys" size="small">
            <a-collapse-panel 
              v-for="previousWorkout in safePreviousWorkouts" 
              :key="previousWorkout.workoutId"
              :header="`${previousWorkout.workoutName || 'Treino Anterior'} - ${formatDateRange(previousWorkout.dateRange)}`"
            >
              <div class="space-y-4">
                <div v-for="trainingDay in (previousWorkout.trainingDays || [])" :key="trainingDay.dayId">
                  <h6 class="font-medium text-gray-700 mb-2">{{ trainingDay.dayName || 'Treino' }}</h6>
                  <div class="chart-container" style="height: 200px;">
                    <canvas :ref="el => setPreviousChartRef(el, `${previousWorkout.workoutId}-${trainingDay.dayId}`)"></canvas>
                  </div>
                  
                  <!-- Anotações dos treinos anteriores -->
                  <div v-if="trainingDay.notes && trainingDay.notes.length > 0" class="mt-3">
                    <div class="space-y-1">
                      <div 
                        v-for="note in trainingDay.notes" 
                        :key="note.date || Math.random()"
                        class="text-xs bg-gray-50 p-2 rounded"
                      >
                        <div class="flex justify-between">
                          <span>{{ note.note || 'Sem anotação' }}</span>
                          <span class="text-gray-500">{{ note.date ? formatDate(note.date) : '' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
        
        <!-- Mensagem quando não há treinos anteriores -->
        <div v-else class="text-center py-8">
          <div class="text-gray-400 mb-2">
            <history-outlined style="font-size: 32px;" />
          </div>
          <p class="text-gray-500">Nenhum treino anterior encontrado para este exercício.</p>
          <p class="text-xs text-gray-400 mt-1">Este exercício só aparece no período atual.</p>
        </div>
      </div>

      <!-- Detalhes das Séries por Data -->
      <div v-if="workoutData.length > 0" class="mb-6">
        <h5 class="text-md font-medium mb-3">Detalhes das Séries</h5>
        <div class="space-y-4">
          <a-card 
            v-for="workout in workoutData" 
            :key="workout.date" 
            size="small"
            class="bg-gray-50"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <h6 class="font-medium text-gray-900">{{ formatDate(workout.date) }}</h6>
                <p class="text-sm text-gray-600">Peso: {{ workout.weight }}kg</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-600">Total: {{ workout.totalSets || workout.sets?.length || 0 }} séries</p>
              </div>
            </div>
            
            <!-- Séries individuais -->
            <div v-if="workout.sets && workout.sets.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div 
                v-for="(set, index) in workout.sets" 
                :key="index"
                class="bg-white p-3 rounded border"
              >
                <div class="text-sm">
                  <div class="font-medium text-gray-900">
                    Série {{ index + 1 }}
                    <span v-if="set.isBilateral" class="ml-1 px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                      Unilateral
                    </span>
                  </div>
                  <div class="text-gray-600 mt-1">
                    <!-- Exercício Bilateral (Unilateral) -->
                    <div v-if="set.isBilateral">
                      <div class="grid grid-cols-2 gap-2 text-xs">
                        <div class="bg-gray-50 p-2 rounded">
                          <div class="font-medium text-blue-600">Esquerdo</div>
                          <div>{{ set.repsLeft || 0 }} reps</div>
                          <div v-if="set.weightLeft">{{ set.weightLeft }}kg</div>
                        </div>
                        <div class="bg-gray-50 p-2 rounded">
                          <div class="font-medium text-green-600">Direito</div>
                          <div>{{ set.repsRight || 0 }} reps</div>
                          <div v-if="set.weightRight">{{ set.weightRight }}kg</div>
                        </div>
                      </div>
                    </div>
                    <!-- Exercício Tradicional (Bilateral) -->
                    <div v-else>
                      <div>Alvo: {{ set.targetRepsMin }}-{{ set.targetRepsMax }} reps</div>
                      <div class="flex justify-between">
                        <span>Concluídas: {{ set.completedReps }}</span>
                        <span :class="getCompletionClass(set.completedReps, set.targetRepsMin, set.targetRepsMax)">
                          {{ getCompletionStatus(set.completedReps, set.targetRepsMin, set.targetRepsMax) }}
                        </span>
                      </div>
                      <div v-if="set.weight" class="text-xs text-gray-500 mt-1">{{ set.weight }}kg</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fallback quando não há dados detalhados das séries -->
            <div v-else class="text-sm text-gray-600">
              <p>Repetições: {{ workout.repsDisplay }}</p>
            </div>

            <!-- Anotação deste dia específico -->
            <div v-if="getWorkoutNote(workout.date)" class="mt-4 pt-3 border-t border-gray-200">
              <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div class="flex items-start">
                  <div class="flex-shrink-0 text-yellow-600 mr-2">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-800">{{ getWorkoutNote(workout.date) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </div>
      </div>

    </a-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { HistoryOutlined } from '@ant-design/icons-vue'

Chart.register(...registerables)

interface WorkoutSet {
  targetRepsMin: number
  targetRepsMax: number
  completedReps: number
  weight?: number
}

interface WorkoutData {
  date: string
  weight: number
  repsDisplay: string
  sets?: WorkoutSet[]
  totalSets?: number
}

interface WorkoutNote {
  date: string
  note: string
}

interface PreviousTrainingDay {
  dayId: string
  dayName: string
  data: WorkoutData[]
  notes: WorkoutNote[]
}

interface PreviousWorkout {
  workoutId: string
  workoutName: string
  dateRange: { start: string; end: string }
  trainingDays: PreviousTrainingDay[]
}

interface Exercise {
  id: string
  name: string
}

export default defineComponent({
  name: 'ExerciseEvolutionChart',
  components: {
    HistoryOutlined
  },
  props: {
    exercise: {
      type: Object as PropType<Exercise>,
      required: true
    },
    workoutData: {
      type: Array as PropType<WorkoutData[]>,
      required: true
    },
    workoutNotes: {
      type: Array as PropType<WorkoutNote[]>,
      default: () => []
    },
    previousWorkouts: {
      type: Array as PropType<PreviousWorkout[]>,
      default: () => [],
      validator: (value: any) => {
        return Array.isArray(value)
      }
    }
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement | null>(null)
    const previousChartRefs = ref<Map<string, HTMLCanvasElement>>(new Map())
    const showPreviousWorkouts = ref(false)
    const activeCollapseKeys = ref<string[]>([])
    
    let mainChart: Chart | null = null
    const previousCharts = new Map<string, Chart>()

    // Computed para garantir que previousWorkouts seja sempre um array válido
    const safePreviousWorkouts = computed(() => {
      return Array.isArray(props.previousWorkouts) ? props.previousWorkouts : []
    })

    const setPreviousChartRef = (el: any, key: string) => {
      if (el && el instanceof HTMLCanvasElement) {
        previousChartRefs.value.set(key, el)
      }
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR')
    }

    const formatDateRange = (range: { start: string; end: string } | undefined) => {
      if (!range || !range.start || !range.end) return 'Data não disponível'
      return `${formatDate(range.start)} - ${formatDate(range.end)}`
    }

    const getCompletionStatus = (completed: number, min: number, max: number) => {
      if (completed >= min && completed <= max) {
        return '✓'
      } else if (completed > max) {
        return '↗'
      } else {
        return '↘'
      }
    }

    const getCompletionClass = (completed: number, min: number, max: number) => {
      if (completed >= min && completed <= max) {
        return 'text-green-600 font-medium'
      } else if (completed > max) {
        return 'text-blue-600 font-medium'
      } else {
        return 'text-red-600 font-medium'
      }
    }

    const getWorkoutNote = (date: string) => {
      const note = props.workoutNotes.find(n => n.date === date)
      return note ? note.note : null
    }

    const createChart = (canvas: HTMLCanvasElement, data: WorkoutData[], label: string = 'Treino Atual') => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      // Encontrar o número máximo de séries para criar datasets
      const maxSets = Math.max(...data.map(d => d.sets?.length || 0))
      
      // Cores para diferentes séries
      const seriesColors = [
        'rgba(59, 130, 246, 0.8)',   // Azul
        'rgba(16, 185, 129, 0.8)',   // Verde
        'rgba(245, 158, 11, 0.8)',   // Amarelo
        'rgba(239, 68, 68, 0.8)',    // Vermelho
        'rgba(139, 92, 246, 0.8)',   // Roxo
        'rgba(236, 72, 153, 0.8)',   // Rosa
      ]

      // Criar um dataset para cada série
      const datasets = []
      for (let serieIndex = 0; serieIndex < maxSets; serieIndex++) {
        datasets.push({
          label: `Série ${serieIndex + 1}`,
          data: data.map(workout => {
            const set = workout.sets?.[serieIndex]
            return set ? set.weight : null
          }),
          backgroundColor: seriesColors[serieIndex % seriesColors.length],
          borderColor: seriesColors[serieIndex % seriesColors.length].replace('0.8', '1'),
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
          // Dados customizados para tooltips
          repsData: data.map(workout => {
            const set = workout.sets?.[serieIndex]
            return set ? set.completedReps : null
          }),
          targetRepsData: data.map(workout => {
            const set = workout.sets?.[serieIndex]
            return set ? `${set.targetRepsMin}-${set.targetRepsMax}` : null
          })
        })
      }

      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(d => formatDate(d.date)),
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'nearest',
            intersect: true,
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Data'
              }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Peso (kg)'
              },
              beginAtZero: false
            }
          },
          plugins: {
            title: {
              display: true,
              text: label
            },
            legend: {
              display: true
            },
            tooltip: {
              callbacks: {
                title: function(context: any) {
                  return context[0].label;
                },
                label: function(context: any) {
                  const dataset = context.dataset;
                  const dataIndex = context.dataIndex;
                  const weight = context.parsed.y;
                  const reps = dataset.repsData ? dataset.repsData[dataIndex] : null;
                  const targetReps = dataset.targetRepsData ? dataset.targetRepsData[dataIndex] : null;
                  
                  if (weight === null) return null;
                  
                  const lines = [`${dataset.label}: ${weight}kg`];
                  if (reps !== null) {
                    lines.push(`Reps: ${reps}`);
                  }
                  if (targetReps !== null) {
                    lines.push(`Alvo: ${targetReps}`);
                  }
                  
                  return lines;
                }
              }
            }
          },
          layout: {
            padding: {
              top: 20
            }
          }
        }
      })
    }

    const initializeMainChart = () => {
      if (chartCanvas.value && props.workoutData.length > 0) {
        if (mainChart) {
          mainChart.destroy()
        }
        mainChart = createChart(chartCanvas.value, props.workoutData)
      }
    }

    const initializePreviousCharts = async () => {
      await nextTick()
      
      if (!safePreviousWorkouts.value || safePreviousWorkouts.value.length === 0) {
        return
      }
      
      safePreviousWorkouts.value.forEach(workout => {
        if (!workout || !workout.trainingDays) {
          return
        }
        
        workout.trainingDays.forEach(day => {
          if (!day || !day.dayId || !day.data) {
            return
          }
          
          const key = `${workout.workoutId}-${day.dayId}`
          const canvas = previousChartRefs.value.get(key)
          
          if (canvas && day.data.length > 0) {
            if (previousCharts.has(key)) {
              previousCharts.get(key)?.destroy()
            }
            
            const chart = createChart(canvas, day.data, `${workout.workoutName} - ${day.dayName}`)
            if (chart) {
              previousCharts.set(key, chart)
            }
          }
        })
      })
    }

    const togglePreviousWorkouts = async () => {
      showPreviousWorkouts.value = !showPreviousWorkouts.value
      if (showPreviousWorkouts.value) {
        await nextTick()
        initializePreviousCharts()
      }
    }

    onMounted(() => {
      initializeMainChart()
    })

    watch(() => props.workoutData, () => {
      initializeMainChart()
    }, { deep: true })

    watch(activeCollapseKeys, async () => {
      await nextTick()
      initializePreviousCharts()
    })

    return {
      chartCanvas,
      showPreviousWorkouts,
      activeCollapseKeys,
      setPreviousChartRef,
      formatDate,
      formatDateRange,
      togglePreviousWorkouts,
      getCompletionStatus,
      getCompletionClass,
      getWorkoutNote,
      safePreviousWorkouts
    }
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
}
</style>