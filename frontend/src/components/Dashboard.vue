<!-- Dashboard.vue -->
<template>
  <div>
    <!-- Welcome section -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">
        Welcome back, {{ userName }}!
      </h1>
      <p class="text-gray-600">
        {{ formattedDate }} — Here's what's happening with your clients today
      </p>
    </div>

    <!-- Quick stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <!-- Active Clients -->
      <div class="bg-white rounded-lg shadow-sm p-5">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">Active Clients</p>
            <h3 class="text-2xl font-bold mt-1">{{ stats.activeClients }}</h3>
          </div>
          <div class="bg-blue-100 rounded-lg p-2 text-blue-700">
            <i class="fas fa-users"></i>
          </div>
        </div>
        <div class="flex items-center mt-3 text-sm">
          <span class="text-green-600 flex items-center">
            <i class="fas fa-arrow-up mr-1"></i> {{ stats.newClientsPercent }}%
          </span>
          <span class="text-gray-500 ml-2">from last month</span>
        </div>
      </div>

      <!-- Active Training Plans -->
      <div class="bg-white rounded-lg shadow-sm p-5">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">Active Training Plans</p>
            <h3 class="text-2xl font-bold mt-1">
              {{ stats.activeTrainingPlans }}
            </h3>
          </div>
          <div class="bg-purple-100 rounded-lg p-2 text-purple-700">
            <i class="fas fa-dumbbell"></i>
          </div>
        </div>
        <div class="flex items-center mt-3 text-sm">
          <span
            class="text-red-600 flex items-center"
            v-if="stats.expiringSoonTraining > 0"
          >
            <i class="fas fa-exclamation-circle mr-1"></i>
            {{ stats.expiringSoonTraining }} expiring soon
          </span>
          <span class="text-gray-500" v-else>All plans up to date</span>
        </div>
      </div>

      <!-- Active Diet Plans -->
      <div class="bg-white rounded-lg shadow-sm p-5">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">Active Diet Plans</p>
            <h3 class="text-2xl font-bold mt-1">{{ stats.activeDietPlans }}</h3>
          </div>
          <div class="bg-teal-100 rounded-lg p-2 text-teal-700">
            <i class="fas fa-utensils"></i>
          </div>
        </div>
        <div class="flex items-center mt-3 text-sm">
          <span
            class="text-red-600 flex items-center"
            v-if="stats.expiringSoonDiet > 0"
          >
            <i class="fas fa-exclamation-circle mr-1"></i>
            {{ stats.expiringSoonDiet }} expiring soon
          </span>
          <span class="text-gray-500" v-else>All plans up to date</span>
        </div>
      </div>

      <!-- Progress Reports -->
      <div class="bg-white rounded-lg shadow-sm p-5">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-gray-500 text-sm">New Progress Reports</p>
            <h3 class="text-2xl font-bold mt-1">
              {{ stats.newProgressReports }}
            </h3>
          </div>
          <div class="bg-orange-100 rounded-lg p-2 text-orange-700">
            <i class="fas fa-chart-line"></i>
          </div>
        </div>
        <div class="flex items-center mt-3 text-sm">
          <span
            class="text-blue-600 flex items-center"
            v-if="stats.newProgressReports > 0"
          >
            <i class="fas fa-eye mr-1"></i> View reports
          </span>
          <span class="text-gray-500" v-else>No new reports</span>
        </div>
      </div>
    </div>

    <!-- Recent activity and quick actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent activity -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-sm p-5">
          <div class="flex justify-between items-center mb-5">
            <h3 class="font-bold text-gray-900">Recent Activity</h3>
            <button class="text-blue-600 text-sm hover:text-blue-800">
              View All
            </button>
          </div>

          <div class="space-y-4">
            <div
              v-for="(activity, index) in recentActivity"
              :key="index"
              class="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
            >
              <div class="flex">
                <div class="mr-4">
                  <div
                    class="h-10 w-10 rounded-full flex items-center justify-center"
                    :class="getActivityIconClass(activity.type)"
                  >
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                </div>
                <div>
                  <p class="text-gray-900">{{ activity.text }}</p>
                  <div class="flex items-center mt-1">
                    <span class="text-gray-500 text-sm">{{
                      activity.time
                    }}</span>
                    <span class="mx-2 text-gray-300">•</span>
                    <button class="text-blue-600 text-sm hover:text-blue-800">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="recentActivity.length === 0"
            class="py-4 text-center text-gray-500"
          >
            No recent activity to display
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-sm p-5">
          <h3 class="font-bold text-gray-900 mb-5">Quick Actions</h3>

          <div class="space-y-3">
            <button
              @click="$router.push('/clients/create')"
              class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <div class="bg-blue-100 rounded p-2 mr-3 text-blue-700">
                <i class="fas fa-user-plus"></i>
              </div>
              <span>Add New Client</span>
            </button>

            <button
              @click="$router.push('/training/upload')"
              class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <div class="bg-purple-100 rounded p-2 mr-3 text-purple-700">
                <i class="fas fa-dumbbell"></i>
              </div>
              <span>Upload Training Plan</span>
            </button>

            <button
              @click="$router.push('/diet/upload')"
              class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <div class="bg-teal-100 rounded p-2 mr-3 text-teal-700">
                <i class="fas fa-utensils"></i>
              </div>
              <span>Upload Diet Plan</span>
            </button>

            <button
              @click="$router.push('/progress/review')"
              class="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <div class="bg-orange-100 rounded p-2 mr-3 text-orange-700">
                <i class="fas fa-chart-line"></i>
              </div>
              <span>Review Progress</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Client reminders -->
    <div class="mt-6">
      <div class="bg-white rounded-lg shadow-sm p-5">
        <div class="flex justify-between items-center mb-5">
          <h3 class="font-bold text-gray-900">Upcoming Reminders</h3>
          <button class="text-blue-600 text-sm hover:text-blue-800">
            View All
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="bg-gray-50">
                <th
                  class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Client
                </th>
                <th
                  class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Due Date
                </th>
                <th
                  class="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(reminder, index) in reminders"
                :key="index"
                class="hover:bg-gray-50"
              >
                <td class="py-4 px-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div
                      class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold"
                    >
                      {{ getInitials(reminder.clientName) }}
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-gray-900">
                        {{ reminder.clientName }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <i
                      :class="[
                        getReminderIcon(reminder.type),
                        'mr-2',
                        getReminderIconColor(reminder.type),
                      ]"
                    ></i>
                    <span class="text-sm text-gray-900">{{
                      reminder.type
                    }}</span>
                  </div>
                </td>
                <td class="py-4 px-4 whitespace-nowrap text-sm text-gray-900">
                  {{ reminder.dueDate }}
                </td>
                <td class="py-4 px-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getReminderStatusClass(reminder.status)"
                  >
                    {{ reminder.status }}
                  </span>
                </td>
                <td class="py-4 px-4 whitespace-nowrap text-sm text-right">
                  <button class="text-blue-600 hover:text-blue-800">
                    {{ reminder.action }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="reminders.length === 0"
          class="py-4 text-center text-gray-500"
        >
          No upcoming reminders
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Dashboard",
  data() {
    return {
      userName: "Carlos",
      stats: {
        activeClients: 12,
        newClientsPercent: 8,
        activeTrainingPlans: 10,
        expiringSoonTraining: 2,
        activeDietPlans: 8,
        expiringSoonDiet: 1,
        newProgressReports: 3,
      },
      recentActivity: [
        {
          type: "training",
          text: "New training plan uploaded for João Silva",
          time: "10 minutes ago",
        },
        {
          type: "diet",
          text: "Diet plan updated for Maria Oliveira",
          time: "2 hours ago",
        },
        {
          type: "client",
          text: "New client Pedro Santos registered",
          time: "Yesterday",
        },
        {
          type: "progress",
          text: "Weekly progress update from Ana Costa",
          time: "Yesterday",
        },
      ],
      reminders: [
        {
          clientName: "João Silva",
          type: "Training Plan",
          dueDate: "Apr 30, 2025",
          status: "Expiring Soon",
          action: "Renew",
        },
        {
          clientName: "Maria Oliveira",
          type: "Diet Plan",
          dueDate: "May 15, 2025",
          status: "Active",
          action: "View",
        },
        {
          clientName: "Pedro Santos",
          type: "Progress Check",
          dueDate: "Apr 25, 2025",
          status: "Due Soon",
          action: "Remind",
        },
      ],
    };
  },
  computed: {
    formattedDate() {
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date().toLocaleDateString("en-US", options);
    },
  },
  methods: {
    getInitials(name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    },
    getActivityIcon(type) {
      const icons = {
        training: "fas fa-dumbbell",
        diet: "fas fa-utensils",
        client: "fas fa-user-plus",
        progress: "fas fa-chart-line",
      };
      return icons[type] || "fas fa-bell";
    },
    getActivityIconClass(type) {
      const classes = {
        training: "bg-purple-100 text-purple-700",
        diet: "bg-teal-100 text-teal-700",
        client: "bg-blue-100 text-blue-700",
        progress: "bg-orange-100 text-orange-700",
      };
      return classes[type] || "bg-gray-100 text-gray-700";
    },
    getReminderIcon(type) {
      if (type.includes("Training")) return "fas fa-dumbbell";
      if (type.includes("Diet")) return "fas fa-utensils";
      if (type.includes("Progress")) return "fas fa-chart-line";
      return "fas fa-bell";
    },
    getReminderIconColor(type) {
      if (type.includes("Training")) return "text-purple-600";
      if (type.includes("Diet")) return "text-teal-600";
      if (type.includes("Progress")) return "text-orange-600";
      return "text-gray-600";
    },
    getReminderStatusClass(status) {
      if (status === "Expiring Soon" || status === "Due Soon")
        return "bg-yellow-100 text-yellow-800";
      if (status === "Active") return "bg-green-100 text-green-800";
      if (status === "Overdue") return "bg-red-100 text-red-800";
      return "bg-gray-100 text-gray-800";
    },
  },
};
</script>
