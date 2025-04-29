<template>
  <div class="overflow-hidden rounded-xl border-0 transition-all duration-300">
    <a-table
      :dataSource="clients"
      :columns="columns"
      :pagination="{
        pageSize: 10,
        pageSizeOptions: ['5', '10', '20', '50'],
        showSizeChanger: true,
      }"
      :rowKey="(record: IClientData) => record.id"
      size="small"
      :rowClassName="() => 'hover:bg-gray-50 transition-colors duration-200'"
      class="rounded-xl overflow-hidden border-0 shadow-sm"
    >
      <template #headerCell="{ column }">
        <template v-if="column.key === 'name'">
          <div>
            <span class="font-semibold">Client Name</span>
          </div>
        </template>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <div class="flex items-center py-2">
            <a-avatar
              :style="formatters.getAvatarStyle(record.name)"
              shape="square"
              :size="40"
              class="mr-3 rounded-lg shadow-sm"
            >
              {{ formatters.getInitials(record.name) }}
            </a-avatar>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-base truncate">{{ record.name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ record.email }}</p>
            </div>
          </div>
        </template>

        <template v-if="column.key === 'trainingStatus'">
          <a-tag
            :color="formatters.getStatusColor(record.trainingStatus)"
            class="flex justify-center py-1 rounded-md text-center"
          >
            {{ formatters.capitalizeFirst(record.trainingStatus) }}
          </a-tag>
        </template>

        <template v-if="column.key === 'dietStatus'">
          <a-tag
            :color="formatters.getStatusColor(record.dietStatus)"
            class="flex justify-center py-1 rounded-md text-center"
          >
            {{ formatters.capitalizeFirst(record.dietStatus) }}
          </a-tag>
        </template>

        <template v-if="column.key === 'createdAt'">
          <span class="text-xs text-gray-500 flex items-center">
            <calendar-outlined class="mr-1" />
            {{ formatters.formatDate(record.createdAt) }}
          </span>
        </template>

        <template v-if="column.key === 'actions'">
          <div class="flex justify-end gap-2">
            <a-button
              type="primary"
              size="small"
              class="rounded-lg shadow-sm h-8 flex items-center"
              @click="$emit('view-client', record.id)"
            >
              View
              <right-outlined class="ml-1" />
            </a-button>
            <ClientActionsDropdown
              :clientId="record.id"
              :clientName="record.name"
              @edit-client="$emit('edit-client', $event)"
              @delete-client="handleClientDelete($event)"
            />
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import { notification } from "ant-design-vue";
import { CalendarOutlined, RightOutlined } from "@ant-design/icons-vue";
import { formatters, statusFilters, Client } from "./clientUtils";
import ClientActionsDropdown from "./ClientActionsDropdown.vue";
import { IClientData } from "./types";

export default defineComponent({
  components: {
    CalendarOutlined,
    RightOutlined,
    ClientActionsDropdown,
  },
  props: {
    clients: {
      type: Array as PropType<Client[]>,
      required: true,
    },
  },
  emits: ["view-client", "edit-client", "delete-client"],
  setup(props, { emit }) {
    const columns = [
      {
        title: "Client Name",
        dataIndex: "name",
        key: "name",
        sorter: (a: Client, b: Client) => a.name.localeCompare(b.name),
      },
      {
        title: "Training",
        dataIndex: "trainingStatus",
        key: "trainingStatus",
        sorter: (a: Client, b: Client) =>
          a.trainingStatus.localeCompare(b.trainingStatus),
        filters: statusFilters,
        onFilter: (value: string, record: Client) =>
          record.trainingStatus === value,
      },
      {
        title: "Diet",
        dataIndex: "dietStatus",
        key: "dietStatus",
        sorter: (a: Client, b: Client) =>
          a.dietStatus.localeCompare(b.dietStatus),
        filters: statusFilters,
        onFilter: (value: string, record: Client) =>
          record.dietStatus === value,
      },
      {
        title: "Date Added",
        dataIndex: "createdAt",
        key: "createdAt",
        sorter: (a: Client, b: Client) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      },
      {
        title: "Actions",
        key: "actions",
      },
    ];

    const handleClientDelete = (clientId: number | string) => {
      emit("delete-client", clientId);
      notification.success({
        message: "Success",
        description: "Client deleted successfully",
        duration: 3,
      });
    };

    return {
      columns,
      formatters,
      handleClientDelete,
    };
  },
});
</script>

<style scoped>
a-button:focus,
a-dropdown:focus {
  outline: 2px solid #1890ff;
  outline-offset: 2px;
}

:deep(.ant-table) {
  border-radius: 12px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #f5f7fa;
  padding: 12px 16px;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
}

:deep(.ant-table-row:hover) {
  transform: translateY(-2px);
  transition: transform 0.3s ease;
}
</style>
