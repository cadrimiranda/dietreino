<template>
  <div class="workout-history-view">
    <WorkoutHistoryDashboard
      :users="users"
      :workouts="workouts"
      :available-exercises="availableExercises"
      :is-trainer="isTrainer"
      :default-filters="defaultFilters"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { gql } from '@apollo/client';
import WorkoutHistoryDashboard from '@/components/workout-history/WorkoutHistoryDashboard.vue';
import type { WorkoutHistoryFilters as WorkoutHistoryFiltersType } from '@/types/workoutHistory';

// GraphQL queries for dropdown data
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
    }
  }
`;

const GET_WORKOUTS = gql`
  query GetWorkouts {
    workouts {
      id
      name
      isActive
      createdAt
    }
  }
`;

const GET_EXERCISES = gql`
  query GetExercises {
    exercises {
      id
      name
    }
  }
`;

// Fetch data for dropdowns
const { result: usersResult } = useQuery(GET_USERS);
const { result: workoutsResult } = useQuery(GET_WORKOUTS);
const { result: exercisesResult } = useQuery(GET_EXERCISES);

// Mock current user context - in real app this would come from auth store
const currentUser = ref({
  id: 'current-user-id',
  role: 'TRAINER' // or 'CLIENT'
});

const isTrainer = computed(() => currentUser.value.role === 'TRAINER');

// Filter users based on trainer relationship
const users = computed(() => {
  const allUsers = usersResult.value?.users || [];
  
  if (isTrainer.value) {
    // In real app, filter by trainer's clients
    return allUsers.filter((user: any) => user.role === 'CLIENT');
  }
  
  // For clients, return only themselves
  return allUsers.filter((user: any) => user.id === currentUser.value.id);
});

const workouts = computed(() => {
  return workoutsResult.value?.workouts || [];
});

const availableExercises = computed(() => {
  return exercisesResult.value?.exercises || [];
});

// Default filters based on user role
const defaultFilters = computed((): WorkoutHistoryFiltersType => {
  if (isTrainer.value) {
    // Trainers see all their clients by default
    return {};
  } else {
    // Clients see only their own data
    return {
      userId: currentUser.value.id
    };
  }
});

onMounted(() => {
  // Set page title
  document.title = isTrainer.value 
    ? 'Histórico de Treinos - Alunos' 
    : 'Meu Histórico de Treinos';
});
</script>

<style scoped>
.workout-history-view {
  min-height: 100vh;
  background: #f8fafc;
  padding: 0;
}

/* Global styles for this view */
:deep(.workout-history-dashboard) {
  padding-top: 32px;
}

@media (max-width: 768px) {
  :deep(.workout-history-dashboard) {
    padding: 16px;
  }
}
</style>