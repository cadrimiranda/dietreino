<template>
  <div class="day-selector">
    <div class="day-selector-label" v-if="label">
      {{ label }}
    </div>
    <div class="day-selector-container">
      <div
        v-for="(day, index) in daysOfWeek"
        :key="index"
        class="day-item"
        :class="{
          'day-item-selected': selectedDays.includes(index),
          'day-item-disabled': disabled || (maxDays && selectedDays.length >= maxDays && !selectedDays.includes(index))
        }"
        @click="toggleDay(index)"
      >
        <div class="day-letter">{{ day.letter }}</div>
        <div class="day-name">{{ day.name }}</div>
      </div>
    </div>
    <div v-if="error" class="day-selector-error">
      {{ error }}
    </div>
    <div v-if="showHelper" class="day-selector-helper">
      {{ helperText }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

interface DayOfWeek {
  letter: string;
  name: string;
}

export default defineComponent({
  name: 'DaySelector',
  props: {
    modelValue: {
      type: Array as () => number[],
      default: () => [],
    },
    label: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    maxDays: {
      type: Number,
      default: 7,
    },
    required: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: '',
    },
    showHelper: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    // Definição dos dias da semana (0 = Domingo, 6 = Sábado)
    const daysOfWeek: DayOfWeek[] = [
      { letter: 'D', name: 'Dom' },
      { letter: 'S', name: 'Seg' },
      { letter: 'T', name: 'Ter' },
      { letter: 'Q', name: 'Qua' },
      { letter: 'Q', name: 'Qui' },
      { letter: 'S', name: 'Sex' },
      { letter: 'S', name: 'Sáb' },
    ];

    const selectedDays = computed(() => {
      return Array.isArray(props.modelValue) ? props.modelValue : [];
    });

    const helperText = computed(() => {
      const count = selectedDays.value.length;
      if (count === 0) {
        return 'Selecione os dias da semana para o treino';
      }
      
      const dayNames = selectedDays.value
        .sort((a, b) => a - b)
        .map(day => daysOfWeek[day].name)
        .join(', ');
      
      return `${count} dia${count > 1 ? 's' : ''} selecionado${count > 1 ? 's' : ''}: ${dayNames}`;
    });

    function toggleDay(dayIndex: number) {
      if (props.disabled) return;

      const currentSelection = [...selectedDays.value];
      const indexInSelection = currentSelection.indexOf(dayIndex);

      if (indexInSelection >= 0) {
        // Remove o dia se já estiver selecionado
        currentSelection.splice(indexInSelection, 1);
      } else {
        // Adiciona o dia se não estiver selecionado e não exceder o limite
        if (!props.maxDays || currentSelection.length < props.maxDays) {
          currentSelection.push(dayIndex);
        }
      }

      // Ordena os dias selecionados
      currentSelection.sort((a, b) => a - b);

      emit('update:modelValue', currentSelection);
      emit('change', currentSelection);
    }

    return {
      daysOfWeek,
      selectedDays,
      helperText,
      toggleDay,
    };
  },
});
</script>

<style scoped>
.day-selector {
  width: 100%;
}

.day-selector-label {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
}

.day-selector-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.day-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 64px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #ffffff;
  user-select: none;
}

.day-item:hover:not(.day-item-disabled) {
  border-color: #1890ff;
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.15);
}

.day-item-selected {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #ffffff;
}

.day-item-selected:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.day-item-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f5f5f5;
}

.day-letter {
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 2px;
}

.day-name {
  font-size: 11px;
  font-weight: 400;
  line-height: 1;
  opacity: 0.8;
}

.day-selector-error {
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
}

.day-selector-helper {
  margin-top: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

/* Responsividade */
@media (max-width: 640px) {
  .day-selector-container {
    justify-content: center;
  }
  
  .day-item {
    width: 44px;
    height: 60px;
  }
  
  .day-letter {
    font-size: 14px;
  }
  
  .day-name {
    font-size: 10px;
  }
}
</style>