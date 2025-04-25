<template>
  <div class="mb-6">
    <a-card>
      <template #title>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800">Client Overview</h2>
          <a-button type="text" aria-label="Refresh" @click="$emit('refresh')">
            <template #icon><SyncOutlined /></template>
          </a-button>
        </div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="bg-white p-4 rounded-lg shadow-sm border-l-4"
          :class="`border-${stat.color}-500`"
        >
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-500">{{ stat.label }}</p>
              <h3 class="text-2xl font-bold mt-1">{{ stat.value }}</h3>
            </div>
            <div :class="`bg-${stat.color}-100 p-2 rounded-full`">
              <component
                :is="stat.icon"
                :class="`text-${stat.color}-500 text-xl`"
              />
            </div>
          </div>
          <p
            class="text-xs mt-2"
            :class="`text-${stat.trend === 'up' ? 'green' : 'red'}-600`"
          >
            <component
              :is="
                stat.trend === 'up' ? 'ArrowUpOutlined' : 'ArrowDownOutlined'
              "
            />
            {{ stat.percentage }}% desde o mês passado
          </p>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script>
import {
  SyncOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons-vue";

export default {
  name: "ClientStats",
  components: {
    SyncOutlined,
    UserOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
  },
  props: {
    clients: {
      type: Array,
      required: true,
    },
  },
  emits: ["refresh"],
  computed: {
    stats() {
      const totalClients = this.clients.length;
      const activeClients = this.clients.filter(
        (client) =>
          client.trainingStatus === "active" || client.dietStatus === "active"
      ).length;
      const pendingClients = this.clients.filter(
        (client) =>
          client.trainingStatus === "pending" || client.dietStatus === "pending"
      ).length;
      const expiredClients = this.clients.filter(
        (client) =>
          client.trainingStatus === "expired" && client.dietStatus === "expired"
      ).length;

      return [
        {
          label: "Total Clients",
          value: totalClients,
          icon: "UserOutlined",
          color: "blue",
          percentage: 12,
          trend: "up",
        },
        {
          label: "Active Plans",
          value: activeClients,
          icon: "CheckCircleOutlined",
          color: "green",
          percentage: 8,
          trend: "up",
        },
        {
          label: "Pending Clients",
          value: pendingClients,
          icon: "ClockCircleOutlined",
          color: "yellow",
          percentage: 5,
          trend: "up",
        },
        {
          label: "Expired Plans",
          value: expiredClients,
          icon: "ExclamationCircleOutlined",
          color: "red",
          percentage: 3,
          trend: "down",
        },
      ];
    },
  },
};
</script>
