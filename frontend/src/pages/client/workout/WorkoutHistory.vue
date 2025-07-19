<template>
  <div class="workout-history-page">
    <WorkoutHistoryView
      :user-id="userId"
      :workout-id="workoutId"
      @close="goBack"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import WorkoutHistoryView from '@/components/workout-history/WorkoutHistoryView.vue'

export default defineComponent({
  name: 'WorkoutHistory',
  components: {
    WorkoutHistoryView
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const userId = route.params.clientId as string
    const workoutId = route.params.workoutId as string

    const goBack = () => {
      router.push(`/clients/${userId}`)
    }

    return {
      userId,
      workoutId,
      goBack
    }
  }
})
</script>

<style scoped>
.workout-history-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>