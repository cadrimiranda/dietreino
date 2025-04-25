<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    <div
      v-for="i in count"
      :key="i"
      class="border rounded-lg shadow-sm overflow-hidden"
    >
      <a-skeleton-image active :style="{ height: '120px', width: '100%' }" />
      <div class="p-4">
        <div class="flex items-center mb-3">
          <a-skeleton-avatar active :size="48" class="mr-3" />
          <div class="flex-1">
            <a-skeleton
              active
              :paragraph="false"
              :title="{ width: '70%' }"
              class="mb-2"
            />
            <a-skeleton active :paragraph="false" :title="{ width: '40%' }" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2 mb-3">
          <a-skeleton active :paragraph="false" />
          <a-skeleton active :paragraph="false" />
        </div>
        <a-divider />
        <div class="flex justify-between">
          <a-skeleton active :paragraph="false" :title="{ width: '30%' }" />
          <a-skeleton active :paragraph="false" :title="{ width: '25%' }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClientSkeletonList",
  props: {
    count: {
      type: Number,
      default: 6,
    },
  },
};
</script>
