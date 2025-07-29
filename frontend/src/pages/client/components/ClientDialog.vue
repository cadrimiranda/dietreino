<template>
  <a-modal
    v-model:visible="visibleModel"
    :title="isEditing ? 'Edit Client' : 'Add New Client'"
    :maskClosable="false"
    :width="450"
    @cancel="closeDialog"
  >
    <a-form @submit.prevent="saveClient" layout="vertical">
      <a-form-item
        label="Full Name"
        required
        :rules="[
          {
            required: true,
            message: 'Por favor insira um nome',
          },
          {
            min: 6,
            message: 'O nome deve ter pelo menos 6 caracteres',
          },
        ]"
      >
        <a-input v-model:value="clientData.name" placeholder="John Doe" />
      </a-form-item>

      <a-form-item
        label="Email"
        required
        :rules="[
          { required: true, message: 'Por favor insira seu email' },
          { type: 'email', message: 'Email inválido' },
        ]"
        :validate-status="emailValidationStatus"
        :help="emailValidationMessage"
      >
        <a-input
          v-model:value="clientData.email"
          type="email"
          placeholder="john@example.com"
          @input="validateEmailRealTime"
        />
      </a-form-item>

      <a-form-item
        label="Phone"
        :rules="[
          {
            required: true,
            message: 'Por favor insira um número de celular',
          },
          {
            min: 11,
            message: 'O número deve ter pelo menos 11 caracteres',
          },
        ]"
      >
        <a-input
          v-model:value="clientData.phone"
          placeholder="(11) 99999-9999"
          @input="formatPhoneNumber"
          @keypress="onlyNumbers"
          maxlength="15"
        />
      </a-form-item>
    </a-form>

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
import { StringUtils } from "@/utils/stringUtils";
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

    // Email validation states
    const emailValidationStatus = ref<"" | "success" | "warning" | "error" | "validating">("");
    const emailValidationMessage = ref("");

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
          // Format phone number when loading for editing
          if (newVal.phone) {
            formatPhoneNumber();
          }
          // Validate email when loading
          if (newVal.email) {
            validateEmailRealTime();
          }
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
      emailValidationStatus.value = "";
      emailValidationMessage.value = "";
    }

    function validateEmailRealTime(): void {
      const email = clientData.value.email?.trim() || "";
      
      if (email === "") {
        emailValidationStatus.value = "";
        emailValidationMessage.value = "";
        return;
      }

      if (StringUtils.isValidEmail(email)) {
        emailValidationStatus.value = "success";
        emailValidationMessage.value = "Email válido";
      } else {
        emailValidationStatus.value = "error";
        emailValidationMessage.value = "Formato de email inválido";
      }
    }

    function onlyNumbers(event: KeyboardEvent): void {
      // Allow backspace, delete, tab, escape, enter
      if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
          // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (event.keyCode === 65 && event.ctrlKey === true) ||
          (event.keyCode === 67 && event.ctrlKey === true) ||
          (event.keyCode === 86 && event.ctrlKey === true) ||
          (event.keyCode === 88 && event.ctrlKey === true)) {
        return;
      }
      // Ensure that it is a number and stop the keypress
      if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
        event.preventDefault();
      }
    }

    function formatPhoneNumber(): void {
      const phone = clientData.value.phone || "";
      // Remove all non-digit characters
      const numbers = phone.replace(/\D/g, "");
      
      // Apply formatting
      let formatted = "";
      if (numbers.length > 0) {
        if (numbers.length <= 2) {
          formatted = `(${numbers}`;
        } else if (numbers.length <= 7) {
          formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        } else if (numbers.length <= 11) {
          formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        } else {
          // Limit to 11 digits
          formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
        }
      }
      
      clientData.value.phone = formatted;
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

        if (!StringUtils.isValidEmail(clientData.value.email.trim())) {
          message.error(
            props.isEditing
              ? "Invalid email format"
              : "Formato de email inválido"
          );
          return;
        }

        emit("update:is-processing", true);

        // Pass data to parent component
        emit("client-saved", {
          id: clientData.value.id, // Will be undefined for new clients
          name: clientData.value.name.trim(),
          email: clientData.value.email.trim(),
          phone: clientData.value.phone?.replace(/\D/g, "") || "", // Remove formatting, keep only numbers
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
      emailValidationStatus,
      emailValidationMessage,
      validateEmailRealTime,
      onlyNumbers,
      formatPhoneNumber,
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
