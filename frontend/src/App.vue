<!-- App.vue -->
<template>
  <div class="min-h-screen">
    <Toast />
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
@import "./style.css";
</style>
