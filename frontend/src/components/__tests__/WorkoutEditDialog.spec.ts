import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import WorkoutEditDialog from '../WorkoutEditDialog.vue';

// Mock das dependências
vi.mock('@/composables/useExercises', () => ({
  useExercises: () => ({
    exercises: { value: [
      { id: 'ex1', name: 'Exercise 1' },
      { id: 'ex2', name: 'Exercise 2' }
    ]}
  })
}));

vi.mock('@vue/apollo-composable', () => ({
  useMutation: () => ({
    mutate: vi.fn(),
    loading: { value: false }
  })
}));

vi.mock('ant-design-vue', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  },
  Modal: {
    confirm: vi.fn()
  }
}));

// Mock dos componentes Ant Design
const mockComponents = {
  'a-modal': {
    template: '<div v-if="visible"><slot /></div>',
    props: ['visible', 'title', 'width', 'footer', 'maskClosable'],
    emits: ['update:visible']
  },
  'a-alert': {
    template: '<div class="alert"><slot /></div>',
    props: ['message', 'description', 'type', 'showIcon']
  },
  'a-tabs': {
    template: '<div><slot /></div>',
    props: ['activeKey'],
    emits: ['update:activeKey']
  },
  'a-tab-pane': {
    template: '<div><slot /></div>',
    props: ['key', 'tab']
  },
  'a-table': {
    template: '<div class="table"></div>',
    props: ['columns', 'dataSource', 'pagination', 'bordered', 'rowKey']
  },
  'a-button': {
    template: '<button :type="type" :disabled="loading"><slot /></button>',
    props: ['type', 'loading', 'size', 'danger']
  },
  'a-input': {
    template: '<input :value="value" />',
    props: ['value', 'placeholder'],
    emits: ['update:value']
  },
  'a-select': {
    template: '<select :value="value"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option></select>',
    props: ['value', 'options', 'placeholder'],
    emits: ['update:value', 'change']
  },
  'a-input-number': {
    template: '<input type="number" :value="value" :min="min" :max="max" />',
    props: ['value', 'min', 'max'],
    emits: ['update:value', 'change', 'blur']
  }
};

