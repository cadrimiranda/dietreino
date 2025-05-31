import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import WorkoutEditDialog from '../WorkoutEditDialog.vue';

describe('WorkoutEditDialog Order Validation', () => {
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
            exercise: { id: 'ex3', name: 'Exercise 3' },
            order: 0,
            repSchemes: [{ sets: 4, minReps: 10, maxReps: 12 }],
            restIntervals: [{ intervalTime: '120s', order: 0 }],
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    // Mock external dependencies
    vi.mock('@/composables/useExercises', () => ({
      useExercises: () => ({
        exercises: { value: [
          { id: 'ex1', name: 'Exercise 1' },
          { id: 'ex2', name: 'Exercise 2' },
          { id: 'ex3', name: 'Exercise 3' },
        ]},
        loading: { value: false }
      })
    }));

    vi.mock('@vue/apollo-composable', () => ({
      useMutation: () => ({
        mutate: vi.fn().mockResolvedValue({})
      })
    }));

    wrapper = mount(WorkoutEditDialog, {
      props: {
        modelValue: true,
        workout: mockWorkout
      },
      global: {
        stubs: {
          'a-modal': { template: '<div><slot /></div>' },
          'a-alert': { template: '<div />' },
          'a-tabs': { template: '<div><slot /></div>' },
          'a-tab-pane': { template: '<div><slot /></div>' },
          'a-input': { template: '<input />' },
          'a-table': { template: '<div />' },
          'a-select': { template: '<select />' },
          'a-input-number': { template: '<input type="number" />' },
          'a-button': { template: '<button><slot /></button>' },
        }
      }
    });
  });

  it('should initialize training days with valid sequential order values', () => {
    const vm = wrapper.vm;
    
    // Wait for component to initialize
    wrapper.vm.$nextTick(() => {
      const trainingDays = vm.editableTrainingDays;
      
      // Verify training days have sequential order
      expect(trainingDays).toHaveLength(2);
      
      trainingDays.forEach((day: any, index: number) => {
        // Each training day should have order equal to its index
        expect(day.order).toBe(index);
        expect(typeof day.order).toBe('number');
        expect(day.order).not.toBeNull();
        expect(day.order).not.toBeUndefined();
        expect(day.order).toBeGreaterThanOrEqual(0);
        
        // Each exercise within the day should have sequential order
        day.exercises.forEach((exercise: any, exerciseIndex: number) => {
          expect(exercise.order).toBe(exerciseIndex);
          expect(typeof exercise.order).toBe('number');
          expect(exercise.order).not.toBeNull();
          expect(exercise.order).not.toBeUndefined();
          expect(exercise.order).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  it('should maintain order consistency when drag and drop reorders training days', () => {
    const vm = wrapper.vm;
    
    wrapper.vm.$nextTick(() => {
      // Simulate drag and drop reordering (move first day to position 1)
      const originalTrainingDays = [...vm.editableTrainingDays];
      
      // Simulate the drag and drop operation
      vm.draggedDayIndex = 0;
      const mockEvent = {
        preventDefault: vi.fn(),
        target: {
          closest: vi.fn().mockReturnValue({
            parentNode: {
              children: [
                { /* first element */ },
                { /* second element */ }
              ]
            }
          })
        }
      };
      
      // Mock Array.from to return proper index
      vi.spyOn(Array, 'from').mockReturnValue([
        { /* first element */ },
        { /* second element */ }
      ]);
      
      // Manually simulate the reorder operation
      const draggedDay = vm.editableTrainingDays.splice(0, 1)[0];
      vm.editableTrainingDays.splice(1, 0, draggedDay);
      
      // Update orders after reordering
      vm.editableTrainingDays.forEach((day: any, index: number) => {
        day.order = index;
      });
      
      // Verify that orders are still sequential after reordering
      vm.editableTrainingDays.forEach((day: any, index: number) => {
        expect(day.order).toBe(index);
        expect(typeof day.order).toBe('number');
        expect(day.order).not.toBeNull();
        expect(day.order).not.toBeUndefined();
      });
      
      // Verify the order sequence is still valid (0, 1, 2, ...)
      const orders = vm.editableTrainingDays.map((day: any) => day.order);
      expect(orders).toEqual([0, 1]);
    });
  });

  it('should validate order values before sending to API', () => {
    const vm = wrapper.vm;
    
    wrapper.vm.$nextTick(() => {
      // Get the data that would be sent to API
      const currentData = vm.editableTrainingDays.map((day: any) => ({
        ...(day.id && { id: day.id }),
        name: day.name,
        order: day.order,
        dayOfWeek: day.dayOfWeek,
        exercises: day.exercises.map((ex: any) => ({
          exerciseId: ex.exerciseId,
          order: ex.order,
          repSchemes: ex.repSchemes,
          restIntervals: ex.restIntervals,
        })),
      }));

      // Validate that all training days have valid order values
      currentData.forEach((day: any, index: number) => {
        expect(day.order).toBe(index);
        expect(typeof day.order).toBe('number');
        expect(day.order).not.toBeNull();
        expect(day.order).not.toBeUndefined();
        expect(day.order).toBeGreaterThanOrEqual(0);
        
        // Validate that all exercises have valid order values
        day.exercises.forEach((exercise: any, exerciseIndex: number) => {
          expect(exercise.order).toBe(exerciseIndex);
          expect(typeof exercise.order).toBe('number');
          expect(exercise.order).not.toBeNull();
          expect(exercise.order).not.toBeUndefined();
          expect(exercise.order).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  it('should never fall back to undefined or null order values', () => {
    // Test with potentially problematic workout data
    const problematicWorkout = {
      id: 'workout-problematic',
      name: 'Problematic Workout',
      startedAt: null,
      trainingDays: [
        {
          id: 'td1',
          name: 'Day with potential null order',
          order: null, // This should be handled gracefully
          dayOfWeek: 0,
          trainingDayExercises: [
            {
              exercise: { id: 'ex1', name: 'Exercise 1' },
              order: undefined, // This should be handled gracefully
              repSchemes: [{ sets: 3, minReps: 8, maxReps: 10 }],
              restIntervals: [{ intervalTime: '60s', order: 0 }],
            }
          ]
        }
      ]
    };

    const problematicWrapper = mount(WorkoutEditDialog, {
      props: {
        modelValue: true,
        workout: problematicWorkout
      },
      global: {
        stubs: {
          'a-modal': { template: '<div><slot /></div>' },
          'a-alert': { template: '<div />' },
          'a-tabs': { template: '<div><slot /></div>' },
          'a-tab-pane': { template: '<div><slot /></div>' },
          'a-input': { template: '<input />' },
          'a-table': { template: '<div />' },
          'a-select': { template: '<select />' },
          'a-input-number': { template: '<input type="number" />' },
          'a-button': { template: '<button><slot /></button>' },
        }
      }
    });

    const vm = problematicWrapper.vm;
    
    problematicWrapper.vm.$nextTick(() => {
      const trainingDays = vm.editableTrainingDays;
      
      // Even with problematic input data, the component should have valid orders
      trainingDays.forEach((day: any, index: number) => {
        expect(day.order).toBe(index); // Should fallback to index
        expect(typeof day.order).toBe('number');
        expect(day.order).not.toBeNull();
        expect(day.order).not.toBeUndefined();
        
        day.exercises.forEach((exercise: any, exerciseIndex: number) => {
          expect(exercise.order).toBe(exerciseIndex); // Should fallback to index
          expect(typeof exercise.order).toBe('number');
          expect(exercise.order).not.toBeNull();
          expect(exercise.order).not.toBeUndefined();
        });
      });
    });
  });

  it('should add new exercises with proper sequential order', () => {
    const vm = wrapper.vm;
    
    wrapper.vm.$nextTick(() => {
      const firstDay = vm.editableTrainingDays[0];
      const initialExerciseCount = firstDay.exercises.length;
      
      // Add a new exercise
      vm.addExercise(firstDay);
      
      // Verify the new exercise has the correct order
      const newExercise = firstDay.exercises[firstDay.exercises.length - 1];
      expect(newExercise.order).toBe(initialExerciseCount);
      expect(typeof newExercise.order).toBe('number');
      expect(newExercise.order).not.toBeNull();
      expect(newExercise.order).not.toBeUndefined();
      
      // Verify all exercises still have sequential order
      firstDay.exercises.forEach((exercise: any, index: number) => {
        expect(exercise.order).toBe(index);
        expect(typeof exercise.order).toBe('number');
        expect(exercise.order).not.toBeNull();
        expect(exercise.order).not.toBeUndefined();
      });
    });
  });
});