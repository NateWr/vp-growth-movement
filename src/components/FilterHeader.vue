<script setup lang="ts">
import Button from './Button.vue';
import IconFilters from './IconFilters.vue';
import SortByButton from './SortByButton.vue';

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
    <SortByButton
      class="flex items-center px-2"
      :sort-by="sortBy"
      @click="emit('toggle-sort')"
    />
  </div>
</template>