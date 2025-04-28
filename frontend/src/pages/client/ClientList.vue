// components/ClientList.vue
<template>
  <div class="p-4">
    <!-- Page header -->
    <ClientHeader @add-client="showAddClientModal = true" />

    <!-- Search and filters -->
    <ClientFilters
      v-model:searchQuery="searchQuery"
      v-model:filterStatus="filterStatus"
    />

    <!-- View Toggler -->
    <div
      class="mb-4 flex justify-end gap-2"
      v-if="!loading && !error && filteredClients.length > 0"
    >
      <a-button
        :type="viewMode === 'table' ? 'primary' : 'default'"
        @click="handleViewModeChange('table')"
        class="flex items-center"
      >
        <template #icon><table-outlined /></template>
        Table View
      </a-button>
      <a-button
        :type="viewMode === 'grid' ? 'primary' : 'default'"
        @click="handleViewModeChange('grid')"
        class="flex items-center"
      >
        <template #icon><appstore-outlined /></template>
        Grid View
      </a-button>
    </div>

    <!-- Client list with loading, error and empty states -->
    <div v-if="loading">
      <ClientSkeletonList :count="6" />
    </div>
    <div v-else-if="error" class="mt-4">
      <ClientErrorState :error="error" @retry="refetch" />
    </div>
    <div v-else-if="filteredClients.length === 0" class="mt-4">
      <ClientEmptyState
        :has-search-query="!!searchQuery"
        @add-client="showAddClientModal = true"
      />
    </div>
    <div v-else class="mt-4">
      <!-- Grid View -->
      <ClientCardGrid
        v-if="viewMode"
        :clients="filteredClients"
        @view-client="viewClient"
        @delete-client="deleteClient"
      />

      <!-- Table View -->
      <ClientDataTable
        v-else
        :clients="filteredClients"
        @view-client="viewClient"
        @delete-client="deleteClient"
      />
    </div>

    <!-- Add Client Modal -->
    <AddClientDialog
      v-model:visible="showAddClientModal"
      v-model:is-adding="isAddingClient"
      @client-added="handleClientAdded"
    />

    <!-- Password Reveal Dialog -->
    <PasswordRevealDialog
      v-if="usuarioCriado"
      :visible="usuarioCriado"
      :password="temporaryPassword"
      :username="newlyCreatedUsername"
      @close="usuarioCriado = false"
    />

    <!-- Global Toast -->
    <Toast position="top-right" />

    <!-- Global Confirm Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script lang="ts">
import { ref, computed, watch, defineComponent } from "vue";

// Import components
import ClientHeader from "@/pages/client/components/ClientHeader.vue";
import ClientFilters from "@/pages/client/components/ClientFilters.vue";
import ClientSkeletonList from "@/pages/client/components/ClientSkeletonList.vue";
import ClientErrorState from "@/pages/client/components/ClientErrorState.vue";
import ClientEmptyState from "@/pages/client/components/ClientEmptyState.vue";
import ClientCardGrid from "@/pages/client/components/ClientCardGrid.vue";
import ClientDataTable from "@/pages/client/components/ClientDataTable.vue";
import AddClientDialog from "@/pages/client/components/AddClientDialog.vue";
import PasswordRevealDialog from "@/pages/client/components/PasswordRevealDialog.vue";
import ClientStats from "@/pages/client/components/ClientStats.vue";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import { useToast } from "primevue/usetoast";

import { TableOutlined, AppstoreOutlined } from "@ant-design/icons-vue";
import { useUsers } from "@/composables/useUsers";

// Define interfaces
interface Client {
  id: number | string;
  name: string;
  email: string;
  password?: string;
  trainingStatus: string;
  dietStatus: string;
  createdAt: Date;
  phone?: string;
}

interface User {
  id: number | string;
  name: string;
  email: string;
  generatedPassword?: string;
  createdAt: string;
  updatedAt?: string;
  phone?: string;
}

interface CreatedUser extends User {
  generatedPassword: string;
}

