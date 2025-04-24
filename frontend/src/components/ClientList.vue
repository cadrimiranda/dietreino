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

    <!-- Client list (atualizado para usar a composable API e mostrar o estado de carregamento) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <!-- Estado de carregamento -->
      <template v-if="loading">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
        >
          <div class="p-5">
            <div class="flex items-start justify-between">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                <div>
                  <div class="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <div class="h-3 bg-gray-200 rounded"></div>
              <div class="h-3 bg-gray-200 rounded"></div>
            </div>
            <div class="mt-4 pt-3 border-t flex justify-between">
              <div class="h-3 bg-gray-200 rounded w-20"></div>
              <div class="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- Estado de erro -->
      <div
        v-else-if="error"
        class="col-span-3 bg-red-50 rounded-lg p-6 text-center"
      >
        <div
          class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
        >
          <i class="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
        </div>
        <h3 class="text-lg font-medium text-red-900">
          Erro ao carregar clientes
        </h3>
        <p class="mt-2 text-red-600">{{ error.message }}</p>
        <button
          @click="refetch"
          class="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
        >
          <i class="fas fa-sync-alt mr-2"></i>
          <span>Tentar novamente</span>
        </button>
      </div>

      <!-- Lista de clientes -->
      <div
        v-else
        v-for="client in filteredClients"
        :key="client.id"
        class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow transform hover:-translate-y-1 duration-200"
      >
        <div class="p-5">
          <div class="flex items-start justify-between">
            <div class="flex items-center">
              <div
                class="h-10 w-10 rounded-full flex items-center justify-center mr-3 text-white font-semibold"
                :style="`background-color: hsl(${
                  (client.id * 137.5) % 360
                }, 70%, 50%)`"
              >
                {{ getInitials(client.name) }}
              </div>
              <div>
                <h3 class="font-semibold text-lg">{{ client.name }}</h3>
                <p class="text-gray-500 text-sm">{{ client.email }}</p>
              </div>
            </div>
            <div class="flex space-x-1">
              <div class="relative group">
                <button
                  class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <div
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block"
                >
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i class="far fa-edit mr-2"></i> Editar
                  </a>
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <i class="far fa-envelope mr-2"></i> Enviar mensagem
                  </a>
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <i class="far fa-trash-alt mr-2"></i> Excluir
                  </a>
                </div>
              </div>
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
                class="ml-1 px-2 py-1 rounded-full text-xs"
                :style="{
                  backgroundColor:
                    client.trainingStatus === 'active'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : client.trainingStatus === 'pending'
                      ? 'rgba(245, 158, 11, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
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
                class="ml-1 px-2 py-1 rounded-full text-xs"
                :style="{
                  backgroundColor:
                    client.dietStatus === 'active'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : client.dietStatus === 'pending'
                      ? 'rgba(245, 158, 11, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                }"
              >
                {{
                  client.dietStatus.charAt(0).toUpperCase() +
                  client.dietStatus.slice(1)
                }}
              </span>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t flex justify-between items-center">
            <span class="text-xs text-gray-500">
              <i class="far fa-calendar mr-1"></i>
              {{ formatDate(client.createdAt) }}
            </span>
            <button
              @click="viewClient(client.id)"
              class="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center group"
            >
              <span>View Details</span>
              <i
                class="fas fa-chevron-right ml-1 transform group-hover:translate-x-1 transition-transform"
              ></i>
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
import gql from "graphql-tag";

const GET_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      generatedPassword
      createdAt
      updatedAt
    }
  }
`;

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
      loading: true,
      error: null,
      users: [],
    };
  },
  apollo: {
    users: {
      query: GET_USERS_QUERY,
      update: (data) => data.users,
      result({ data, loading, error }) {
        this.loading = loading;
        if (error) {
          this.error = error;
        }
      },
      error(error) {
        this.error = error;
      },
    },
  },
  computed: {
    clients() {
      return this.users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.generatedPassword,
        trainingStatus:
          Math.random() > 0.5
            ? "active"
            : Math.random() > 0.5
            ? "pending"
            : "expired",
        dietStatus:
          Math.random() > 0.5
            ? "active"
            : Math.random() > 0.5
            ? "pending"
            : "expired",
        createdAt: new Date(user.createdAt),
        phone: `+55 47 ${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
          1000 + Math.random() * 9000
        )}`,
      }));
    },
    filteredClients() {
      let result = this.clients;

      // Aplicar filtro de pesquisa
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(
          (client) =>
            client.name.toLowerCase().includes(query) ||
            client.email.toLowerCase().includes(query)
        );
      }

      // Aplicar filtro de status
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
      console.log(date);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    },
    viewClient(id) {
      // Roteamento (assumindo que você está usando o Vue Router)
      // this.$router.push(`/clients/${id}`);
      console.log(`Navegando para o cliente ${id}`);
    },
    addClient() {
      // Simulação para este exemplo
      setTimeout(() => {
        this.$apollo.queries.users.refetch();
        this.newClient = { name: "", email: "", phone: "" };
        this.showAddClientModal = false;
        alert("Cliente adicionado com sucesso!");
      }, 500);
    },
    refetchClients() {
      this.$apollo.queries.users.refetch();
    },
  },
};
</script>
