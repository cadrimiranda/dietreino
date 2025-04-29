<template>
  <a-modal
    v-model:visible="visibleModel"
    :title="isEditing ? 'Edit Client' : 'Add New Client'"
    :maskClosable="false"
    :width="450"
    @cancel="closeDialog"
  >
    <form @submit.prevent="saveClient">
      <div class="form-container">
        <div class="mb-4">
          <a-form-item label="Full Name" required>
            <a-input v-model:value="clientData.name" placeholder="John Doe" />
          </a-form-item>
        </div>

        <div class="mb-4">
          <a-form-item label="Email" required>
            <a-input
              v-model:value="clientData.email"
              type="email"
              placeholder="john@example.com"
            />
          </a-form-item>
        </div>

        <div class="mb-4">
          <a-form-item label="Phone">
            <a-input
              v-model:value="clientData.phone"
              placeholder="+1 (123) 456-7890"
            />
          </a-form-item>
        </div>
      </div>
    </form>

    <template #footer>
      <a-button @click="closeDialog"> Cancel </a-button>
      <a-button type="primary" :loading="isProcessingModel" @click="saveClient">
        {{ isEditing ? "Update Client" : "Save Client" }}
      </a-button>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { IUserEntity } from "@/composables/useUsers";
import { message } from "ant-design-vue";
import { ref, computed, defineComponent, watch } from "vue";

export default defineComponent({
  name: "ClientDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    isProcessing: {
      type: Boolean,
      default: false,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    clientToEdit: {
      type: Object as () => IUserEntity | null,
      default: null,
    },
  },
  emits: ["update:visible", "update:is-processing", "client-saved"],
  setup(props, { emit }) {
    const clientData = ref<Partial<IUserEntity>>({
      name: "",
      email: "",
      phone: "",
    });

    // Watch for changes to clientToEdit and update the form accordingly
    watch(
      () => props.clientToEdit,
      (newVal) => {
        if (newVal) {
          clientData.value = {
            id: newVal.id,
            name: newVal.name,
            email: newVal.email,
            phone: newVal.phone || "",
          };
        } else {
          // Reset form when not editing
          resetForm();
        }
      },
      { deep: true, immediate: true }
    );

    // Watch visibility changes to reset form when dialog closes
    watch(
      () => props.visible,
      (newVal) => {
        if (!newVal && !props.isEditing) {
          resetForm();
        }
      }
    );

    const visibleModel = computed({
      get: () => props.visible,
      set: (value: boolean) => emit("update:visible", value),
    });

    const isProcessingModel = computed({
      get: () => props.isProcessing,
      set: (value: boolean) => emit("update:is-processing", value),
    });

    function resetForm(): void {
      clientData.value = {
        name: "",
        email: "",
        phone: "",
      };
    }

    function closeDialog(): void {
      emit("update:visible", false);
    }

    async function saveClient(): Promise<void> {
      try {
        // Validation
        if (!clientData.value.name?.trim()) {
          message.error(
            props.isEditing ? "Name is required" : "Nome é obrigatório"
          );
          return;
        }

        if (!clientData.value.email?.trim()) {
          message.error(
            props.isEditing ? "Email is required" : "Email é obrigatório"
          );
          return;
        }

        emit("update:is-processing", true);

        // Pass data to parent component
        emit("client-saved", {
          id: clientData.value.id, // Will be undefined for new clients
          name: clientData.value.name.trim(),
          email: clientData.value.email.trim(),
          phone: clientData.value.phone?.trim() || "",
        });

        // Parent component will handle closing the dialog and resetting after saving
      } catch (error) {
        console.error(
          `Error in ${props.isEditing ? "updateClient" : "addClient"}:`,
          error
        );
        emit("update:is-processing", false);
        message.error(
          props.isEditing
            ? "Error updating client"
            : "Erro ao processar dados do cliente"
        );
      }
    }

    return {
      clientData,
      visibleModel,
      isProcessingModel,
      saveClient,
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
