<template>
  <div>
    <div class="text-xs text-gray-500 mb-1">{{ label }}</div>
    <a-tag
      :color="formatters.getStatusColor(status)"
      class="w-full flex justify-center py-1 rounded-md text-center"
    >
      {{ formatters.capitalizeFirst(status) }}
    </a-tag>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { formatters } from "./clientUtils";

export default defineComponent({
  props: {
    label: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  setup() {
    return { formatters };
  },
});
</script>
