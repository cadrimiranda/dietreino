// components/ClientList.vue
<template>
  <div class="p-4">
    <!-- Page header -->
    <ClientHeader @add-client="showAddClientDialog" />

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
        @add-client="showAddClientDialog"
      />
    </div>
    <div v-else class="mt-4">
      <ClientCardGrid
        v-if="viewMode === 'grid'"
        :clients="filteredClients"
        @view-client="viewClient"
        @delete-client="deleteClient"
        @edit-client="showEditClientDialog"
      />

      <ClientDataTable
        v-else
        :clients="filteredClients"
        @view-client="viewClient"
        @delete-client="deleteClient"
      />
    </div>

    <ClientDialog
      v-model:visible="clientDialogVisible"
      v-model:is-processing="isUpsertingClient"
      :is-editing="clientToEdit !== null"
      :client-to-edit="clientToEdit"
      @client-saved="upsertClient"
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
import { ref, computed, watch, defineComponent, onMounted } from "vue";

// Import components
import ClientHeader from "@/pages/client/components/ClientHeader.vue";
import ClientFilters from "@/pages/client/components/ClientFilters.vue";
import ClientSkeletonList from "@/pages/client/components/ClientSkeletonList.vue";
import ClientErrorState from "@/pages/client/components/ClientErrorState.vue";
import ClientEmptyState from "@/pages/client/components/ClientEmptyState.vue";
import ClientCardGrid from "@/pages/client/components/ClientCardGrid.vue";
import ClientDataTable from "@/pages/client/components/ClientDataTable.vue";
import ClientDialog from "@/pages/client/components/ClientDialog.vue";
import PasswordRevealDialog from "@/pages/client/components/PasswordRevealDialog.vue";
import ClientStats from "@/pages/client/components/ClientStats.vue";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import { useToast } from "primevue/usetoast";

import { TableOutlined, AppstoreOutlined } from "@ant-design/icons-vue";
import { IUserEntity, useUsers } from "@/composables/useUsers";
import { IClientData } from "./components/types";
import { useRouter } from "vue-router";

interface UserInput {
  id: string | null;
  name: string;
  email: string;
  phone?: string;
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
    ClientDialog,
    PasswordRevealDialog,
    ClientStats,
    Toast,
    ConfirmDialog,
    TableOutlined,
    AppstoreOutlined,
  },
  setup() {
    const clientDialogVisible = ref(false);
    const clientToEdit = ref<IUserEntity | null>(null);

    const searchQuery = ref<string>("");
    const filterStatus = ref<string>("all");
    const usuarioCriado = ref<boolean>(false);
    const temporaryPassword = ref<string>("");
    const newlyCreatedUsername = ref<string>("");
    const viewMode = ref<"grid" | "table">("grid");
    const toast = useToast();
    const router = useRouter();

    // Use our composable
    const {
      users,
      loading,
      error,
      refetch,
      upsertUser,
      deleteUser,
      createLoading: isUpsertingClient,
      resetState,
    } = useUsers({});

    onMounted(() => {
      resetState();
    });

    const generateStatus = () =>
      Math.random() > 0.5
        ? "ativo"
        : Math.random() > 0.5
        ? "inativo"
        : "expirado";

    const clients = computed<IClientData[]>(() =>
      users.value.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.generatedPassword,
        phone: user.phone,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        trainingStatus: generateStatus(),
        dietStatus: generateStatus(),
      }))
    );

    const filteredClients = computed<IClientData[]>(() => {
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

    function handleViewModeChange(mode: "grid" | "table"): void {
      viewMode.value = mode;
    }

    const showAddClientDialog = () => {
      clientToEdit.value = null;
      clientDialogVisible.value = true;
    };

    const showEditClientDialog = (clientId: number | string) => {
      const client = users.value.find((c) => c.id === clientId);
      if (client) {
        clientToEdit.value = { ...client };
        clientDialogVisible.value = true;
      }
    };

    const viewClient = (clientId: number | string) => {
      router.push(`/clients/${clientId}`);
    };

    async function upsertClient(newClient: UserInput): Promise<void> {
      try {
        const isNewUser = clientToEdit.value === null;
        const clientInput: UserInput = {
          id: newClient.id,
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone || "",
        };
        const createdUser = await upsertUser(clientInput);

        if (isNewUser) {
          usuarioCriado.value = isNewUser;
          temporaryPassword.value = createdUser.generatedPassword || "";
          newlyCreatedUsername.value = createdUser.name;

          toast.add({
            severity: "success",
            summary: "Cliente Adicionado",
            detail: "Novo cliente adicionado com sucesso.",
            life: 3000,
          });
        } else {
          clientToEdit.value = null;
          toast.add({
            severity: "success",
            summary: "Cliente Atualizado",
            detail: "Cliente atualizado com sucesso.",
            life: 3000,
          });
        }

        clientDialogVisible.value = false;

        await refetch();

        toast.add({
          severity: "success",
          summary: "Cliente Adicionado",
          detail: "Novo cliente adicionado com sucesso.",
          life: 3000,
        });
      } catch (error) {
        console.error("Erro ao adicionar cliente:", error);
        toast.add({
          severity: "error",
          summary: "Erro",
          detail: "Falha ao criar cliente. Por favor, tente novamente.",
          life: 3000,
        });
      }
    }

    function deleteClient(id: string): void {
      deleteUser(id)
        .then(() => {
          toast.add({
            severity: "success",
            summary: "Cliente Deletado",
            detail: "Cliente deletado com sucesso.",
            life: 3000,
          });
          refetch();
        })
        .catch((error) => {
          console.error("Erro ao deletar cliente:", error);
          toast.add({
            severity: "error",
            summary: "Erro",
            detail: "Falha ao deletar cliente. Por favor, tente novamente.",
            life: 3000,
          });
        });
    }

    // Watch for search query and filter changes to save to localStorage
    watch([searchQuery, filterStatus], ([newSearchQuery, newFilterStatus]) => {
      localStorage.setItem("clientSearchQuery", newSearchQuery);
      localStorage.setItem("clientFilterStatus", newFilterStatus);
    });

    // Watch for view mode changes to save to localStorage
    watch(viewMode, (newViewMode) => {
      localStorage.setItem("clientViewMode", newViewMode);
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
        viewMode.value =
          savedViewMode === "grid" || savedViewMode === "table"
            ? savedViewMode
            : "grid";
      }
    }

    loadSavedPreferences();

    return {
      searchQuery,
      filterStatus,
      isUpsertingClient,
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
      upsertClient,
      deleteClient,
      refetch,
      clientDialogVisible,
      clientToEdit,
      showAddClientDialog,
      showEditClientDialog,
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
