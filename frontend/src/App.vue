<!-- App.vue -->
<template>
  <div class="min-h-screen">
    <Toast />
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
});
</script>

<style>
@import "./style.css";
</style>
