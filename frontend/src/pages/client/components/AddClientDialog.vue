<template>
  <a-modal
    v-model:visible="visibleModel"
    title="Add New Client"
    :maskClosable="false"
    :width="450"
    @cancel="closeDialog"
  >
    <form @submit.prevent="addClient">
      <div class="form-container">
        <div class="mb-4">
          <a-form-item label="Full Name" required>
            <a-input v-model:value="newClient.name" placeholder="John Doe" />
          </a-form-item>
        </div>

        <div class="mb-4">
          <a-form-item label="Email" required>
            <a-input
              v-model:value="newClient.email"
              type="email"
              placeholder="john@example.com"
            />
          </a-form-item>
        </div>

        <div class="mb-4">
          <a-form-item label="Phone">
            <a-input
              v-model:value="newClient.phone"
              placeholder="+1 (123) 456-7890"
            />
          </a-form-item>
        </div>
      </div>
    </form>

    <template #footer>
      <a-button @click="closeDialog"> Cancel </a-button>
      <a-button type="primary" :loading="isAddingModel" @click="addClient">
        Save Client
      </a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from "vue";

interface NewClient {
  name: string;
  email: string;
  phone: string;
}

interface MockUser {
  id: number;
  name: string;
  email: string;
  generatedPassword: string;
  createdAt: string;
  updatedAt: string;
  phone?: string;
}

export default defineComponent({
  name: "AddClientDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    isAdding: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:visible", "update:is-adding", "client-added"],
  setup(props, { emit }) {
    const newClient = ref<NewClient>({
      name: "",
      email: "",
      phone: "",
    });

    const visibleModel = computed({
      get: () => props.visible,
      set: (value: boolean) => emit("update:visible", value),
    });

    const isAddingModel = computed({
      get: () => props.isAdding,
      set: (value: boolean) => emit("update:is-adding", value),
    });

    function closeDialog(): void {
      emit("update:visible", false);
    }

    async function addClient(): Promise<void> {
      try {
        // Basic validation
        if (!newClient.value.name || !newClient.value.email) {
          // In Ant Design, you would typically use form validation
          // This is a simplified version
          return;
        }

        emit("update:is-adding", true);

        // Mock user creation - in a real implementation, this would be done by the parent component
        const mockUser: MockUser = {
          id: Math.floor(Math.random() * 1000),
          name: newClient.value.name,
          email: newClient.value.email,
          generatedPassword: "Senha@F0rte123",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          phone: newClient.value.phone,
        };

        // Emit event to parent component
        emit("client-added", mockUser);

        // Clear form
        newClient.value = { name: "", email: "", phone: "" };

        // Close the dialog
        closeDialog();
      } catch (error) {
        console.error("Error in addClient:", error);
        // Here you could show an error message with Ant Design's message component
      } finally {
        emit("update:is-adding", false);
      }
    }

    return {
      newClient,
      visibleModel,
      isAddingModel,
      addClient,
      closeDialog,
    };
  },
});
</script>

<style scoped>
.form-container {
  padding: 0 8px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>
