<template>
  <a-card>
    <div class="flex flex-col items-center p-6">
      <div
        class="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4"
      >
        <team-outlined class="text-gray-400 text-2xl" />
      </div>
      <h3 class="text-lg font-medium text-gray-900">No clients found</h3>
      <p class="mt-2 text-gray-500">
        {{
          hasSearchQuery
            ? "Try adjusting your search or filters"
            : "Get started by adding your first client"
        }}
      </p>
      <a-button
        v-if="!hasSearchQuery"
        type="primary"
        class="mt-4"
        @click="$emit('add-client')"
      >
        <template #icon><plus-outlined /></template>
        Add Client
      </a-button>
    </div>
  </a-card>
</template>

<script>
import { TeamOutlined, PlusOutlined } from "@ant-design/icons-vue";

export default {
  name: "ClientEmptyState",
  components: {
    TeamOutlined,
    PlusOutlined,
  },
  props: {
    hasSearchQuery: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["add-client"],
};
</script>
