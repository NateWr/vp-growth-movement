<script setup lang="ts">
import IconSort from './IconSort.vue';

const props = defineProps({
  sortBy: {
    type: Boolean,
    required: true,
  }
})
</script>

<template>
  <button
    class="flex items-center"
  >
    <IconSort
      class="w-10 h-10 transition-all duration-300"
      :class="[
        sortBy ? '-rotate-180' : ''
      ]"
      aria-hidden="true"
    />
    <span class="text-left text-sm font-medium leading-4 uppercase">
      Sort<br>
      by date
      <span class="sr-only">
        current: {{ sortBy ? 'oldest first' : 'recent first' }}
      </span>
    </span>
  </button>
</template>