<template>
  <div class="exercise-evolution-chart">
    <a-card>
      <template #title>
        <div class="flex justify-between items-center">
          <div>
            <h4 class="text-lg font-semibold">{{ exercise.name }}</h4>
            <p class="text-sm text-gray-500">Evolução de Peso</p>
          </div>
          <a-button 
            v-if="!showPreviousWorkouts" 
            type="link" 
            @click="togglePreviousWorkouts"
          >
            Ver Treinos Anteriores
          </a-button>
        </div>
      </template>

      <!-- Gráfico Principal -->
      <div class="mb-6">
        <div class="chart-container" style="height: 300px;">
          <canvas ref="chartCanvas"></canvas>
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
                  <div class="font-medium text-gray-900">Série {{ index + 1 }}</div>
                  <div class="text-gray-600 mt-1">
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

            <!-- Fallback quando não há dados detalhados das séries -->
            <div v-else class="text-sm text-gray-600">
              <p>Repetições: {{ workout.repsDisplay }}</p>
            </div>
          </a-card>
        </div>
      </div>

      <!-- Anotações -->
      <div v-if="workoutNotes.length > 0" class="mb-6">
        <h5 class="text-md font-medium mb-3">Anotações do Treino</h5>
        <div class="space-y-2">
          <a-card 
            v-for="note in workoutNotes" 
            :key="note.date" 
            size="small"
            class="bg-yellow-50 border-yellow-200"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-sm">{{ note.note }}</p>
              </div>
              <div class="text-xs text-gray-500 ml-3">
                {{ formatDate(note.date) }}
              </div>
            </div>
          </a-card>
        </div>
      </div>

      <!-- Treinos Anteriores (Colapsável) -->
      <a-collapse v-if="showPreviousWorkouts" v-model:active-key="activeCollapseKeys">
        <a-collapse-panel 
          v-for="previousWorkout in previousWorkouts" 
          :key="previousWorkout.workoutId"
          :header="`${previousWorkout.workoutName} - ${formatDateRange(previousWorkout.dateRange)}`"
        >
          <div class="space-y-4">
            <div v-for="trainingDay in previousWorkout.trainingDays" :key="trainingDay.dayId">
              <h6 class="font-medium text-gray-700 mb-2">{{ trainingDay.dayName }}</h6>
              <div class="chart-container" style="height: 200px;">
                <canvas :ref="el => setPreviousChartRef(el, `${previousWorkout.workoutId}-${trainingDay.dayId}`)"></canvas>
              </div>
              
              <!-- Anotações dos treinos anteriores -->
              <div v-if="trainingDay.notes.length > 0" class="mt-3">
                <div class="space-y-1">
                  <div 
                    v-for="note in trainingDay.notes" 
                    :key="note.date"
                    class="text-xs bg-gray-50 p-2 rounded"
                  >
                    <div class="flex justify-between">
                      <span>{{ note.note }}</span>
                      <span class="text-gray-500">{{ formatDate(note.date) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </a-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

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
      default: () => []
    }
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement | null>(null)
    const previousChartRefs = ref<Map<string, HTMLCanvasElement>>(new Map())
    const showPreviousWorkouts = ref(false)
    const activeCollapseKeys = ref<string[]>([])
    
    let mainChart: Chart | null = null
    const previousCharts = new Map<string, Chart>()

    const setPreviousChartRef = (el: any, key: string) => {
      if (el && el instanceof HTMLCanvasElement) {
        previousChartRefs.value.set(key, el)
      }
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR')
    }

    const formatDateRange = (range: { start: string; end: string }) => {
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
      
      props.previousWorkouts.forEach(workout => {
        workout.trainingDays.forEach(day => {
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
      getCompletionClass
    }
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
}
</style>