<script setup lang="ts">
import { computed, type PropType } from 'vue';
import type { Event } from '../types/Event';
import type { FilterOption } from '../types/FilterOption';

const props = defineProps({
  event: {
    type: Object as PropType<Event>,
    required: true,
  },
  countries: {
    type: Array as PropType<FilterOption[]>,
    required: true,
  },
  heading: {
    type: String,
    default: 'h3',
  }
})

const country = computed(() => {
  return props.countries
    .filter((c: FilterOption) => props.event.country.includes(c.value))
    .map((c: FilterOption) => c.name)
})
</script>

<template>
  <div
    class="
      flex
      flex-col
      gap-4
    "
  >
    <div
      class="
        flex
        flex-col
        gap-1
      "
    >
      <div
        class="
          font-semibold
          uppercase
        "
      >
        {{ event.dateFormatted }}
      </div>
      <component
        :is="heading"
        class="
          text-xl
          leading-tight
          font-bold
        "
      >
        {{ event.headline }}
      </component>
      <div v-if="country.length">
        <span v-if="event.city">
          {{ event.city }},
        </span>
        <span>
          {{ country.join(', ') }}
        </span>
      </div>
    </div>
    <div class="text-lg">
      {{ event.summary }}
    </div>
  </div>
</template>