<script setup lang="ts">
import type { PropType } from 'vue';
import type { FilterOption } from '../types/FilterOption';
import Button from './Button.vue';
import ButtonBlack from './ButtonBlack.vue';
import IconMinus from './IconMinus.vue';
import IconPlus from './IconPlus.vue';

const props = defineProps({
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
    <component
      v-for="({name, value}) in options"
      :key="value"
      :is="selected.includes(value) ? ButtonBlack : Button"
      @click="emit('toggle', value)"
    >
      <template v-if="selected.includes(value)">
        <IconMinus aria-hidden="true" />
      </template>
      <template v-else>
        <IconPlus aria-hidden="true" />
      </template>
      {{ name }}
    </component>
    <slot />
  </div>
</template>

<style>
.filter-toggle-list button {
  font-size: 14px;
  padding: 0.25rem 0.5rem;
}
</style>