<!-- ClientList.vue -->
<template>
  <div>
    <!-- Page header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Clients</h1>
        <p class="text-gray-600">Manage your client list</p>
      </div>
      <button
        @click="showAddClientModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <i class="fas fa-plus mr-2"></i>
        <span>Add Client</span>
      </button>
    </div>

    <!-- Search and filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <i class="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search clients..."
              class="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <select
            v-model="filterStatus"
            class="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button class="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg">
            <i class="fas fa-sliders-h"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Client list -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="client in filteredClients"
        :key="client.id"
        class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="p-5">
          <div class="flex items-start justify-between">
            <div class="flex items-center">
              <div
                class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-700 font-semibold"
              >
                {{ getInitials(client.name) }}
              </div>
              <div>
                <h3 class="font-semibold text-lg">{{ client.name }}</h3>
                <p class="text-gray-500 text-sm">{{ client.email }}</p>
              </div>
            </div>
            <div class="flex space-x-1">
              <button class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-ellipsis-v"></i>
              </button>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-2">
            <div class="text-sm">
              <span class="text-gray-500">Training:</span>
              <span
                :class="{
                  'text-green-600': client.trainingStatus === 'active',
                  'text-yellow-600': client.trainingStatus === 'pending',
                  'text-red-600': client.trainingStatus === 'expired',
                }"
              >
                {{
                  client.trainingStatus.charAt(0).toUpperCase() +
                  client.trainingStatus.slice(1)
                }}
              </span>
            </div>
            <div class="text-sm">
              <span class="text-gray-500">Diet:</span>
              <span
                :class="{
                  'text-green-600': client.dietStatus === 'active',
                  'text-yellow-600': client.dietStatus === 'pending',
                  'text-red-600': client.dietStatus === 'expired',
                }"
              >
                {{
                  client.dietStatus.charAt(0).toUpperCase() +
                  client.dietStatus.slice(1)
                }}
              </span>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t flex justify-between">
            <span class="text-xs text-gray-500">
              <i class="far fa-calendar mr-1"></i> Added
              {{ formatDate(client.createdAt) }}
            </span>
            <button
              @click="viewClient(client.id)"
              class="text-blue-600 hover:text-blue-800 text-sm font-semibold"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="filteredClients.length === 0"
      class="bg-white rounded-lg p-8 text-center"
    >
      <div
        class="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4"
      >
        <i class="fas fa-users text-gray-400 text-2xl"></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900">No clients found</h3>
      <p class="mt-2 text-gray-500">
        {{
          searchQuery
            ? "Try adjusting your search or filters"
            : "Get started by adding your first client"
        }}
      </p>
      <button
        v-if="!searchQuery"
        @click="showAddClientModal = true"
        class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
      >
        <i class="fas fa-plus mr-2"></i>
        <span>Add Client</span>
      </button>
    </div>

    <!-- Add Client Modal (placeholder) -->
    <div
      v-if="showAddClientModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Add New Client</h2>
          <button
            @click="showAddClientModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="addClient">
          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="name"
            >
              Full Name
            </label>
            <input
              id="name"
              v-model="newClient.name"
              type="text"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>

          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="email"
            >
              Email
            </label>
            <input
              id="email"
              v-model="newClient.email"
              type="email"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
              required
            />
          </div>

          <div class="mb-4">
            <label
              class="block text-gray-700 text-sm font-bold mb-2"
              for="phone"
            >
              Phone
            </label>
            <input
              id="phone"
              v-model="newClient.phone"
              type="tel"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1 (123) 456-7890"
            />
          </div>

          <div class="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              @click="showAddClientModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClientList",
  data() {
    return {
      searchQuery: "",
      filterStatus: "all",
      showAddClientModal: false,
      newClient: {
        name: "",
        email: "",
        phone: "",
      },
      clients: [
        {
          id: 1,
          name: "João Silva",
          email: "joao.silva@example.com",
          phone: "+55 47 9999-9999",
          trainingStatus: "active",
          dietStatus: "active",
          createdAt: new Date(2023, 1, 15),
        },
        {
          id: 2,
          name: "Maria Oliveira",
          email: "maria.oliveira@example.com",
          phone: "+55 47 8888-8888",
          trainingStatus: "expired",
          dietStatus: "pending",
          createdAt: new Date(2023, 3, 22),
        },
        {
          id: 3,
          name: "Pedro Santos",
          email: "pedro.santos@example.com",
          phone: "+55 47 7777-7777",
          trainingStatus: "pending",
          dietStatus: "expired",
          createdAt: new Date(2023, 5, 10),
        },
      ],
    };
  },
  computed: {
    filteredClients() {
      let result = this.clients;

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(
          (client) =>
            client.name.toLowerCase().includes(query) ||
            client.email.toLowerCase().includes(query)
        );
      }

      // Apply status filter
      if (this.filterStatus !== "all") {
        result = result.filter(
          (client) =>
            client.trainingStatus === this.filterStatus ||
            client.dietStatus === this.filterStatus
        );
      }

      return result;
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
    formatDate(date) {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    },
    viewClient(id) {
      this.$router.push(`/clients/${id}`);
    },
    addClient() {
      // Generate a new ID (in a real app, this would come from the backend)
      const newId = Math.max(...this.clients.map((c) => c.id)) + 1;

      // Create new client object
      const client = {
        id: newId,
        name: this.newClient.name,
        email: this.newClient.email,
        phone: this.newClient.phone,
        trainingStatus: "pending",
        dietStatus: "pending",
        createdAt: new Date(),
      };

      // Add to clients array (in a real app, this would be an API call)
      this.clients.push(client);

      // Reset form and close modal
      this.newClient = { name: "", email: "", phone: "" };
      this.showAddClientModal = false;

      // Show success notification (you'd implement this)
      alert("Client added successfully!");
    },
  },
};
</script>