describe('WorkoutEditDialog', () => {
  let wrapper: any;
  
  const mockWorkout = {
    id: 'workout-1',
    name: 'Test Workout',
    startedAt: null,
    trainingDays: [
      {
        id: 'td1',
        name: 'Day 1',
        order: 0,
        dayOfWeek: 0,
        trainingDayExercises: [
          {
            exercise: { id: 'ex1', name: 'Exercise 1' },
            order: 0,
            repSchemes: [{ sets: 3, minReps: 8, maxReps: 10 }],
            restIntervals: [{ intervalTime: '60s', order: 0 }],
          },
          {
            exercise: { id: 'ex2', name: 'Exercise 2' },
            order: 1,
            repSchemes: [{ sets: 2, minReps: 6, maxReps: 8 }],
            restIntervals: [{ intervalTime: '90s', order: 0 }],
          }
        ]
      },
      {
        id: 'td2',
        name: 'Day 2',
        order: 1,
        dayOfWeek: 1,
        trainingDayExercises: [
          {
            exercise: { id: 'ex1', name: 'Exercise 1' },
            order: 0,
            repSchemes: [{ sets: 4, minReps: 10, maxReps: 12 }],
            restIntervals: [{ intervalTime: '45s', order: 0 }],
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    wrapper = mount(WorkoutEditDialog, {
      props: {
        modelValue: true,
        workout: mockWorkout
      },
      global: {
        components: mockComponents,
        stubs: {
          'DeleteOutlined': { template: '<i class="delete-icon" />' },
          'ArrowUpOutlined': { template: '<i class="up-icon" />' },
          'ArrowDownOutlined': { template: '<i class="down-icon" />' },
          'PlusOutlined': { template: '<i class="plus-icon" />' }
        }
      }
    });
  });

  describe('Renderização', () => {
    it('deve renderizar o modal quando visible é true', () => {
      expect(wrapper.find('[class*="workout-edit-container"]').exists()).toBe(true);
    });

    it('deve mostrar alerta quando treino já foi iniciado', async () => {
      const startedWorkout = {
        ...mockWorkout,
        startedAt: '2023-01-01T00:00:00Z'
      };

      await wrapper.setProps({ workout: startedWorkout });
      await nextTick();

      expect(wrapper.find('.alert').exists()).toBe(true);
    });

    it('deve renderizar dias de treino', () => {
      expect(wrapper.find('.training-days-list').exists()).toBe(true);
      expect(wrapper.findAll('.training-day-tab')).toHaveLength(2);
    });
  });

  describe('Ordenação dos Dias de Treino', () => {
    it('deve manter a ordem original dos dias de treino', () => {
      const dayTabs = wrapper.findAll('.training-day-tab');
      expect(dayTabs[0].find('.day-name').text()).toBe('Day 1');
      expect(dayTabs[1].find('.day-name').text()).toBe('Day 2');
    });

    it('deve mostrar a ordem correta nos tabs', () => {
      const dayTabs = wrapper.findAll('.training-day-tab');
      expect(dayTabs[0].find('.day-order').text()).toBe('(1)');
      expect(dayTabs[1].find('.day-order').text()).toBe('(2)');
    });

    it('deve carregar editableTrainingDays com a estrutura correta', () => {
      expect(wrapper.vm.editableTrainingDays).toHaveLength(2);
      expect(wrapper.vm.editableTrainingDays[0].name).toBe('Day 1');
      expect(wrapper.vm.editableTrainingDays[0].order).toBe(0);
      expect(wrapper.vm.editableTrainingDays[1].name).toBe('Day 2');
      expect(wrapper.vm.editableTrainingDays[1].order).toBe(1);
    });
  });

  describe('Exercícios', () => {
    it('deve carregar exercícios corretamente para cada dia', () => {
      const firstDay = wrapper.vm.editableTrainingDays[0];
      expect(firstDay.exercises).toHaveLength(2);
      expect(firstDay.exercises[0].exerciseId).toBe('ex1');
      expect(firstDay.exercises[1].exerciseId).toBe('ex2');
    });

    it('deve manter a ordem dos exercícios', () => {
      const firstDay = wrapper.vm.editableTrainingDays[0];
      expect(firstDay.exercises[0].order).toBe(0);
      expect(firstDay.exercises[1].order).toBe(1);
    });

    it('deve processar rep schemes corretamente', () => {
      const firstDay = wrapper.vm.editableTrainingDays[0];
      const firstExercise = firstDay.exercises[0];
      expect(firstExercise.totalSets).toBe(3);
      expect(firstExercise.repsString).toBe('8-10');
    });

    it('deve processar rest intervals corretamente', () => {
      const firstDay = wrapper.vm.editableTrainingDays[0];
      const firstExercise = firstDay.exercises[0];
      expect(firstExercise.restString).toBe('60s');
    });
  });

  describe('Funcionalidades', () => {
    it('deve permitir cancelar', async () => {
      // Call the cancel method directly since the button event handling might be complex
      wrapper.vm.cancel();
      await wrapper.vm.$nextTick();
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });

    it('deve ter botão de salvar', () => {
      const saveButton = wrapper.find('[type="primary"]');
      expect(saveButton.exists()).toBe(true);
      expect(saveButton.text()).toContain('Salvar');
    });

    it('deve não permitir edição quando treino foi iniciado', async () => {
      const startedWorkout = {
        ...mockWorkout,
        startedAt: '2023-01-01T00:00:00Z'
      };

      await wrapper.setProps({ workout: startedWorkout });
      await nextTick();

      expect(wrapper.find('.training-days-list').exists()).toBe(false);
      expect(wrapper.find('[type="primary"]').exists()).toBe(false);
    });
  });

  describe('Drag and Drop', () => {
    it('deve configurar elementos como draggable', () => {
      const dayTabs = wrapper.findAll('.training-day-tab');
      dayTabs.forEach(tab => {
        expect(tab.attributes('draggable')).toBe('true');
      });
    });

    it('deve ter handle de drag', () => {
      const dragHandles = wrapper.findAll('.drag-handle');
      expect(dragHandles).toHaveLength(2);
      expect(dragHandles[0].text()).toBe('⋮⋮');
    });
  });
});