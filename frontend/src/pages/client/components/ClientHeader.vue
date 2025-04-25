<template>
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Clients</h1>
      <p class="text-gray-600">Manage your client list</p>
    </div>
    <a-button type="primary" @click="$emit('add-client')">
      <template #icon><PlusOutlined /></template>
      Add Client
    </a-button>
  </div>
</template>

<script>
import { PlusOutlined } from "@ant-design/icons-vue";

export default {
  name: "ClientHeader",
  components: {
    PlusOutlined,
  },
  emits: ["add-client"],
};
</script>
