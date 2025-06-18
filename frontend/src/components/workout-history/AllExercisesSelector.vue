<template>
  <div class="all-exercises-selector">
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-3">Todos os Exercícios do Treino</h3>
      <p class="text-sm text-gray-600 mb-4">
        Selecione qualquer exercício para ver sua evolução ao longo do tempo
      </p>
      
      <!-- Filtro de Busca -->
      <a-input-search
        v-model:value="searchQuery"
        placeholder="Buscar exercício..."
        style="margin-bottom: 16px"
        @search="onSearch"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <a-card
        v-for="exercise in filteredExercises"
        :key="exercise.id"
        :class="[
          'cursor-pointer transition-all duration-200 hover:shadow-md',
          selectedExerciseId === exercise.id ? 'border-green-500 bg-green-50' : 'hover:border-gray-300'
        ]"
        size="small"
        @click="selectExercise(exercise)"
      >
        <div class="space-y-2">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ exercise.name }}</h4>
            </div>
            <line-chart-outlined class="text-gray-400 flex-shrink-0" />
          </div>
          
          <div class="text-xs text-gray-500 space-y-1">
            <div>Aparece em: {{ exercise.trainingDays.join(', ') }}</div>
            <div>{{ exercise.totalSets }} séries total</div>
            <div v-if="exercise.lastWorkout">
              Último treino: {{ formatDate(exercise.lastWorkout) }}
            </div>
          </div>
          
          <!-- Mini preview dos dados -->
          <div v-if="exercise.recentData.length > 0" class="mt-2">
            <div class="text-xs text-gray-400 mb-1">Últimas 3 sessões:</div>
            <div class="flex space-x-2">
              <div 
                v-for="data in exercise.recentData.slice(-3)" 
                :key="data.date"
                class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
              >
                {{ data.weight }}kg × {{ data.reps }}
              </div>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- Estado vazio -->
    <div v-if="filteredExercises.length === 0" class="text-center py-8">
      <div class="text-gray-400 mb-2">
        <search-outlined style="font-size: 48px;" />
      </div>
      <p class="text-gray-500">
        {{ searchQuery ? 'Nenhum exercício encontrado com esse termo' : 'Nenhum exercício encontrado' }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue'
import { LineChartOutlined, SearchOutlined } from '@ant-design/icons-vue'

interface ExerciseData {
  date: string
  weight: number
  reps: number
  volume: number
}

interface AllExercise {
  id: string
  name: string
  trainingDays: string[]
  totalSets: number
  lastWorkout?: string
  recentData: ExerciseData[]
}

export default defineComponent({
  name: 'AllExercisesSelector',
  components: {
    LineChartOutlined,
    SearchOutlined
  },
  props: {
    exercises: {
      type: Array as PropType<AllExercise[]>,
      required: true
    },
    selectedExerciseId: {
      type: String,
      default: null
    }
  },
  emits: ['exercise-selected'],
  setup(props, { emit }) {
    const searchQuery = ref('')

    const filteredExercises = computed(() => {
      if (!searchQuery.value) {
        return props.exercises
      }
      
      const query = searchQuery.value.toLowerCase()
      return props.exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(query) ||
        exercise.trainingDays.some(day => day.toLowerCase().includes(query))
      )
    })

    const selectExercise = (exercise: AllExercise) => {
      emit('exercise-selected', exercise)
    }

    const onSearch = (value: string) => {
      searchQuery.value = value
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR')
    }

    return {
      searchQuery,
      filteredExercises,
      selectExercise,
      onSearch,
      formatDate
    }
  }
})
</script>