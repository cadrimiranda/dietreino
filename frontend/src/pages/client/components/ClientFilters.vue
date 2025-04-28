<template>
  <a-card class="mb-6">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <a-input-search
          v-model:value="searchModel"
          placeholder="Search clients..."
          class="w-full"
        />
      </div>
      <div class="flex items-center space-x-2">
        <a-select
          v-model:value="statusModel"
          :options="statusOptions"
          placeholder="Select Status"
          class="w-full md:w-auto"
          style="min-width: 150px"
        />
        <a-button class="p-button-text p-button-secondary" aria-label="Filter">
          <template #icon><SlidersOutlined /></template>
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { SlidersOutlined } from "@ant-design/icons-vue";

interface StatusOption {
  label: string;
  value: string;
}

export default defineComponent({
  name: "ClientFilters",
  components: {
    SlidersOutlined,
  },
  props: {
    searchQuery: {
      type: String,
      default: "",
    },
    filterStatus: {
      type: String,
      default: "all",
    },
  },
  emits: ["update:searchQuery", "update:filterStatus"],
  setup(props, { emit }) {
    const searchModel = computed({
      get: () => props.searchQuery,
      set: (value: string) => emit("update:searchQuery", value),
    });

    const statusModel = computed({
      get: () => props.filterStatus,
      set: (value: string) => emit("update:filterStatus", value),
    });

    const statusOptions = computed<StatusOption[]>(() => [
      { label: "All Statuses", value: "all" },
      { label: "Active", value: "active" },
      { label: "Pending", value: "pending" },
      { label: "Expired", value: "expired" },
    ]);

    return {
      searchModel,
      statusModel,
      statusOptions,
    };
  },
});
</script>
