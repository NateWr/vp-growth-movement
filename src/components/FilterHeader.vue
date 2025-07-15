<script setup lang="ts">
import Button from './Button.vue';
import ButtonBlack from './ButtonBlack.vue';
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
    <h2 class="sr-only">Search, filter, and sort</h2>
    <div class="flex items-center gap-2">
      <ButtonBlack
        @click="emit('toggle-filters-panel')"
      >
        <IconFilters aria-hidden="true" />
        <span>
          Filters
        </span>
      </ButtonBlack>
      <Button
        v-if="showResetFilters"
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