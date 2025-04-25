<template>
  <a-row :gutter="[16, 16]">
    <a-col v-for="client in clients" :key="client.id" :xs="24" :md="12" :lg="8">
      <ClientCard
        :client="client"
        @view-client="$emit('view-client', client.id)"
        @delete-client="$emit('delete-client', client.id)"
      />
    </a-col>
  </a-row>
</template>

<script>
import ClientCard from "./ClientCard.vue";

export default {
  name: "ClientCardGrid",
  components: {
    ClientCard,
  },
  props: {
    clients: {
      type: Array,
      required: true,
    },
  },
  emits: ["view-client", "delete-client"],
};
</script>
