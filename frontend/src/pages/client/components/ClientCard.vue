<template>
  <a-card
    class="hover:shadow-md transition-shadow transform hover:-translate-y-1 duration-200"
  >
    <div class="p-2">
      <!-- Client header with avatar and menu -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center">
          <a-avatar :style="avatarStyle" shape="circle" class="mr-3">
            {{ getInitials(client.name) }}
          </a-avatar>
          <div>
            <h3 class="font-semibold text-lg">{{ client.name }}</h3>
            <p class="text-gray-500 text-sm">{{ client.email }}</p>
          </div>
        </div>
        <div>
          <a-popconfirm
            :title="`Tem certeza que deseja excluir ${client.name}?`"
            ok-text="Sim"
            cancel-text="Não"
            @confirm="$emit('delete-client', client.id)"
          >
            <a-button type="text" shape="circle">
              <template #icon><delete-outlined /></template>
            </a-button>
          </a-popconfirm>

          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleMenuClick">
                <a-menu-item key="edit">Edit Client</a-menu-item>
                <a-menu-item key="message">Send Message</a-menu-item>
              </a-menu>
            </template>
            <a-button type="text" shape="circle">
              <template #icon><more-outlined /></template>
            </a-button>
          </a-dropdown>
        </div>
      </div>

      <!-- Client status badges -->
      <div class="grid grid-cols-2 gap-2 mb-4">
        <div class="text-sm">
          <span class="text-gray-500">Training:</span>
          <a-tag :color="getStatusColor(client.trainingStatus)" class="ml-1">
            {{ capitalizeFirst(client.trainingStatus) }}
          </a-tag>
        </div>
        <div class="text-sm">
          <span class="text-gray-500">Diet:</span>
          <a-tag :color="getStatusColor(client.dietStatus)" class="ml-1">
            {{ capitalizeFirst(client.dietStatus) }}
          </a-tag>
        </div>
      </div>

      <!-- Card footer with date and view details -->
      <a-divider />
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-500">
          <calendar-outlined class="mr-1" />
          {{ formatDate(client.createdAt) }}
        </span>
        <a-button
          type="text"
          size="small"
          @click="$emit('view-client', client.id)"
        >
          View Details
          <template #icon><right-outlined /></template>
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script>
import {
  MoreOutlined,
  CalendarOutlined,
  RightOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";

export default {
  name: "ClientCard",
  components: {
    MoreOutlined,
    CalendarOutlined,
    RightOutlined,
    DeleteOutlined,
  },
  props: {
    client: {
      type: Object,
      required: true,
    },
  },
  emits: ["delete-client"],
  computed: {
    avatarStyle() {
      const colors = ["#f56a00", "#7265e6", "#ffbf00", "#00a2ae"];
      // Generate consistent color based on client name
      const index = this.client.name.length % colors.length;
      return { backgroundColor: colors[index] };
    },
  },
  methods: {
    getInitials(name) {
      return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    },
    capitalizeFirst(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    getStatusColor(status) {
      const map = {
        completed: "success",
        active: "processing",
        pending: "warning",
        inactive: "default",
      };
      return map[status.toLowerCase()] || "default";
    },
    handleMenuClick(e) {
      this.$emit("menu-click", { key: e.key, clientId: this.client.id });
    },
  },
};
</script>
