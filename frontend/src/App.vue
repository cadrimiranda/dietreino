<!-- App.vue -->
<template>
  <div class="min-h-screen">
    <div v-if="!authInitialized" class="flex items-center justify-center min-h-screen bg-gray-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-600 text-lg">Carregando...</p>
      </div>
    </div>
    <div v-else>
      <Toast position="top-right" />
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Toast from "primevue/toast";
import { createAuthProvider } from "@/composables/useAuthProvider";

const authInitialized = ref(false);

onMounted(async () => {
  try {
    const auth = createAuthProvider();
    await auth.initialize();
    authInitialized.value = true;
  } catch (error) {
    console.error('Error in auth initialization:', error)
    authInitialized.value = true; // Still show the app even if auth fails
  }
});
</script>

<style>
@import "./style.css";
</style>
