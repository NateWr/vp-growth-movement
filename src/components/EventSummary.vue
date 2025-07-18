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
        3xl:gap-2
      "
    >
      <div
        class="
          font-semibold
          uppercase
          3xl:text-lg
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
          3xl:text-2xl
          3xl:leading-[1.1]
        "
      >
        {{ event.headline }}
      </component>
      <div v-if="country.length" class="3xl:text-lg">
        <span v-if="event.city">
          {{ event.city }},
        </span>
        <span>
          {{ country.join(', ') }}
        </span>
      </div>
    </div>
    <div class="text-lg 3xl:text-xl 3xl:leading-normal">
      {{ event.summary }}
    </div>
  </div>
</template>