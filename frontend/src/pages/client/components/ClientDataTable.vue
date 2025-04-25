<template>
  <a-table
    :dataSource="clients"
    :columns="columns"
    :pagination="{
      pageSize: 10,
      pageSizeOptions: ['5', '10', '20', '50'],
      showSizeChanger: true,
    }"
    :rowKey="(record) => record.id"
    size="small"
    :striped="true"
  >
    <template #headerCell="{ column }">
      <template v-if="column.key === 'name'">
        <div>
          <span>Client Name</span>
        </div>
      </template>
    </template>

    <template #bodyCell="{ column, record }">
      <!-- Client Name Column -->
      <template v-if="column.key === 'name'">
        <div class="flex items-center">
          <a-avatar
            :style="getAvatarStyle(record.id)"
            shape="circle"
            class="mr-2"
          >
            {{ getInitials(record.name) }}
          </a-avatar>
          <div>
            <p class="font-medium">{{ record.name }}</p>
            <p class="text-xs text-gray-500">{{ record.email }}</p>
          </div>
        </div>
      </template>

      <!-- Training Status Column -->
      <template v-if="column.key === 'trainingStatus'">
        <a-tag :color="getStatusColor(record.trainingStatus)">
          {{ capitalizeFirst(record.trainingStatus) }}
        </a-tag>
      </template>

      <!-- Diet Status Column -->
      <template v-if="column.key === 'dietStatus'">
        <a-tag :color="getStatusColor(record.dietStatus)">
          {{ capitalizeFirst(record.dietStatus) }}
        </a-tag>
      </template>

      <!-- Date Added Column -->
      <template v-if="column.key === 'createdAt'">
        <span>{{ formatDate(record.createdAt) }}</span>
      </template>

      <!-- Actions Column -->
      <template v-if="column.key === 'actions'">
        <div class="flex justify-center gap-2">
          <a-tooltip title="View Details">
            <a-button
              shape="circle"
              size="small"
              @click="$emit('view-client', record.id)"
            >
              <template #icon><eye-outlined /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip title="Edit Client">
            <a-button shape="circle" type="primary" ghost size="small">
              <template #icon><edit-outlined /></template>
            </a-button>
          </a-tooltip>
          <a-tooltip title="Delete Client">
            <a-button
              shape="circle"
              danger
              ghost
              size="small"
              @click="confirmDeleteClient(record.id)"
            >
              <template #icon><delete-outlined /></template>
            </a-button>
          </a-tooltip>
        </div>
      </template>
    </template>
  </a-table>

  <!-- Modal for delete confirmation -->
  <a-modal
    v-model:visible="deleteModalVisible"
    title="Confirm Deletion"
    okText="Delete"
    cancelText="Cancel"
    :okButtonProps="{ danger: true }"
    @ok="handleDelete"
  >
    <p>Are you sure you want to delete this client?</p>
  </a-modal>
</template>

<script>
import { ref, reactive } from "vue";
import { notification } from "ant-design-vue";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons-vue";

export default {
  name: "ClientDataTable",
  components: {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
  },
  props: {
    clients: {
      type: Array,
      required: true,
    },
  },
  emits: ["view-client", "delete-client"],
  setup(props, { emit }) {
    const deleteModalVisible = ref(false);
    const clientIdToDelete = ref(null);
    const searchText = ref("");
    const searchedColumn = ref("");

    // Filter states for each column
    const nameFilter = ref("");
    const trainingStatusFilter = ref(null);
    const dietStatusFilter = ref(null);

    const statusOptions = [
      { text: "Active", value: "active" },
      { text: "Pending", value: "pending" },
      { text: "Expired", value: "expired" },
    ];

    const columns = reactive([
      {
        title: "Client Name",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        filteredValue: nameFilter.value ? [nameFilter.value] : null,
        onFilter: (value, record) =>
          record.name.toLowerCase().includes(value.toLowerCase()),
      },
      {
        title: "Training",
        dataIndex: "trainingStatus",
        key: "trainingStatus",
        sorter: (a, b) => a.trainingStatus.localeCompare(b.trainingStatus),
        filters: statusOptions,
        onFilter: (value, record) => record.trainingStatus === value,
      },
      {
        title: "Diet",
        dataIndex: "dietStatus",
        key: "dietStatus",
        sorter: (a, b) => a.dietStatus.localeCompare(b.dietStatus),
        filters: statusOptions,
        onFilter: (value, record) => record.dietStatus === value,
      },
      {
        title: "Date Added",
        dataIndex: "createdAt",
        key: "createdAt",
        sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      },
      {
        title: "Actions",
        key: "actions",
      },
    ]);

    function getInitials(name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }

    function getAvatarStyle(id) {
      return {
        backgroundColor: `hsl(${(id * 137.5) % 360}, 70%, 50%)`,
        color: "white",
      };
    }

    function formatDate(date) {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    }

    function capitalizeFirst(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getStatusColor(status) {
      switch (status) {
        case "active":
          return "success";
        case "pending":
          return "warning";
        case "expired":
          return "error";
        default:
          return "default";
      }
    }

    function confirmDeleteClient(id) {
      clientIdToDelete.value = id;
      deleteModalVisible.value = true;
    }

    function handleDelete() {
      emit("delete-client", clientIdToDelete.value);
      notification.success({
        message: "Success",
        description: "Client deleted successfully",
        duration: 3,
      });
      deleteModalVisible.value = false;
    }

    return {
      columns,
      getInitials,
      getAvatarStyle,
      formatDate,
      capitalizeFirst,
      getStatusColor,
      confirmDeleteClient,
      deleteModalVisible,
      handleDelete,
      searchText,
      searchedColumn,
      nameFilter,
      trainingStatusFilter,
      dietStatusFilter,
      statusOptions,
    };
  },
};
</script>
