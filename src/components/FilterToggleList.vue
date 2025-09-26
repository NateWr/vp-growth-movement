<script setup lang="ts">
import type { PropType } from 'vue';
import type { FilterOption } from '../types/FilterOption';
import Button from './Button.vue';
import IconMinus from './IconMinus.vue';
import IconPlus from './IconPlus.vue';

const props = defineProps({
  disabled: {
    type: Array as PropType<FilterOption[]>,
    default: [],
  },
  options: {
    type: Array as PropType<FilterOption[]>,
    required: true,
  },
  selected: {
    type: Array as PropType<string[]>,
    required: true,
  }
})

const emit = defineEmits<{
  (e: 'toggle', value: string): void
}>()
</script>

<template>
  <div class="filter-toggle-list flex flex-wrap gap-2">
    <Button
      v-for="({name, value}) in options"
      :key="value"
      :disabled="disabled.find((o: FilterOption) => o.value === value)"
      size="sm"
      :variant="selected.includes(value) ? 'blue' : ''"
      @click="emit('toggle', value)"
    >
      <template #icon>
        <IconMinus v-if="selected.includes(value)" aria-hidden="true" />
        <IconPlus v-else aria-hidden="true" />
      </template>
      {{ name }}
    </Button>
    <slot />
  </div>
</template>

<style>
</style>