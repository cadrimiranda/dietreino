<template>
  <a-card
    class="client-card hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden border-0"
  >
    <div class="px-4 py-3 sm:px-5 sm:py-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center">
          <a-avatar
            :style="formatters.getAvatarStyle(client.name)"
            shape="square"
            :size="48"
            class="mr-3 rounded-lg shadow-sm"
          >
            {{ formatters.getInitials(client.name) }}
          </a-avatar>

          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-base sm:text-lg truncate">
              {{ client.name }}
            </h3>
            <p class="text-gray-500 text-xs sm:text-sm truncate">
              {{ client.email }}
            </p>
          </div>
        </div>

        <div class="flex-shrink-0">
          <ClientActionsDropdown
            :clientId="client.id"
            :clientName="client.name"
            @edit-client="$emit('edit-client', $event)"
            @delete-client="$emit('delete-client', $event)"
          />
        </div>
      </div>

      <div class="bg-gray-50 rounded-lg p-3 mb-3">
        <div class="grid grid-cols-2 gap-3">
          <ClientStatusDisplay label="Treino" :status="client.trainingStatus" />
          <ClientStatusDisplay label="Dieta" :status="client.dietStatus" />
        </div>
      </div>

      <div
        class="flex justify-between items-center pt-2 border-t border-gray-100"
      >
        <span class="text-xs text-gray-400 flex items-center">
          <calendar-outlined class="mr-1" />
          {{ formatters.formatDate(client.createdAt) }}
        </span>
        <a-button
          type="primary"
          size="small"
          class="rounded-lg shadow-sm h-8 flex items-center"
          @click="$emit('view-client', client.id)"
        >
          Detalhes
          <right-outlined class="ml-1" />
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { CalendarOutlined, RightOutlined } from "@ant-design/icons-vue";
import { formatters, Client } from "./clientUtils";
import ClientActionsDropdown from "./ClientActionsDropdown.vue";
import ClientStatusDisplay from "./ClientStatusDisplay.vue";

export default defineComponent({
  components: {
    CalendarOutlined,
    RightOutlined,
    ClientActionsDropdown,
    ClientStatusDisplay,
  },
  props: {
    client: {
      type: Object as PropType<Client>,
      required: true,
    },
  },
  emits: ["view-client", "edit-client", "delete-client"],
  setup() {
    return { formatters };
  },
});
</script>

<style scoped>
.client-card {
  max-width: 100%;
  width: 100%;
}

@media (min-width: 640px) {
  .client-card {
    max-width: 400px;
  }
}

.client-card:hover {
  transform: translateY(-4px);
}

a-button:focus,
a-dropdown:focus {
  outline: 2px solid #1890ff;
  outline-offset: 2px;
}
</style>
