<!-- MOBILE-FIRST CLIENT CARD COMPONENT -->
<template>
  <a-card
    class="client-card hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden border-0"
  >
    <!-- Card Content Container -->
    <div class="px-4 py-3 sm:px-5 sm:py-4">
      <!-- Client header with simplified layout -->
      <div class="flex items-center justify-between mb-3">
        <!-- Avatar and client info with improved spacing -->
        <div class="flex items-center">
          <a-avatar
            :style="avatarStyle"
            shape="square"
            :size="48"
            class="mr-3 rounded-lg shadow-sm"
          >
            {{ getInitials(client.name) }}
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

        <!-- Action menu condensed into single button on mobile -->
        <div class="flex-shrink-0">
          <a-dropdown placement="bottomRight">
            <template #overlay>
              <a-menu @click="handleMenuClick" class="rounded-lg">
                <a-menu-item key="edit" class="px-4 py-2">
                  <edit-outlined class="mr-2" /> Edit Client
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item
                  key="delete"
                  class="px-4 py-2 text-red-500"
                  @click="showDeleteConfirm(client.id, client.name)"
                >
                  <delete-outlined class="mr-2" /> Delete Client
                </a-menu-item>
              </a-menu>
            </template>
            <a-button
              type="text"
              shape="circle"
              class="flex items-center justify-center"
            >
              <template #icon><more-outlined /></template>
            </a-button>
          </a-dropdown>
        </div>
      </div>

      <!-- Client status layout improved for mobile viewing -->
      <div class="bg-gray-50 rounded-lg p-3 mb-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <div class="text-xs text-gray-500 mb-1">Training Status</div>
            <a-tag
              :color="getStatusColor(client.trainingStatus)"
              class="w-full flex justify-center py-1 rounded-md text-center"
            >
              {{ capitalizeFirst(client.trainingStatus) }}
            </a-tag>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Diet Status</div>
            <a-tag
              :color="getStatusColor(client.dietStatus)"
              class="w-full flex justify-center py-1 rounded-md text-center"
            >
              {{ capitalizeFirst(client.dietStatus) }}
            </a-tag>
          </div>
        </div>
      </div>

      <!-- Card footer with improved layout and touch target size -->
      <div
        class="flex justify-between items-center pt-2 border-t border-gray-100"
      >
        <span class="text-xs text-gray-400 flex items-center">
          <calendar-outlined class="mr-1" />
          {{ formatDate(client.createdAt) }}
        </span>
        <a-button
          type="primary"
          size="small"
          class="rounded-lg shadow-sm h-8 flex items-center"
          @click="$emit('view-client', client.id)"
        >
          View Details
          <right-outlined class="ml-1" />
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script>
import { defineComponent } from "vue";
import { Modal } from "ant-design-vue";
import {
  CalendarOutlined,
  RightOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";

export default defineComponent({
  components: {
    CalendarOutlined,
    RightOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
  },
  props: {
    client: {
      type: Object,
      required: true,
    },
  },
  computed: {
    avatarStyle() {
      return {
        backgroundColor: this.getAvatarColor(this.client.name),
        color: "#ffffff",
      };
    },
  },
  methods: {
    getInitials(name) {
      return name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .substring(0, 2);
    },
    capitalizeFirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    getStatusColor(status) {
      const colors = {
        active: "green",
        pending: "gold",
        inactive: "gray",
        completed: "blue",
        overdue: "red",
      };
      return colors[status.toLowerCase()] || "blue";
    },
    getAvatarColor(name) {
      // Generate consistent color based on name
      const colors = [
        "#1890ff",
        "#52c41a",
        "#faad14",
        "#f5222d",
        "#722ed1",
        "#13c2c2",
        "#eb2f96",
        "#fa8c16",
      ];
      const charCode = name
        .split("")
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return colors[charCode % colors.length];
    },
    handleMenuClick({ key }) {
      if (key === "edit") {
        this.$emit("edit-client", this.client.id);
      }
    },
    showDeleteConfirm(clientId, clientName) {
      // Use Modal.confirm do Ant Design ao invés de this.$confirm
      Modal.confirm({
        title: "Delete Confirmation",
        content: `Are you sure you want to delete ${clientName}?`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: () => {
          this.$emit("delete-client", clientId);
        },
      });
    },
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

/* Modern interactivity enhancements */
.client-card:hover {
  transform: translateY(-4px);
}

/* Accessibility enhancements */
a-button:focus,
a-dropdown:focus {
  outline: 2px solid #1890ff;
  outline-offset: 2px;
}
</style>
