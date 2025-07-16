<script setup lang="ts">
import Button from './Button.vue';
import IconFilters from './IconFilters.vue';
import IconSort from './IconSort.vue';

const props = defineProps({
  showResetFilters: {
    type: Boolean,
    required: true,
  },
  sortBy: {
    type: Boolean,
    required: true,
  }
})

const emit = defineEmits(['toggle-filters-panel', 'reset-filters', 'toggle-sort'])
</script>

<template>
  <div
    class="
      flex
      items-center
      justify-between
    "
  >
    <div class="flex items-center gap-4">
      <Button
        variant="black"
        @click="emit('toggle-filters-panel')"
      >
        <template #icon>
          <IconFilters aria-hidden="true" />
        </template>
        Filters
      </Button>
      <Button
        v-if="showResetFilters"
        size="sm"
        @click="emit('reset-filters')"
      >
        Reset
      </Button>
    </div>
    <div class="flex items-center gap-2">
      <button
        @click="emit('toggle-sort')"
      >
        <span class="sr-only">Sort by: {{ sortBy ? 'oldest' : 'recent' }}</span>
        <IconSort
          class="w-10 h-10"
          aria-hidden="true"
        />
      </button>
    </div>
  </div>
</template>