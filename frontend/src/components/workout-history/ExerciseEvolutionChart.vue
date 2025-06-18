<template>
  <div class="exercise-evolution-chart">
    <a-card>
      <template #title>
        <div class="flex justify-between items-center">
          <div>
            <h4 class="text-lg font-semibold">{{ exercise.name }}</h4>
            <p class="text-sm text-gray-500">Evolução de Carga</p>
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

interface WorkoutData {
  date: string
  weight: number
  reps: number
  volume: number
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

    const createChart = (canvas: HTMLCanvasElement, data: WorkoutData[], label: string = 'Treino Atual') => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(d => formatDate(d.date)),
          datasets: [
            {
              label: 'Peso (kg)',
              data: data.map(d => d.weight),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.1,
              yAxisID: 'y'
            },
            {
              label: 'Volume (kg)',
              data: data.map(d => d.volume),
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.1,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
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
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Volume (kg)'
              },
              grid: {
                drawOnChartArea: false,
              },
            }
          },
          plugins: {
            title: {
              display: true,
              text: label
            },
            legend: {
              display: true
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
      togglePreviousWorkouts
    }
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
}
</style>