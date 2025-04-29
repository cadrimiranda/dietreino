<template>
  <a-dropdown placement="bottomRight">
    <template #overlay>
      <a-menu @click="handleMenuClick" class="rounded-lg">
        <a-menu-item key="edit" class="px-4 py-2">
          <edit-outlined class="mr-2" /> Edit Client
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item key="delete" class="px-4 py-2 text-red-500">
          <delete-outlined class="mr-2" /> Delete Client
        </a-menu-item>
      </a-menu>
    </template>
    <a-button
      type="text"
      shape="circle"
      class="flex items-center justify-center"
    >
      <template #icon><more-outlined /></template>
    </a-button>
  </a-dropdown>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Modal } from "ant-design-vue";
import {
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons-vue";

export default defineComponent({
  components: {
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
  },
  props: {
    clientId: {
      type: [Number, String],
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
  },
  emits: ["edit-client", "delete-client"],
  setup(props, { emit }) {
    const handleMenuClick = ({ key }: { key: string }) => {
      if (key === "edit") {
        emit("edit-client", props.clientId);
      } else if (key === "delete") {
        showDeleteConfirm();
      }
    };

    const showDeleteConfirm = () => {
      Modal.confirm({
        title: "Confirmar Exclusão",
        content: `Você tem certeza de que deseja excluir ${props.clientName}?`,
        okText: "Excluir",
        okType: "danger",
        cancelText: "Cancelar",
        onOk: () => {
          emit("delete-client", props.clientId);
        },
      });
    };

    return {
      handleMenuClick,
    };
  },
});
</script>
