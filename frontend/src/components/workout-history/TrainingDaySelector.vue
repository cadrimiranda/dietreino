<template>
  <div class="training-day-selector">
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-3">Selecione um Training Day</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <a-card
          v-for="day in trainingDays"
          :key="day.id"
          :class="[
            'cursor-pointer transition-all duration-200 hover:shadow-md',
            selectedDayId === day.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
          ]"
          size="small"
          @click="selectDay(day)"
        >
          <div class="text-center">
            <div class="text-sm font-medium text-gray-900">{{ day.name }}</div>
            <div class="text-xs text-gray-500 mt-1">
              {{ day.exercises.length }} exercício{{ day.exercises.length !== 1 ? 's' : '' }}
            </div>
          </div>
        </a-card>
      </div>
    </div>

    <div v-if="selectedDay" class="border-t pt-4">
      <h4 class="text-md font-medium mb-3">Exercícios - {{ selectedDay.name }}</h4>
      <div class="space-y-4">
        <div v-for="exercise in selectedDay.exercises" :key="exercise.id" class="exercise-item">
          <a-card
            :class="[
              'cursor-pointer transition-all duration-200',
              selectedExerciseId === exercise.id ? 'border-green-500 bg-green-50' : 'hover:border-gray-300'
            ]"
            size="small"
            @click="selectExercise(exercise)"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium">{{ exercise.exercise.name }}</div>
                <div class="text-sm text-gray-500">
                  {{ exercise.sets }} séries • {{ exercise.repsDisplay }}
                </div>
              </div>
              <line-chart-outlined class="text-gray-400" />
            </div>
          </a-card>
          
          <!-- Gráfico aparece imediatamente abaixo do exercício selecionado -->
          <div v-if="selectedExerciseId === exercise.id" class="mt-3">
            <slot name="exercise-chart" :exercise="exercise"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { LineChartOutlined } from '@ant-design/icons-vue'

interface Exercise {
  id: string
  exercise: {
    id: string
    name: string
  }
  sets: number
  repsDisplay: string
  order: number
}

interface TrainingDay {
  id: string
  name: string
  order: number
  exercises: Exercise[]
}

export default defineComponent({
  name: 'TrainingDaySelector',
  components: {
    LineChartOutlined
  },
  props: {
    trainingDays: {
      type: Array as PropType<TrainingDay[]>,
      required: true
    },
    selectedDayId: {
      type: String,
      default: null
    },
    selectedExerciseId: {
      type: String,
      default: null
    }
  },
  emits: ['day-selected', 'exercise-selected'],
  setup(props, { emit }) {
    const selectedDay = computed(() => {
      return props.trainingDays.find(day => day.id === props.selectedDayId)
    })

    const selectDay = (day: TrainingDay) => {
      emit('day-selected', day)
    }

    const selectExercise = (exercise: Exercise) => {
      // Se o exercício já está selecionado, desmarcar
      if (props.selectedExerciseId === exercise.id) {
        emit('exercise-selected', null)
      } else {
        emit('exercise-selected', exercise)
      }
    }

    return {
      selectedDay,
      selectDay,
      selectExercise
    }
  }
})
</script>