export default defineComponent({
  name: "ClientList",
  components: {
    ClientHeader,
    ClientFilters,
    ClientSkeletonList,
    ClientErrorState,
    ClientEmptyState,
    ClientCardGrid,
    ClientDataTable,
    AddClientDialog,
    PasswordRevealDialog,
    ClientStats,
    Toast,
    ConfirmDialog,
    TableOutlined,
    AppstoreOutlined,
  },
  setup() {
    const searchQuery = ref<string>("");
    const filterStatus = ref<string>("all");
    const showAddClientModal = ref<boolean>(false);
    const usuarioCriado = ref<boolean>(false);
    const temporaryPassword = ref<string>("");
    const newlyCreatedUsername = ref<string>("");
    const viewMode = ref<boolean>(true); // true = grid, false = table
    const toast = useToast();

    // Use our composable
    const {
      users,
      loading,
      error,
      refetch,
      addUser,
      deleteUser,
      createLoading: isAddingClient,
    } = useUsers();

    // Clients computed property
    const clients = computed<Client[]>(() => {
      return users.value.map((user: User) => ({
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
        phone: user.phone,
      }));
    });

    // Filtered clients based on search and filter
    const filteredClients = computed<Client[]>(() => {
      let result = clients.value;

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (client) =>
            client.name.toLowerCase().includes(query) ||
            client.email.toLowerCase().includes(query)
        );
      }

      if (filterStatus.value !== "all") {
        result = result.filter(
          (client) =>
            client.trainingStatus === filterStatus.value ||
            client.dietStatus === filterStatus.value
        );
      }

      return result;
    });

    function viewClient(id: number | string): void {
      console.log(`Navegando para o cliente ${id}`);
      // this.$router.push(`/clients/${id}`);
    }

    function handleViewModeChange(mode: "grid" | "table"): void {
      viewMode.value = mode === "grid";
    }

    async function handleClientAdded(newClient: User): Promise<void> {
      try {
        const createdUser = (await addUser(newClient)) as CreatedUser;

        usuarioCriado.value = true;
        temporaryPassword.value = createdUser.generatedPassword;
        newlyCreatedUsername.value = createdUser.name;

        showAddClientModal.value = false;

        // Refresh client list
        refetch();

        // Show success toast
        toast.add({
          severity: "success",
          summary: "Client Added",
          detail: "New client has been successfully added.",
          life: 3000,
        });
      } catch (error) {
        console.error("Error adding client:", error);

        // Show error toast
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to create client. Please try again.",
          life: 3000,
        });
      }
    }

    function deleteClient(id: number | string): void {
      console.log(id);
    }

    // Watch for search query and filter changes to save to localStorage
    watch([searchQuery, filterStatus], ([newSearchQuery, newFilterStatus]) => {
      localStorage.setItem("clientSearchQuery", newSearchQuery);
      localStorage.setItem("clientFilterStatus", newFilterStatus);
    });

    // Watch for view mode changes to save to localStorage
    watch(viewMode, (newViewMode) => {
      localStorage.setItem("clientViewMode", newViewMode ? "grid" : "table");
    });

    // Load saved preferences from localStorage
    function loadSavedPreferences(): void {
      const savedSearchQuery = localStorage.getItem("clientSearchQuery");
      const savedFilterStatus = localStorage.getItem("clientFilterStatus");
      const savedViewMode = localStorage.getItem("clientViewMode");

      if (savedSearchQuery) {
        searchQuery.value = savedSearchQuery;
      }

      if (savedFilterStatus) {
        filterStatus.value = savedFilterStatus;
      }

      if (savedViewMode) {
        viewMode.value = savedViewMode === "grid";
      }
    }

    // Call once when component is mounted
    loadSavedPreferences();

    return {
      searchQuery,
      filterStatus,
      showAddClientModal,
      isAddingClient,
      usuarioCriado,
      temporaryPassword,
      newlyCreatedUsername,
      loading,
      error,
      clients,
      filteredClients,
      viewMode,
      viewClient,
      handleViewModeChange,
      handleClientAdded,
      deleteClient,
      refetch,
    };
  },
});
</script>

<style scoped>
.p-togglebutton.p-button {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
}

.p-togglebutton.p-button.p-highlight {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #ffffff;
}

.p-togglebutton.p-button.p-highlight:hover {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}
</style>
