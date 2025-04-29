<template>
  <a-row :gutter="[16, 16]">
    <a-col v-for="client in clients" :key="client.id" :xs="24" :md="12" :lg="8">
      <ClientCard
        :client="client"
        @view-client="$emit('view-client', client.id)"
        @delete-client="$emit('delete-client', client.id)"
        @edit-client="$emit('edit-client', client.id)"
      />
    </a-col>
  </a-row>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import ClientCard from "@/pages/client/components/ClientCard.vue";
import { IClientData } from "./types";

export default defineComponent({
  name: "ClientCardGrid",
  components: {
    ClientCard,
  },
  props: {
    clients: {
      type: Array as PropType<IClientData[]>,
      required: true,
    },
  },
  emits: ["view-client", "delete-client", "edit-client"],
});
</script>
